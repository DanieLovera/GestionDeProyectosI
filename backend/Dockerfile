# Usa una imagen base de Node
FROM node:18-alpine

# Instala herramientas necesarias para compilar sqlite3
RUN apk add --no-cache python3 make g++

# Crea el directorio de trabajo
WORKDIR /app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala node-addon-api antes para evitar el fallo de sqlite3
RUN npm install node-addon-api --save-dev

# Instala las dependencias del proyecto
RUN npm install

# Copia el resto del código
COPY . .

# Crea la base de datos y da permisos
RUN touch database.db && chmod 666 database.db

# Expone el puerto
EXPOSE 3000

# Comando por defecto (modo desarrollo)
CMD ["npm", "run", "dev"]
