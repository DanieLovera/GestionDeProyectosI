import MenuLayout from "../components/MenuLayout";
import { useState, useMemo } from "react";
import GenericTable from "../components/GenericTable";
import feesMock from "../mocks/fees";

export default function Fees() {
  const [fees, setFees] = useState(feesMock);
  const COMMISSION_RATE = 0.1; // 10%

  const rows = useMemo(() => {
    return fees.map((f) => {
      const commission = Math.round(f.baseAmount * COMMISSION_RATE);
      return {
        id: f.id,
        description: f.description,
        baseAmount: f.baseAmount,
        commission,
        date: f.date,
      };
    });
  }, [fees]);

  const markPaid = (id) => setFees((prev) => prev.filter((f) => f.id !== id));

  return (
    <MenuLayout>
      <div className="p-3">
        <h3>Comisiones</h3>
        <p>Aquí podrás ver todas las comisiones aplicadas.</p>

        {rows.length === 0 ? (
          <p>No hay comisiones registradas.</p>
        ) : (
          <GenericTable
            data={rows}
            columns={[
              { key: "description", label: "Descripción" },
              { key: "date", label: "Fecha" },
              {
                key: "baseAmount",
                label: "Base",
                formatFn: (v) => v.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }),
              },
              {
                key: "commission",
                label: "Comisión",
                formatFn: (v) => v.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }),
              },
              {
                key: "actions",
                label: "Acciones",
                formatFn: (_, row) => (
                  <button className="btn btn-sm btn-success" onClick={() => markPaid(row.id)}>Marcar como pagado</button>
                ),
              },
            ]}
            emptyMsg="No hay comisiones registradas."
          />
        )}
      </div>
    </MenuLayout>
  );
}
