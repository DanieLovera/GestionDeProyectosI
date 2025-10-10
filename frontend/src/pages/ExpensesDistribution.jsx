import MenuLayout from "../components/MenuLayout";
import { useState, useMemo } from "react";
import { getnPreviousMonth } from "../utils/getnPreviousMonth";
import GenericSelect from "../components/GenericSelect.jsx";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDepartments } from "../apis/departments.js";
import { getCommonExpenses } from "../services/commonExpenses";
import GenericTable from "../components/GenericTable.jsx";
import InfoCard from "../components/InfoCard.jsx";
import { nPreviousMonths } from "../constants/config.js";
import RegisterPaymentModal from "../components/RegisterPaymentModal.jsx";
import PaymentReceiptModal from "../components/PaymentReceiptModal.jsx";
import { getPaymentsByMonth, addPayment as addPaymentService } from "../services/payments";

export default function Reports() {
    const months = getnPreviousMonth(nPreviousMonths);
    const [chosenMonth, setChosenMonth] = useState(months[0].value);
    const [showPayment, setShowPayment] = useState(false);
    const [selectedUnitId, setSelectedUnitId] = useState("");
    const [showReceipt, setShowReceipt] = useState(false);
    const [receiptData, setReceiptData] = useState(null);
    const queryClient = useQueryClient();

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

    const {
        data: payments = [],
        isLoading: isLoadingPayments,
        isError: isErrorPayments,
    } = useQuery({
        queryKey: ["payments", chosenMonth],
        queryFn: () => getPaymentsByMonth(parseInt(chosenMonth)),
    });

    const isLoading = isLoadingCommonExpenses || isLoadingDepartments || isLoadingPayments;
    const isError = isErrorCommonExpenses || isErrorDepartments || isErrorPayments;

    const totalCommonExpenses = commonExpenses.reduce((s, e) => s + (e.amount || 0), 0);
    const totalSurface = departments.reduce((s, u) => s + (u.surface || 0), 0);
    const paidByUnit = useMemo(() => {
        const map = {};
        payments.forEach((p) => {
            map[p.unitId] = (map[p.unitId] || 0) + (p.amount || 0);
        });
        return map;
    }, [payments]);

    const distribution = departments.map((u) => {
        const pct = totalSurface > 0 ? u.surface / totalSurface : 0;
        const amountToPay = Math.round(totalCommonExpenses * pct);
        const paid = paidByUnit[u.id] || 0;
        const pending = Math.max(0, amountToPay - paid);
        return {
            id: u.id,
            unit: u.name,
            surface: u.surface,
            pct: `${(pct * 100).toFixed(2)}%`,
            amount: amountToPay,
            paid,
            pending,
            status: pending === 0 ? "Pagado" : "Pendiente",
        };
    });

    const unitOptions = departments.map((d) => ({ label: d.name, value: d.id }));
    const pendingByUnit = useMemo(() => {
        const map = {};
        distribution.forEach((row) => {
            map[row.id] = row.pending;
        });
        return map;
    }, [distribution]);

    const addPaymentMutation = useMutation({
        mutationFn: (payload) => addPaymentService(payload),
        onSuccess: () => {
            queryClient.invalidateQueries(["payments", chosenMonth]);
            setShowPayment(false);
        },
    });

    const handleOpenPayment = (unitId) => {
        setSelectedUnitId(unitId);
        setShowPayment(true);
    };

    const handleSavePayment = async (payment) => {
        const saved = await addPaymentMutation.mutateAsync(payment);
        const unitName = departments.find((d) => d.id === saved.unitId)?.name || saved.unitId;
        setReceiptData({
            number: saved.id,
            date: saved.date,
            unitName,
            amount: saved.amount,
            method: saved.method,
        });
        setShowReceipt(true);
    };

    return (
        <MenuLayout>
            <div className="p-3">
                <h3 className="mb-3">Expensas</h3>
                <GenericSelect className="mb-3" value={chosenMonth} setValue={setChosenMonth} options={months} />

                <div className="d-flex justify-content-between mb-3 gap-3">
                    <InfoCard
                        title={"Gastos Comunes"}
                        info={totalCommonExpenses}
                        formatFn={(value) => value.toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
                    />
                    <InfoCard
                        title={"Pagado (mes)"}
                        info={payments.reduce((s, p) => s + (p.amount || 0), 0)}
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
                                {
                                    key: "paid",
                                    label: "Pagado",
                                    formatFn: (value) => value.toLocaleString("es-AR", { style: "currency", currency: "ARS" }),
                                },
                                {
                                    key: "pending",
                                    label: "Pendiente",
                                    formatFn: (value) => value.toLocaleString("es-AR", { style: "currency", currency: "ARS" }),
                                },
                                { key: "status", label: "Estado" },
                                {
                                    key: "actions",
                                    label: "Acciones",
                                    formatFn: (_, row) => (
                                        row.pending === 0 ? (
                                            <button className="btn btn-sm btn-success" disabled>Pagado</button>
                                        ) : (
                                            <button className="btn btn-sm btn-primary" onClick={() => handleOpenPayment(row.id)}>
                                                Registrar pago
                                            </button>
                                        )
                                    ),
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

            <RegisterPaymentModal
                show={showPayment}
                onClose={() => setShowPayment(false)}
                onSave={handleSavePayment}
                unitOptions={unitOptions}
                defaultUnitId={selectedUnitId}
                pendingByUnit={pendingByUnit}
            />
            <PaymentReceiptModal show={showReceipt} onClose={() => setShowReceipt(false)} receipt={receiptData} />
        </MenuLayout>
    );
}
