import units from "../mocks/units";

const mockDataFetch = (data, delay) => new Promise((resolve) => setTimeout(() => resolve(data), delay));

const getDepartments = async () => {
    const response = await mockDataFetch(units, 1000);
    return response;
};

export { getDepartments };