import MenuLayout from "../components/MenuLayout";
import GenericTable from "../components/GenericTable";
import { useState, useMemo, useEffect } from "react";
import { apiGet, apiPut } from "../apis/client";
import { getPayments, addPayment } from "../apis/payments";
import { loadMoraConfig, saveMoraConfig } from "../constants/moraConfig"; // <-- added

export default function Overdues() {
  const [overdues, setOverdues] = useState([]);
  const [payments, setPayments] = useState([]);
  // load config from localStorage as initial fallback (keeps UI testable)
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ods, pays] = await Promise.all([apiGet("/overdues").catch(() => []), getPayments()]);
        setOverdues(ods || []);
        setPayments(pays || []);
      } catch (err) {
        console.error("Error fetching overdues/payments:", err);
        alert("Error al cargar moras o pagos");
      }
    };
    fetchData();
  }, []);

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
    return overdues.map((o) => {
      const due = new Date(o.dueDate || o.date || o.due || new Date());
      const diffMs = today - due;
      const rawDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

      // normalizar unidad: preferir unitId / unit_id numérico cuando exista,
      // y conservar unitLabel para mostrar en UI
      const unitId = o.unitId ?? o.unit_id ?? o.unit_id ?? o.unit ?? null;
      const unitLabel = o.unit ?? o.unit_name ?? (unitId ? String(unitId) : "—");

      const paid = payments
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
      overdueId: row.id, // <-- enviar overdueId para que backend lo elimine
    };
    try {
      const saved = await addPayment(payload);
      const savedPayment = saved && (saved.id || saved.amount)
        ? { id: saved.id ?? `local-${Date.now()}`, unitId: saved.unitId ?? saved.unit_id ?? uid, amount: saved.amount ?? payload.amount, date: saved.date ?? payload.date, method: saved.method ?? payload.method }
        : { id: `local-${Date.now()}`, unitId: uid, amount: payload.amount, date: payload.date, method: payload.method };
      // confirmar eliminación localmente: filtrar por overdue id
      setOverdues((prev) => prev.filter((o) => o.id !== id));
      setPayments((prev) => [...prev, savedPayment]);
    } catch (err) {
      console.error("Error marking paid:", err);
      const msg = err?.response?.data?.message || err?.message || "No se pudo marcar como pagado";
      alert(msg);
    }
  };

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

        {rows.length === 0 ? (
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

