import CommonExpensesTable from "../components/CommonExpensesTable.jsx";
import CommonExpensesFilter from "../components/CommonExpensesFilter.jsx";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCommonExpenses } from "../services/commonExpenses";
import { getnPreviousMonth } from "../utils/getnPreviousMonth";

function CommonExpenses() {
    const nPreviousMonths = 2;
    const months = getnPreviousMonth(nPreviousMonths);
    const [chosenMonth, setChosenMonth] = useState(months[0].value);

    const {
        data = [],
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["commonExpenses", chosenMonth],
        queryFn: () => getCommonExpenses(parseInt(chosenMonth)),
    });

    // TODO: improve loading and error states
    if (isLoading) return <p>Cargando gastos...</p>;
    if (isError) return <p>Error al cargar los gastos.</p>;

    return (
        <div className="p-3">
            <h3 className="mb-3">Gastos Comunes</h3>

            <CommonExpensesFilter chosenMonth={chosenMonth} setChosenMonth={setChosenMonth} months={months} />
            <CommonExpensesTable expenses={data} emptyMsg="No hay gastos registrados para este mes." />
        </div>
    );
}

export default CommonExpenses;
