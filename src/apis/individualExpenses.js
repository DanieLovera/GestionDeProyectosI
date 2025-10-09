import individualExpenses from "../mocks/individualExpenses.js";

const mockDataFetch = (data, delay) => new Promise((resolve) => setTimeout(() => resolve(data), delay));

const getIndividualExpenses = async () => {
    const response = await mockDataFetch(individualExpenses, 1000);
    return response;
};

const addIndividualExpense = async (expense) => {
    const response = await mockDataFetch({ ...expense, id: Date.now() }, 5000);
    // Simulate adding to DB by pushing to the mock array
    individualExpenses.push(response);
    return response;
}

export { getIndividualExpenses, addIndividualExpense };
