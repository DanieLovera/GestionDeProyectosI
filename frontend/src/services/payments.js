import * as apis from "../apis/payments";
import { format, parseISO } from "date-fns";

export const getPaymentsByMonth = async (month) => {
  // month: 1-12 (legacy) o "yyyy-MM" (nuevo)
  const payments = await apis.getPayments();
  
  const filtered = payments.filter((p) => {
      const paymentDate = format(parseISO(p.date), "yyyy-MM");
      
      // Si month incluye el año (formato "yyyy-MM"), comparar completo
      if (typeof month === 'string' && month.includes('-')) {
        return paymentDate === month;
      }
      
      // Si es solo el mes (número o string "MM"), comparar solo el mes
      const mm = month.toString().padStart(2, "0");
      return format(parseISO(p.date), "MM") === mm;
    });
  
  return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
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
