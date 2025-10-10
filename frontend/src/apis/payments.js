import payments from "../mocks/payments";

const mockDataFetch = (data, delay = 600) => new Promise((resolve) => setTimeout(() => resolve(data), delay));

export const getPayments = async () => {
  const response = await mockDataFetch(payments, 500);
  return response;
};

export const addPayment = async (payment) => {
  const newPayment = { id: Date.now(), ...payment };
  // Simular latencia y persistencia en memoria
  await mockDataFetch(null, 400);
  payments.push(newPayment);
  return newPayment;
};
