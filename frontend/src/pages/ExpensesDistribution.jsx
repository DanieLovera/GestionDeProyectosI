import MenuLayout from "../components/MenuLayout";
import { useState, useMemo, useEffect } from "react";
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
    
    // Restaurar mes guardado o usar el actual
    const savedMonth = localStorage.getItem('selectedExpenseMonth');
    const initialMonth = savedMonth && months.find(m => m.value === savedMonth) 
        ? savedMonth 
        : months[0].value;
    
    const [chosenMonth, setChosenMonth] = useState(initialMonth);
    const [showPayment, setShowPayment] = useState(false);
    const [selectedUnitId, setSelectedUnitId] = useState("");
    const [showReceipt, setShowReceipt] = useState(false);
    const [receiptData, setReceiptData] = useState(null);
    const queryClient = useQueryClient();

    // Guardar mes cuando cambie
    useEffect(() => {
        localStorage.setItem('selectedExpenseMonth', chosenMonth);
    }, [chosenMonth]);

    // Invalidar queries cuando cambia el mes
    useEffect(() => {
        queryClient.invalidateQueries(["commonExpenses", chosenMonth]);
        queryClient.invalidateQueries(["payments", chosenMonth]);
    }, [chosenMonth, queryClient]);

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

    // normalización: si backend devuelve unit_id, mapear a unitId para uso en la UI
    const normalizedPayments = (payments || []).map((p) => ({
        ...p,
        unitId: p.unitId ?? p.unit_id ?? p.unit ?? p.unitId,
        unit_id: p.unit_id ?? p.unitId ?? p.unit ?? p.unit_id,
    }));

    const totalCommonExpenses = commonExpenses.reduce((s, e) => s + (e.amount || 0), 0);
    const totalSurface = departments.reduce((s, u) => s + (u.surface || 0), 0);
    const paidByUnit = useMemo(() => {
        const map = {};
        normalizedPayments.forEach((p) => {
            const key = String(p.unitId ?? p.unit_id ?? p.unit ?? "");
            map[key] = (map[key] || 0) + (p.amount || 0);
        });
        return map;
    }, [normalizedPayments]);

    const distribution = departments.map((u) => {
        const pct = totalSurface > 0 ? u.surface / totalSurface : 0;
        const amountToPay = Math.round(totalCommonExpenses * pct);
        // comparar por id como string para evitar desajustes de tipo
        const paid = paidByUnit[String(u.id)] || paidByUnit[u.id] || 0;
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

    // mutación sin actualización optimista - solo invalidar y refetch
    const addPaymentMutation = useMutation({
        mutationFn: (payload) => addPaymentService(payload),
        onError: (err) => {
            console.error("Error adding payment:", err);
            alert("No se pudo registrar el pago");
        },
        onSuccess: async () => {
            // Invalidar queries para que React Query las refresque automáticamente
            await queryClient.invalidateQueries(["payments", chosenMonth]);
            await queryClient.invalidateQueries(["commonExpenses", chosenMonth]);
        },
    });

    const handleOpenPayment = (unitId) => {
        setSelectedUnitId(unitId);
        setShowPayment(true);
    };

    const handleSavePayment = async (payment) => {
        // asegurar que amount sea number y que payload contenga unitId y unit_id
        const payload = {
            ...payment,
            amount: Number(payment.amount) || 0,
            unitId: payment.unitId ?? payment.unit_id ?? payment.unit,
            unit_id: payment.unit_id ?? payment.unitId ?? payment.unit,
        };
        try {
            const saved = await addPaymentMutation.mutateAsync(payload);
            const result = saved && (saved.id || saved.amount || saved.unit_id) ? ( { ...saved, unitId: saved.unitId ?? saved.unit_id } ) : {
                id: `local-${Date.now()}`,
                date: payload.date,
                unitId: payload.unitId,
                amount: payload.amount,
                method: payload.method,
            };
            const unitName = departments.find((d) => String(d.id) === String(result.unitId))?.name || result.unitId;
            setReceiptData({
                number: result.id,
                date: result.date,
                unitName,
                amount: result.amount,
                method: result.method,
            });
            setShowReceipt(true);
            setShowPayment(false);
        } catch (err) {
            // onError del useMutation ya maneja rollback y aviso
        }
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
