import commonExpenses from "../mocks/commonExpenses.js";

const mockDataFetch = (data, delay) => new Promise((resolve) => setTimeout(() => resolve(data), delay));

const getCommonExpenses = async () => {
    const response = await mockDataFetch(commonExpenses, 1000);
    return response;
};

export { getCommonExpenses };
