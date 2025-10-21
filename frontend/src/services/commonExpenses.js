import * as apis from "../apis/commonExpenses";

import { format, parseISO } from "date-fns";
import { getCommissionForMonth } from "./commission";

const getCommonExpenses = async (month) => {
    month = month.toString().padStart(2, "0");
    const commonExpenses = await apis.getCommonExpenses();
    // Filter by month
    let result = commonExpenses
        .filter((expense) => format(parseISO(expense.date), "MM") === month);

    // Inject commission expense if configured
    const commission = getCommissionForMonth(month);
    if (commission) {
        result = [...result, commission];
    }

    // Sort newest first
    return result.sort((a, b) => new Date(b.date) - new Date(a.date));
};

const addCommonExpense = async (expense) => {
    return await apis.addCommonExpense(expense);
}

export { getCommonExpenses, addCommonExpense };
