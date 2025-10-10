import http from "./http";

const getCommonExpenses = async () => {
    const { data } = await http.get("/common-expenses");
    return data;
};

const addCommonExpense = async (expense) => {
    const { data } = await http.post("/common-expenses", expense);
    return data;
}

export { getCommonExpenses, addCommonExpense };
