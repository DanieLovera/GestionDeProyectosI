# Reports Spec (Frontend)

Esta especificación define los contratos de datos (shapes JSON) que consumirá el frontend para renderizar Reportes.

## 1) Dashboard (KPIs)
GET /reports/dashboard?month=MM&year=YYYY

Response shape:
{
  "period": { "month": 10, "year": 2025 },
  "totals": {
    "commonExpenses": number,     // total de gastos comunes del periodo
    "collected": number,          // total cobrado (pagos) del periodo
    "overdue": number,            // total pendiente del periodo (sin mora)
    "lateFees": number            // total de mora acumulada en el periodo
  }
}

## 2) Reporte por unidad (estado de cuenta resumido)
GET /reports/by-unit?month=MM&year=YYYY

Response shape:
{
  "period": { "month": 10, "year": 2025 },
  "units": [
    {
      "id": string,               // U1
      "name": string,             // Depto 1
      "surface": number,          // m2
      "participationPct": number, // 0..1
      "amount": number,           // expensa generada para el periodo
      "paid": number,             // total pagado en el periodo
      "pending": number,          // amount - paid (>=0)
      "lateFee": number           // mora del periodo
    }
  ]
}

## 3) Gastos por categoría/mes (series para gráficos)
GET /reports/by-category?month=MM&year=YYYY

Response shape:
{
  "period": { "month": 10, "year": 2025 },
  "categories": [
    { "name": "Limpieza", "amount": number },
    { "name": "Seguridad", "amount": number },
    { "name": "Mantenimiento", "amount": number },
    { "name": "Otros", "amount": number }
  ]
}

## 4) Movimientos por unidad (detalle)
GET /reports/unit-movements?unitId=U1&month=MM&year=YYYY

Response shape:
{
  "unit": { "id": "U1", "name": "Depto 1" },
  "period": { "month": 10, "year": 2025 },
  "movements": [
    // type: 'expense' | 'payment' | 'lateFee' | 'commission'
    { "date": "2025-10-01", "type": "expense", "description": "Expensa Octubre", "amount": 8000 },
    { "date": "2025-10-05", "type": "payment", "description": "Pago transferencia", "amount": -8000 },
    { "date": "2025-10-15", "type": "lateFee", "description": "Mora diaria", "amount": 500 }
  ],
  "balance": number // suma de movements
}

## Reglas y consideraciones
- La expensa generada por unidad = Total gastos comunes del periodo * (surface / totalSurface).
- lateFee se calcula sobre `pending` según configuración (tasa y día de inicio).
- commission (si aplica) se agrega a gastos comunes del periodo.

## Errores
- 4xx/5xx con `{ message: string }`.

---

## Mock de referencia
- Los mocks devolverán estos shapes para facilitar la construcción del UI.
- Esto permite luego “switch” sencillo a endpoints reales.
