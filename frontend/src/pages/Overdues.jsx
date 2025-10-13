import MenuLayout from "../components/MenuLayout";
import GenericTable from "../components/GenericTable";
import { useState, useMemo, useEffect } from "react";
import overduesMock from "../mocks/overdues";
import paymentsMock from "../mocks/payments";
import { apiGet, apiPost } from "../apis/client"; 

export default function Overdues() {
  const [overdues, setOverdues] = useState(overduesMock);
  const [config, setConfig] = useState({ dailyRate: 0.05, startAfterDays: 10 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await apiGet("/overdues/config");
        
        setConfig({
          dailyRate: data.rate ?? 0.05,
          startAfterDays: data.startDay ?? 10,
          mode: data.mode ?? "simple",
        });
      } catch (err) {
        console.error("Error al obtener configuración:", err);
        alert("Error al cargar configuración de mora");
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleUpdateConfig = async (patch) => {
    const next = { ...config, ...patch };
    setConfig(next);
    try {
      await apiPost("/overdues/config?_method=PUT", {
        rate: next.dailyRate,
        startDay: next.startAfterDays,
        mode: next.mode ?? "simple",
      });
    } catch (err) {
      console.error("Error al guardar configuración:", err);
      alert("Error al guardar configuración de mora");
    }
  };

  const today = new Date();

  const rows = useMemo(() => {
    return overdues.map((o) => {
      const due = new Date(o.dueDate);
      const diffMs = today - due;
      const rawDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

      const paid = paymentsMock
        .filter((p) => p.unit === o.unit)
        .reduce((s, p) => s + (p.amount || 0), 0);

      const principalOutstanding = Math.max(0, o.originalAmount - paid);
      const daysOverdue = Math.max(0, rawDays - (config.startAfterDays || 0));
      const interest = Math.round(principalOutstanding * (config.dailyRate || 0) * daysOverdue);
      const totalWithMora = principalOutstanding + interest;

      return {
        id: o.id,
        unit: o.unit,
        dueDate: o.dueDate,
        originalAmount: o.originalAmount,
        paid,
        principalOutstanding,
        daysOverdue,
        interest,
        totalWithMora,
      };
    });
  }, [overdues, today, config]);

  const handleMarkPaid = (id) => setOverdues((prev) => prev.filter((o) => o.id !== id));

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

