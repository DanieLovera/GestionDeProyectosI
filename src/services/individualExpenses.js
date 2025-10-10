import * as apis from "../apis/individualExpenses.js";

import { format, parseISO } from "date-fns";

const getIndividualExpenses = async (month) => {
    month = month.toString().padStart(2, "0");
    const individualExpenses = await apis.getIndividualExpenses();

    return individualExpenses
        .filter((expense) => format(parseISO(expense.date), "MM") === month)
        .sort((a, b) => {
            const departmentComparison = a.unit.localeCompare(b.unit);
            if (departmentComparison === 0) return new Date(b.date) - new Date(a.date);
            return departmentComparison;
        });
};

const addIndividualExpense = async (expense) => {
    console.log("Adding individual expense:", expense);

    const result = await apis.addIndividualExpense(expense);
    // console.log("Result from API:", result);
    return result;
};

export { getIndividualExpenses, addIndividualExpense };
