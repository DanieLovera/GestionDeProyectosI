## endpoints esperados (frontend → backend)

Base URL: VITE_API_URL (configurado en `.env` de Vite)

Unidades
- GET /units
  - Respuesta: array de unidades
  - Shape: { id: string, name: string, surface: number, owner?: string }
- POST /units
  - Body: { name: string, surface: number, owner?: string }
  - Respuesta: unidad creada con id
- PUT /units/:id
  - Body: { name: string, surface: number, owner?: string }
  - Respuesta: unidad actualizada
- DELETE /units/:id
  - Respuesta: unidad eliminada (o { success: true })

Gastos comunes (Expensas)
- GET /common-expenses
  - Respuesta: array de gastos
  - Shape: { id: string|number, description: string, amount: number, date: 'YYYY-MM-DD' }
- POST /common-expenses
  - Body: { description: string, amount: number, date: 'YYYY-MM-DD' }
  - Respuesta: gasto creado con id

Pagos
- GET /payments
  - Respuesta: array de pagos
  - Shape: { id: string|number, unitId: string, amount: number, date: 'YYYY-MM-DD', method: string }
- POST /payments
  - Body: { unitId: string, amount: number, date: 'YYYY-MM-DD', method: string }
  - Respuesta: pago creado con id

