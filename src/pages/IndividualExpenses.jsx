import MenuLayout from "../components/MenuLayout";
import GenericTable from "../components/GenericTable";
import { useState, useMemo } from "react";
import individualExpensesMock from "../mocks/individualExpenses";

export default function IndividualExpenses() {
  const [expenses, setExpenses] = useState(individualExpensesMock);

  const rows = useMemo(() => expenses.map(e => ({
    id: e.id,
    unit: e.unit,
    description: e.description,
    amount: e.amount,
    date: e.date,
  })), [expenses]);

  const markPaid = (id) => setExpenses(prev => prev.filter(e => e.id !== id));

  return (
    <MenuLayout>
      <div className="p-3">
        <h3>Gastos Particulares</h3>
        <p>Aquí podrás ver los gastos particulares de cada persona.</p>

        {rows.length === 0 ? (
          <p>No hay gastos particulares registrados.</p>
        ) : (
          <GenericTable
            data={rows}
            columns={[
              { key: 'unit', label: 'Unidad' },
              { key: 'description', label: 'Descripción' },
              { key: 'date', label: 'Fecha' },
              { key: 'amount', label: 'Monto', formatFn: (v) => v.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }) },
              { key: 'actions', label: 'Acciones', formatFn: (_, row) => <button className="btn btn-sm btn-success" onClick={() => markPaid(row.id)}>Marcar como pagado</button> },
            ]}
            emptyMsg="No hay gastos particulares."
          />
        )}
      </div>
    </MenuLayout>
  );
}
