import * as apis from "../apis/payments";
import { format, parseISO } from "date-fns";

export const getPaymentsByMonth = async (month) => {
  // month: 1-12
  const mm = month.toString().padStart(2, "0");
  const payments = await apis.getPayments();
  return payments
    .filter((p) => format(parseISO(p.date), "MM") === mm)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
};

export const getPaymentsByUnitAndMonth = async (unitId, month) => {
  const list = await getPaymentsByMonth(month);
  return list.filter((p) => p.unitId === unitId);
};

export const addPayment = async (payment) => {
  // payment: { unitId, amount:number, date: 'yyyy-MM-dd', method:string }
  payment.amount = parseFloat(payment.amount);
  return await apis.addPayment(payment);
};
