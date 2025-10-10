import * as apis from "../apis/commonExpenses";

import { format, parseISO } from "date-fns";

const getCommonExpenses = async (month) => {
    month = month.toString().padStart(2, "0");
    const commonExpenses = await apis.getCommonExpenses();

    return commonExpenses
        .filter((expense) => format(parseISO(expense.date), "MM") === month)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
};

const addCommonExpense = async (expense) => {
    return await apis.addCommonExpense(expense);
}

export { getCommonExpenses, addCommonExpense };
