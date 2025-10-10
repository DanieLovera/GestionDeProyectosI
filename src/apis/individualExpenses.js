import individualExpenses from "../mocks/individualExpenses.js";
import departments from "../mocks/units.js";

const mockDataFetch = (data, delay) => new Promise((resolve) => setTimeout(() => resolve(data), delay));

const getIndividualExpenses = async () => {
    const response = await mockDataFetch(individualExpenses, 1000);
    return response;
};

const addIndividualExpense = async (expense) => {
    const response = await mockDataFetch({ ...expense, id: Date.now() }, 1000);
    // Simulate returning the unit name instead of unitId
    response.unit = departments.find((dept) => dept.id === expense.unitId).name;
    // Simulate adding to DB by pushing to the mock array
    individualExpenses.push({
        id: response.id,
        unit: response.unit,
        description: response.description,
        amount: response.amount,
        date: response.date,
    });
    return response;
};

export { getIndividualExpenses, addIndividualExpense };
