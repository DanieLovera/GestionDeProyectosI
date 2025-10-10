import http from "./http";

// Expect backend routes like: GET /payments, POST /payments
export const getPayments = async () => {
  const { data } = await http.get("/payments");
  return data;
};

export const addPayment = async (payment) => {
  const { data } = await http.post("/payments", payment);
  return data;
};
