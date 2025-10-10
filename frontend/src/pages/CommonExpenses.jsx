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
import { nPreviousMonths } from "../constants/config.js";
import InfoCard from "../components/InfoCard.jsx";

export default function CommonExpenses() {
    const queryClient = useQueryClient();
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

    const total = data.reduce((sum, item) => sum + (item.amount || 0), 0);

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
                    <InfoCard
                        title={'Total del mes'}
                        info={total}
                        formatFn={(value) => value.toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
                    />

                    <button
                        type="button"
                        className="btn btn-primary d-flex align-items-center gap-2 shadow-sm px-3"
                        onClick={() => setAddCommonExpense(true)}
                    >
                        <FiPlusCircle size={20} />
                        <span>Agregar gasto</span>
                    </button>
                </div>

                {isLoading && <p>Cargando gastos...</p>}
                {isError && <p>Error al cargar los gastos.</p>}
                {!isLoading && !isError && (
                    <GenericTable
                        data={data}
                        rowClassName={(row) => row.__isCommission ? 'table-warning' : undefined}
                        columns={[
                            { key: "__isCommission", label: "Tipo", formatFn: (v) => v ? 'Comisión' : 'Gasto' },
                            { key: "description", label: "Concepto" },
                            {
                                key: "amount",
                                label: "Monto",
                                formatFn: (value) =>
                                    value.toLocaleString("es-AR", {
                                        style: "currency",
                                        currency: "ARS",
                                    }),
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
