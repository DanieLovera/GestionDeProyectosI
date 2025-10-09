import MenuLayout from "../components/MenuLayout";
import GenericTable from "../components/GenericTable";
import { parseISO, format } from "date-fns";
import { es } from "date-fns/locale";
import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getnPreviousMonth } from "../utils/getnPreviousMonth";
import { getIndividualExpenses, addIndividualExpense } from "../services/individualExpenses";
import GenericSelect from "../components/GenericSelect";
import TotalExpense from "../components/TotalExpense";
import { FiPlusCircle } from "react-icons/fi";
import AddCommonExpense from "../components/AddCommonExpense.jsx";

export default function IndividualExpenses() {
    const queryClient = useQueryClient();
    const nPreviousMonths = 2;
    const months = getnPreviousMonth(nPreviousMonths);
    const [chosenMonth, setChosenMonth] = useState(months[0].value);
    const [showIndividualExpense, setShowIndividualExpense] = useState(false);

    const {
        data: expenses = [],
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["individualExpenses", chosenMonth],
        queryFn: () => getIndividualExpenses(parseInt(chosenMonth)),
    });

    const addExpenseMutation = useMutation({
        mutationFn: (expense) => addIndividualExpense(expense),
        onSuccess: () => {
            queryClient.invalidateQueries(["individualExpenses", chosenMonth]);
            setShowIndividualExpense(false);
        },
        onError: (error) => {
            console.error("Error on adding expense:", error);
        },
    });

    const handleAddExpense = async (expense) => {
        expense.amount = parseFloat(expense.amount);
        await addExpenseMutation.mutateAsync(expense);
    };

    const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);

    return (
        <MenuLayout>
            <div className="p-3">
                <h3 className="mb-3">Gastos Particulares</h3>

                <GenericSelect className="mb-3" value={chosenMonth} setValue={setChosenMonth} options={months} />

                <div className="d-flex justify-content-between align-items-center mb-3">
                    <TotalExpense total={totalExpenses} />

                    <button
                        type="button"
                        className="btn btn-primary d-flex align-items-center gap-2 shadow-sm px-3"
                        onClick={() => setShowIndividualExpense(true)}
                    >
                        <FiPlusCircle size={20} />
                        <span>Agregar gasto</span>
                    </button>
                </div>

                {isLoading && <p>Cargando gastos...</p>}
                {isError && <p>Error al cargar los gastos.</p>}
                {!isLoading && !isError && (
                    <GenericTable
                        data={expenses}
                        columns={[
                            { key: "unit", label: "Unidad" },
                            { key: "description", label: "Concepto" },
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
                        ]}
                        emptyMsg="No hay gastos para el mes seleccionado."
                    />
                )}
            </div>
            <AddCommonExpense
                show={showIndividualExpense}
                onClose={() => setShowIndividualExpense(false)}
                onSave={handleAddExpense}
            />
        </MenuLayout>
    );
}
