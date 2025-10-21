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

3) Levantar con Docker Compose (recomendado)
- Desde la raíz del proyecto:
  - docker compose up --build -d
  - docker compose logs -f (para ver inicialización)
- Si el contenedor del backend incluye un script de seed automático, la base de datos y los datos iniciales estarán listos tras el arranque.

4) Ejecutar script de seed manualmente (si existe)
- Desde la raíz o carpeta `backend`:
  - docker compose exec backend npm run seed
  - o (local) cd backend && npm install && npm run seed
- Si no hay script, usa el ejemplo SQL o la API abajo.

5) Ejemplo de inserción SQL (Postgres)
- Conéctate a la BD y ejecuta:
  - INSERT INTO users (name, email, password, role) VALUES ('Admin','admin@example.com','<hash_de_password>','admin');
- Nota: normalmente el password debe guardarse hasheado. Preferible usar el script de seed o la API que haga hash automáticamente.

6) Crear usuario inicial vía API (ejemplo curl)
- Ajusta host/puerto y rutas según tu backend:
  - Registro:
    - curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d '{"name":"Admin","email":"admin@example.com","password":"Admin1234"}'
  - Login:
    - curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@example.com","password":"Admin1234"}'
- Respuesta típica: token y datos del usuario. Usa ese token para llamadas autenticadas.

7) Credenciales de ejemplo (ajusta en `.env` o en el seed)
- Email: admin@example.com
- Contraseña: Admin1234
