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

Auth y usuarios
- POST /users/login
  - Body: { email: string, password: string, consortium: string }
  - Respuesta: { accessToken?: string, user?: { id?, name, role } }
- POST /users/register
  - Body: { name: string, email: string, password: string, role: string, consortium: string }
  - Respuesta: { id?: string|number, name, email, role, consortium }
- GET /users/me
  - Auth: Bearer token
  - Respuesta: { id, name, email, role }
- POST /users/refresh (opcional)
  - Body: { refreshToken }
  - Respuesta: { accessToken }
- POST /users/logout (opcional)
- POST /users/reset-password (opcional)

Unidades (extras)
- GET /units/:id
  - Respuesta: { id, name, surface, owner? }
- POST /units:import (opcional, CSV)
  - Body: archivo CSV
  - Respuesta: { imported: number, errors: [] }

Gastos comunes (CRUD completo)
- GET /common-expenses/:id
  - Respuesta: { id, description, amount, date }
- PUT /common-expenses/:id
  - Body: { description?, amount?, date? }
  - Respuesta: gasto actualizado
- DELETE /common-expenses/:id
  - Respuesta: { success: true }
- GET /expense-categories (opcional)
  - Respuesta: string[] o [{ id, name }]

Gastos particulares (individual-expenses)
- GET /individual-expenses?unitId=U1&from=YYYY-MM-DD&to=YYYY-MM-DD
  - Respuesta: [{ id, unitId, description, amount, date }]
- POST /individual-expenses
  - Body: { unitId, description, amount, date }
  - Respuesta: gasto creado con id
- PUT /individual-expenses/:id
  - Body: { description?, amount?, date? }
  - Respuesta: gasto actualizado
- DELETE /individual-expenses/:id
  - Respuesta: { success: true }

Pagos (mantenimiento y filtros)
- GET /payments?unitId=U1&from=YYYY-MM-DD&to=YYYY-MM-DD&method=Transferencia
  - Respuesta: array de pagos filtrados
- GET /payments/:id
  - Respuesta: { id, unitId, amount, date, method }
- PUT /payments/:id
  - Body: { amount?, date?, method? }
  - Respuesta: pago actualizado
- DELETE /payments/:id
  - Respuesta: { success: true }

Reportes
- GET /reports/dashboard?month=MM&year=YYYY
  - Respuesta: { period: { month, year }, totals: { commonExpenses, collected, overdue, lateFees } }
- GET /reports/by-unit?month=MM&year=YYYY
  - Respuesta: { period, units: [{ id, name, surface, participationPct, amount, paid, pending, lateFee }] }
- GET /reports/by-category?month=MM&year=YYYY
  - Respuesta: { period, categories: [{ name, amount }] }
- GET /reports/unit-movements?unitId=U1&month=MM&year=YYYY
  - Respuesta: { unit: { id, name }, period, movements: [{ date, type: 'expense'|'payment'|'commission'|'lateFee', description, amount }], balance }
- GET /reports/export?type=by-unit|by-category|dashboard&month=MM&year=YYYY (opcional CSV/Excel)

Moras (overdues)
- GET /overdues/config
  - Respuesta: { rate: number, startDay: 1-31, mode?: 'simple'|'compuesto' }
- PUT /overdues/config
  - Body: { rate, startDay, mode? }
- GET /overdues?month=MM&year=YYYY
  - Respuesta: [{ unitId, base, daysLate, lateFee, total }]

Comisión de administración (config)
- GET /config/commission
  - Respuesta: { rate: number, base: number }
- PUT /config/commission
  - Body: { rate, base }
- POST /common-expenses/generate-commission?month=MM&year=YYYY (opcional)
  - Acción: genera un gasto de comisión como item contable del mes

Catálogos y settings (opcionales)
- GET /payment-methods
  - Respuesta: ['Efectivo','Transferencia','Tarjeta',…]
- GET /settings/consortium
  - Respuesta: { name, address, currency, timezone, ... }
- GET /health
  - Respuesta: { status: 'ok' }

Convenciones recomendadas
- Auth: Bearer token requerido en todo salvo login/registro/health.
- Filtros estándar: ?from, ?to o ?month&year para coherencia.
- Paginación: ?page, ?pageSize con meta { total, page, pageSize }.
- Errores: { error: { code, message, details? } } con status HTTP apropiados.
- Fechas: ISO 'YYYY-MM-DD'.

Multitenancy por consorcio
- Cada consorcio usa su propia base de datos SQLite separada.
- El backend resuelve el consorcio de:
  1) JWT (claim "consortium") si envías Authorization: Bearer <token>
  2) o header "X-Consortium: <nombre_del_consorcio>" (útil para pruebas locales sin token)
- Recomendado: tras login/registro, usar el token (que ya incluye consortium).

Ejemplo (curl):
- curl -X POST http://localhost:3000/overdues/generate?month=10&year=2025 -H "X-Consortium: MiConsorcio"

