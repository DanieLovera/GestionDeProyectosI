# Backend — Instrucciones rápidas

Breve guía para levantar el backend y crear los datos iniciales (usuario administrativo).

1) Requisitos
- Node.js y npm (si ejecutas local).
- Docker y Docker Desktop (recomendado para entornos reproducibles).
- Ajusta rutas/puertos según tu proyecto.

2) Variables de entorno
Copia `.env.example` a `.env` en la carpeta del backend y ajusta las variables:
- DB_HOST=localhost
- DB_PORT=5432
- DB_USER=postgres
- DB_PASS=postgres
- DB_NAME=mi_base_de_datos
- ADMIN_EMAIL=admin@example.com
- ADMIN_PASSWORD=Admin1234
- TENANTS_DIR=./data/tenants  <!-- opcional: carpeta donde se crean las DB por consorcio -->

3) Levantar con Docker Compose (recomendado)
- Desde la raíz del proyecto:
  - docker compose up --build -d
  - docker compose logs -f (para ver inicialización)

4) Multitenancy por consorcio
- La base global `./data/database.db` solo guarda usuarios.
- Cada consorcio tiene su propia base: `./data/tenants/<slug>/database.db`.
- Al registrarse un usuario (POST /users/register) se crea la base del consorcio e inserta datos iniciales (unidades, gastos comunes, config de comisión, etc.).
- Para acceder a datos de un consorcio:
  - Preferido: usa token JWT (el claim `consortium` se añade en el login).
  - Alternativa para pruebas: manda el header `X-Consortium: <nombre>`.

5) Crear usuario inicial vía API (ejemplo curl)
- Registro:
  - curl -X POST http://localhost:3000/users/register -H "Content-Type: application/json" -d '{"name":"Admin","email":"admin@example.com","password":"Admin1234","role":"admin","consortium":"MiConsorcio"}'
- Login:
  - curl -X POST http://localhost:3000/users/login -H "Content-Type: application/json" -d '{"email":"admin@example.com","password":"Admin1234"}'
- Con el token, ya no necesitas `X-Consortium`.

6) Generar moras (ejemplo)
- curl -X POST "http://localhost:3000/overdues/generate?month=10&year=2025" -H "X-Consortium: MiConsorcio"

7) Credenciales de ejemplo (ajusta en `.env` o en el seed)
- Email: admin@example.com
- Contraseña: Admin1234
