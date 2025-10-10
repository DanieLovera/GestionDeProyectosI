const payments = [
  { id: 1, unit: 'Depto 1', amount: 5000, date: '2025-09-10' },
  { id: 2, unit: 'Depto 2', amount: 10000, date: '2025-08-20' },
  { id: 3, unit: 'Depto 4', amount: 2000, date: '2025-10-02' },
  // partial payment for Depto 1 after due
  { id: 4, unit: 'Depto 1', amount: 3000, date: '2025-10-05' },
];

export default payments;
