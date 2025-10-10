import MenuLayout from "../components/MenuLayout";
import GenericTable from "../components/GenericTable";
import { useState, useMemo } from "react";
import overduesMock from "../mocks/overdues";

export default function Overdues() {
  const [overdues, setOverdues] = useState(overduesMock);

  // mora rate: 0.5% per day (demo)
  const MORa_DAILY_RATE = 0.005;

  const today = new Date();

  const rows = useMemo(() => {
    return overdues.map((o) => {
      const due = new Date(o.dueDate);
      const diffMs = today - due;
      const daysOverdue = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      const interest = Math.round(o.originalAmount * MORa_DAILY_RATE * daysOverdue);
      const totalWithMora = o.originalAmount + interest;
      return {
        id: o.id,
        unit: o.unit,
        dueDate: o.dueDate,
        originalAmount: o.originalAmount,
        daysOverdue,
        interest,
        totalWithMora,
      };
    });
  }, [overdues, today]);

  const handleMarkPaid = (id) => {
    setOverdues((prev) => prev.filter((o) => o.id !== id));
  };

  return (
    <MenuLayout>
      <div className="p-3">
        <h3>Moras</h3>
        <p>Aquí se listarán todas las deudas vencidas y moras.</p>

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
                formatFn: (v) => v.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }),
              },
              { key: "daysOverdue", label: "Días vencidos" },
              {
                key: "interest",
                label: "Interés (mora)",
                formatFn: (v) => v.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }),
              },
              {
                key: "totalWithMora",
                label: "Total con mora",
                formatFn: (v) => v.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }),
              },
              {
                key: "actions",
                label: "Acciones",
                formatFn: (_, row) => (
                  <button className="btn btn-sm btn-success" onClick={() => handleMarkPaid(row.id)}>Marcar como pagado</button>
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
