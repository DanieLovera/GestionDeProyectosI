import MenuLayout from "../components/MenuLayout";
import GenericTable from "../components/GenericTable";
import { useState, useMemo, useEffect, useRef } from "react";
import { apiGet, apiPut } from "../apis/client";
import { getPayments, addPayment } from "../apis/payments";
import { loadMoraConfig, saveMoraConfig } from "../constants/moraConfig"; // <-- added
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function Overdues() {
  const queryClient = useQueryClient();
  const [config, setConfig] = useState(() => loadMoraConfig());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const cfg = await apiGet("/overdues/config");
        const mapped = {
          dailyRate: typeof cfg?.rate === "number" ? cfg.rate : loadMoraConfig().dailyRate,
          startAfterDays: typeof cfg?.startDay === "number" ? cfg.startDay : loadMoraConfig().startAfterDays,
          mode: cfg?.mode ?? loadMoraConfig().mode ?? "simple",
        };
        setConfig(mapped);
        // persist a local copy so UI still works if backend later unavailable
        saveMoraConfig(mapped);
      } catch (err) {
        console.error("Error al obtener configuración:", err);
        // usar fallback local si falla el backend (permite pruebas sin auth)
        setConfig(loadMoraConfig());
        // no bloquear la UI con alert, mostrar en consola
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // useQuery para overdues y payments (react-query maneja cache e invalidación)
  const {
    data: overdues = [],
    isLoading: isLoadingOverdues,
    isError: isErrorOverdues,
  } = useQuery({
    queryKey: ["overdues"],
    queryFn: () => apiGet("/overdues"),
    enabled: !loading,
  });

  const {
    data: payments = [],
    isLoading: isLoadingPayments,
    isError: isErrorPayments,
  } = useQuery({
    queryKey: ["payments"],
    queryFn: () => getPayments(),
    enabled: !loading,
  });

  const handleUpdateConfig = async (patch) => {
    const next = { ...config, ...patch };
    setConfig(next);
    // guardar localmente inmediatamente para pruebas y persistencia
    saveMoraConfig(next);
    try {
      await apiPut("/overdues/config", {
        rate: next.dailyRate,
        startDay: next.startAfterDays,
        mode: next.mode ?? "simple",
      });
    } catch (err) {
      console.error("Error al guardar configuración:", err);
      // si falla el PUT, dejar la configuración local (rollback opcional)
      alert("Error al guardar configuración de mora (backend)");
    }
  };

  const today = new Date();

  const rows = useMemo(() => {
    // Mapear overdues preservando id numérico de unidad (si existe) y etiqueta amigable
    return (overdues || []).map((o) => {
      const due = new Date(o.dueDate || o.date || o.due || new Date());
      const diffMs = today - due;
      const rawDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

      // normalizar unidad: preferir unitId / unit_id numérico cuando exista,
      // y conservar unitLabel para mostrar en UI
      const unitId = o.unitId ?? o.unit_id ?? o.unit ?? null;
      const unitLabel = o.unit ?? o.unit_name ?? (unitId ? String(unitId) : "—");

      const paid = (payments || [])
        .filter((p) => String(p.unitId ?? p.unit ?? p.unit_id ?? "") === String(unitId ?? unitLabel))
        .reduce((s, p) => s + (p.amount || 0), 0);

      const originalAmount = o.originalAmount ?? o.base ?? o.amount ?? 0;
      const principalOutstanding = Math.max(0, originalAmount - paid);
      const daysOverdue = Math.max(0, rawDays - (config.startAfterDays || 0));
      const interest = Math.round(principalOutstanding * (config.dailyRate || 0) * daysOverdue);
      const totalWithMora = principalOutstanding + interest;

      return {
        id: o.id,
        unitId: unitId ?? null,
        unitLabel,
        unit: unitLabel,
        dueDate: o.dueDate || o.date || o.due,
        originalAmount,
        paid,
        principalOutstanding,
        daysOverdue,
        interest,
        totalWithMora,
      };
    });
  }, [overdues, payments, today, config]);

  // mutación para crear pago + eliminación de overdue en backend
  const addPaymentMutation = useMutation({
    mutationFn: (payload) => addPayment(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries(["overdues"]);
      const previous = queryClient.getQueryData(["overdues"]) || [];
      queryClient.setQueryData(["overdues"], previous.filter((o) => o.id !== payload.overdueId));
      return { previous };
    },
    onError: (err, payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["overdues"], context.previous);
      }
      console.error("Error adding payment:", err);
      alert("No se pudo registrar el pago");
    },
    onSuccess: (saved) => {
      // asegurar que las listas de pagos y moras se refresquen en toda la app
      queryClient.invalidateQueries(["payments"]);
      queryClient.invalidateQueries(["overdues"]);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["payments"]);
      queryClient.invalidateQueries(["overdues"]);
    },
  });

  const handleMarkPaid = async (id) => {
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    const uid = row.unitId ?? row.unitLabel;
    const payload = {
      unitId: uid,
      unit_id: uid,
      amount: Number(row.totalWithMora) || 0,
      date: new Date().toISOString().slice(0, 10),
      method: "manual",
      overdueId: row.id,
    };
    try {
      await addPaymentMutation.mutateAsync(payload);
      // local UI ya se actualiza por onMutate / invalidación
    } catch (err) {
      console.error("Error marking paid:", err);
      const msg = err?.response?.data?.message || err?.message || "No se pudo marcar como pagado";
      alert(msg);
    }
  };

  // evitar llamar varias veces al endpoint en re-renders
  const generatedRef = useRef(false);

  // generar automáticamente overdues para el mes actual la primera vez que se carga la página
  useEffect(() => {
    if (loading || generatedRef.current) return;
    const gen = async () => {
      try {
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const year = String(now.getFullYear());
        const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000";
        const consortium = (typeof window !== "undefined" && localStorage.getItem("consortium")) || "";
        const res = await fetch(`${apiBase.replace(/\/$/, "")}/overdues/generate?month=${month}&year=${year}`, {
          method: "POST",
          headers: { "X-Consortium": consortium }
        });
        if (res.ok) {
          // opcional: leer respuesta para logs
          const json = await res.json().catch(() => null);
          if (json && json.generated) {
            console.log(`Generadas ${json.generated} moras para ${month}/${year}`);
          }
          // forzar recarga de moras y pagos
          queryClient.invalidateQueries(["overdues"]);
          queryClient.invalidateQueries(["payments"]);
        } else {
          console.warn("No se pudo generar moras automáticamente:", res.status);
        }
      } catch (err) {
        console.error("Error al invocar /overdues/generate:", err);
      } finally {
        generatedRef.current = true;
      }
    };
    gen();
  }, [loading, queryClient]);

  const isAnyLoading = loading || isLoadingOverdues || isLoadingPayments;

  if (loading) return <MenuLayout><p>Cargando configuración...</p></MenuLayout>;

  return (
    <MenuLayout>
      <div className="p-3">
        <h3>Moras</h3>
        <p>Aquí se listarán todas las deudas vencidas y moras.</p>

        <div className="mb-3 d-flex gap-2 align-items-center">
          <label className="small me-2">Tasa diaria (%):</label>
          <input
            type="number"
            step="0.001"
            className="form-control form-control-sm"
            style={{ width: 120 }}
            value={(config.dailyRate * 100).toFixed(3)}
            onChange={(e) => handleUpdateConfig({ dailyRate: parseFloat(e.target.value) / 100 })}
          />

          <label className="small ms-3 me-2">Días de gracia:</label>
          <input
            type="number"
            className="form-control form-control-sm"
            style={{ width: 80 }}
            value={config.startAfterDays}
            onChange={(e) =>
              handleUpdateConfig({ startAfterDays: parseInt(e.target.value || "0") })
            }
          />
        </div>

        {isAnyLoading ? (
          <p>Cargando...</p>
        ) : rows.length === 0 ? (
          <p>No hay deudas vencidas.</p>
        ) : (
          <GenericTable
            data={rows}
            columns={[
              { key: "unit", label: "Unidad" },
              { key: "dueDate", label: "Vencimiento" },
              {
                key: "originalAmount",
                label: "Monto original",
                formatFn: (v) =>
                  v.toLocaleString("es-AR", { style: "currency", currency: "ARS" }),
              },
              {
                key: "paid",
                label: "Pagado",
                formatFn: (v) =>
                  v.toLocaleString("es-AR", { style: "currency", currency: "ARS" }),
              },
              {
                key: "principalOutstanding",
                label: "Saldo impago",
                formatFn: (v) =>
                  v.toLocaleString("es-AR", { style: "currency", currency: "ARS" }),
              },
              { key: "daysOverdue", label: "Días vencidos" },
              {
                key: "interest",
                label: "Interés (mora)",
                formatFn: (v) =>
                  v.toLocaleString("es-AR", { style: "currency", currency: "ARS" }),
              },
              {
                key: "totalWithMora",
                label: "Total con mora",
                formatFn: (v) =>
                  v.toLocaleString("es-AR", { style: "currency", currency: "ARS" }),
              },
              {
                key: "actions",
                label: "Acciones",
                formatFn: (_, row) => (
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => handleMarkPaid(row.id)}
                  >
                    Marcar como pagado
                  </button>
                ),
              },
            ]}
            emptyMsg="No hay moras registradas."
          />
        )}
      </div>
    </MenuLayout>
  );
}

