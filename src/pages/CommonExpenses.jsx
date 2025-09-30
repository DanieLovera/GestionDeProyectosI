import GenericTable from "../components/GenericTable.jsx";
import GenericSelect from "../components/GenericSelect.jsx";

import { parseISO, format } from "date-fns";
import { es } from "date-fns/locale";
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

            <GenericSelect className="mb-3" value={chosenMonth} setValue={setChosenMonth} options={months} />
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
        </div>
    );
}

export default CommonExpenses;
