import commonExpenses from "../mocks/commonExpenses.js";

const mockDataFetch = (data, delay) => new Promise((resolve) => setTimeout(() => resolve(data), delay));

const getCommonExpenses = async () => {
    const response = await mockDataFetch(commonExpenses, 1000);
    return response;
};

const addCommonExpense = async (expense) => {
    const response = await mockDataFetch({ ...expense, id: Date.now() }, 5000);
    // Simulate adding to DB by pushing to the mock array
    commonExpenses.push(response);
    return response;
}

export { getCommonExpenses, addCommonExpense };
