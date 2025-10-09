import MenuLayout from "../components/MenuLayout";
import { useState } from "react";
import { getnPreviousMonth } from "../utils/getnPreviousMonth";
import GenericSelect from "../components/GenericSelect.jsx";
import { useQuery } from "@tanstack/react-query";
import { getDepartments } from "../apis/departments.js";
import { getCommonExpenses } from "../services/commonExpenses";
import GenericTable from "../components/GenericTable.jsx";
import InfoCard from "../components/InfoCard.jsx";

export default function Reports() {
    const nPreviousMonths = 2;
    const months = getnPreviousMonth(nPreviousMonths);
    const [chosenMonth, setChosenMonth] = useState(months[0].value);

    const {
        data: commonExpenses = [],
        isLoading: isLoadingCommonExpenses,
        isError: isErrorCommonExpenses,
    } = useQuery({
        queryKey: ["commonExpenses", chosenMonth],
        queryFn: () => getCommonExpenses(parseInt(chosenMonth)),
    });

    const {
        data: departments = [],
        isLoading: isLoadingDepartments,
        isError: isErrorDepartments,
    } = useQuery({
        queryKey: ["departments"],
        queryFn: () => getDepartments(),
    });

    const isLoading = isLoadingCommonExpenses || isLoadingDepartments;
    const isError = isErrorCommonExpenses || isErrorDepartments;

    const totalCommonExpenses = commonExpenses.reduce((s, e) => s + (e.amount || 0), 0);
    const totalSurface = departments.reduce((s, u) => s + (u.surface || 0), 0);
    const distribution = departments.map((u) => {
        const pct = totalSurface > 0 ? u.surface / totalSurface : 0;
        const amountToPay = Math.round(totalCommonExpenses * pct);
        return {
            id: u.id,
            unit: u.name,
            surface: u.surface,
            pct: `${(pct * 100).toFixed(2)}%`,
            amount: amountToPay,
        };
    });

    return (
        <MenuLayout>
            <div className="p-3">
                <h3 className="mb-3">Expensas</h3>
                <GenericSelect className="mb-3" value={chosenMonth} setValue={setChosenMonth} options={months} />

                <div className="d-flex justify-content-between mb-3">
                    <InfoCard
                        title={"Gastos Comunes"}
                        info={totalCommonExpenses}
                        formatFn={(value) => value.toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
                    />
                </div>

                {isLoading && <p>Cargando gastos...</p>}
                {isError && <p>Error al cargar los gastos.</p>}
                {!isLoading && !isError && (
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
            </div>
        </MenuLayout>
    );
}
