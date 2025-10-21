import MenuLayout from "../components/MenuLayout";
import GenericTable from "../components/GenericTable";
import { useState, useMemo, useEffect } from "react";
import { parseISO, format } from "date-fns";
import { es } from "date-fns/locale";
import { getIndividualExpenses, deleteIndividualExpense } from "../apis/individualExpenses";

export default function IndividualExpenses() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetch = async () => {
        setLoading(true);
        try {
          const data = await getIndividualExpenses();
          setExpenses(data || []);
        } catch (err) {
          console.error("Error fetching individual expenses:", err);
          alert("Error al cargar gastos particulares");
        } finally {
          setLoading(false);
        }
      };
      fetch();
    }, []);

    const rows = useMemo(
        () =>
            expenses.map((e) => ({
                id: e.id,
                unit: e.unit || e.unitId,
                description: e.description,
                amount: e.amount,
                date: e.date,
            })),
        [expenses]
    );

    const markPaid = async (id) => {
      try {
        await deleteIndividualExpense(id);
        setExpenses((prev) => prev.filter((e) => e.id !== id));
      } catch (err) {
        console.error("Error marking individual expense paid:", err);
        alert("No se pudo marcar como pagado");
      }
    };

    if (loading) return <MenuLayout><p>Cargando gastos particulares...</p></MenuLayout>;

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
                            { key: "unit", label: "Unidad" },
                            { key: "description", label: "Descripción" },
                            {
                                key: "date",
                                label: "Fecha",
                                formatFn: (value) => format(parseISO(value), "dd/MM/yyyy", { locale: es }),
                            },
                            {
                                key: "amount",
                                label: "Monto",
                                formatFn: (v) => v.toLocaleString("es-AR", { style: "currency", currency: "ARS" }),
                            },
                            {
                                key: "actions",
                                label: "Acciones",
                                formatFn: (_, row) => (
                                    <button className="btn btn-sm btn-success" onClick={() => markPaid(row.id)}>
                                        Marcar como pagado
                                    </button>
                                ),
                            },
                        ]}
                        emptyMsg="No hay gastos particulares."
                    />
                )}
            </div>
        </MenuLayout>
    );
}
