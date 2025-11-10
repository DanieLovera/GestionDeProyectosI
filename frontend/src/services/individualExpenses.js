import * as apis from "../apis/individualExpenses.js";

import { format, parseISO } from "date-fns";

const getIndividualExpenses = async (month) => {
  const individualExpenses = await apis.getIndividualExpenses();

  const expensesWithUnit = individualExpenses.map((e) => ({
    ...e,
    unit: e.unit_id,
  }));

  return expensesWithUnit
    .filter((expense) => {
      const expenseDate = format(parseISO(expense.date), "yyyy-MM");
      
      // Si month incluye el año (formato "yyyy-MM"), comparar completo
      if (typeof month === 'string' && month.includes('-')) {
        return expenseDate === month;
      }
      
      // Si es solo el mes (número o string "MM"), comparar solo el mes
      const mm = month.toString().padStart(2, "0");
      return format(parseISO(expense.date), "MM") === mm;
    })
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
