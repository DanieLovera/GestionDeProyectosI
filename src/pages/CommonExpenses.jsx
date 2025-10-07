import MenuLayout from "../components/MenuLayout";
import GenericTable from "../components/GenericTable.jsx";
import GenericSelect from "../components/GenericSelect.jsx";
import AddCommonExpense from "../components/AddCommonExpense.jsx";
import { parseISO, format } from "date-fns";
import { es } from "date-fns/locale";
import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getCommonExpenses, addCommonExpense } from "../services/commonExpenses";
import { getnPreviousMonth } from "../utils/getnPreviousMonth";
import { FiPlusCircle } from "react-icons/fi";
import TotalExpense from "../components/TotalExpense.jsx";
import units from "../mocks/units";

export default function CommonExpenses() {
    const queryClient = useQueryClient();
    const nPreviousMonths = 2;
    const months = getnPreviousMonth(nPreviousMonths);
    const [chosenMonth, setChosenMonth] = useState(months[0].value);
    const [showAddCommonExpense, setAddCommonExpense] = useState(false);

    const {
        data = [],
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["commonExpenses", chosenMonth],
        queryFn: () => getCommonExpenses(parseInt(chosenMonth)),
    });

    // const total = data.reduce((sum, item) => sum + (item.amount || 0), 0);
    const [showDistribution, setShowDistribution] = useState(false);

    const totalExpenses = data.reduce((s, e) => s + (e.amount || 0), 0);
    const totalSurface = units.reduce((s, u) => s + (u.surface || 0), 0);

    const distribution = units.map((u) => {
        const pct = totalSurface > 0 ? u.surface / totalSurface : 0;
        const amountToPay = Math.round(totalExpenses * pct);
        return {
            id: u.id,
            unit: u.name,
            surface: u.surface,
            pct: `${(pct * 100).toFixed(2)}%`,
            amount: amountToPay,
        };
    });

    const addExpenseMutation = useMutation({
        mutationFn: (expense) => addCommonExpense(expense),
        onSuccess: () => {
            queryClient.invalidateQueries(["commonExpenses", chosenMonth]);
            setAddCommonExpense(false);
        },
        onError: (error) => {
            console.error("Error on adding expense:", error);
        },
    });

    const handleAddExpense = async (expense) => {
        expense.amount = parseFloat(expense.amount);
        await addExpenseMutation.mutateAsync(expense);
    };

    return (
        <MenuLayout>
            <div className="p-3">
                <h3 className="mb-3">Gastos Comunes</h3>

                <GenericSelect className="mb-3" value={chosenMonth} setValue={setChosenMonth} options={months} />

                <div className="d-flex justify-content-between align-items-center mb-3">
                    <TotalExpense total={totalExpenses} />

                    <button
                        type="button"
                        className="btn btn-primary d-flex align-items-center gap-2 shadow-sm px-3"
                        onClick={() => setAddCommonExpense(true)}
                    >
                        <FiPlusCircle size={20} />
                        <span>Agregar gasto</span>
                    </button>
                </div>

                {/* Distribution section */}
                <div className="mt-4">
                    <button className="btn btn-secondary mb-3" onClick={() => setShowDistribution(!showDistribution)}>
                        {showDistribution ? "Ocultar reparto" : "Ver reparto por superficie"}
                    </button>

                    {showDistribution && (
                        <>
                            <h5>Reparto por superficie</h5>
                            {data.length === 0 ? (
                                <p>No hay gastos para el mes seleccionado.</p>
                            ) : totalSurface === 0 ? (
                                <p>No hay superficies registradas.</p>
                            ) : (
                                <>
                                    <GenericTable
                                        data={distribution}
                                        columns={[
                                            { key: "unit", label: "Unidad" },
                                            { key: "surface", label: "Superficie (m²)" },
                                            { key: "pct", label: "% Participación" },
                                            {
                                                key: "amount",
                                                label: "Monto a pagar",
                                                formatFn: (value) =>
                                                    `${value.toLocaleString("es-AR", {
                                                        style: "currency",
                                                        currency: "ARS",
                                                    })}`,
                                            },
                                        ]}
                                        emptyMsg="No hay unidades registradas."
                                    />

                                    <div className="mt-2">
                                        <strong>Total superficie: </strong>
                                        {totalSurface} m²
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>

                {isLoading && <p>Cargando gastos...</p>}
                {isError && <p>Error al cargar los gastos.</p>}
                {!isLoading && !isError && (
                    <GenericTable
                        data={data}
                        columns={[
                            { key: "description", label: "Concepto" },
                            {
                                key: "amount",
                                label: "Monto",
                                formatFn: (value) =>
                                    `${value.toLocaleString("es-AR", {
                                        style: "currency",
                                        currency: "ARS",
                                    })}`,
                            },
                            {
                                key: "date",
                                label: "Fecha",
                                formatFn: (value) => format(parseISO(value), "dd/MM/yyyy", { locale: es }),
                            },
                        ]}
                        emptyMsg="No hay gastos para el mes seleccionado."
                    />
                )}
            </div>

            <AddCommonExpense
                show={showAddCommonExpense}
                onClose={() => setAddCommonExpense(false)}
                onSave={handleAddExpense}
            />
        </MenuLayout>
    );
}
