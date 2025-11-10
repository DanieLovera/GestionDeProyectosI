import * as apis from "../apis/commonExpenses";

import { format, parseISO } from "date-fns";
import { getCommissionForMonth, getCommissionConfig } from "./commission";

const getCommonExpenses = async (month) => {
    const commonExpenses = await apis.getCommonExpenses();
    
    // Filter by month (and year if format is yyyy-MM)
    let result = commonExpenses.filter((expense) => {
        const expenseDate = format(parseISO(expense.date), "yyyy-MM");
        
        // Si month incluye el año (formato "yyyy-MM"), comparar completo
        if (typeof month === 'string' && month.includes('-')) {
            return expenseDate === month;
        }
        
        // Si es solo el mes (número o string "MM"), comparar solo el mes
        const mm = month.toString().padStart(2, "0");
        return format(parseISO(expense.date), "MM") === mm;
    });

    // Inject commission expense if configured
    try {
        const config = await getCommissionConfig();
        const commission = getCommissionForMonth(month, config);
        if (commission) {
            result = [...result, commission];
        }
    } catch (err) {
        console.warn("No se pudo obtener configuración de comisión:", err);
    }

    // Sort newest first
    return result.sort((a, b) => new Date(b.date) - new Date(a.date));
};

const addCommonExpense = async (expense) => {
    return await apis.addCommonExpense(expense);
}

export { getCommonExpenses, addCommonExpense };
