// Pagos mock: referencian unidades por id (ver src/mocks/units.js)
// y usan fechas ISO para permitir filtrado por mes.

const payments = [
  // Ejemplos: algunos pagos del mes actual (octubre 2025)
  { id: 1, unitId: 'U1', amount: 8000, method: 'transferencia', date: '2025-10-05' },
  { id: 2, unitId: 'U2', amount: 6000, method: 'efectivo', date: '2025-10-06' },
  // Mes anterior
  { id: 3, unitId: 'U3', amount: 5000, method: 'transferencia', date: '2025-09-25' },
];

export default payments;
