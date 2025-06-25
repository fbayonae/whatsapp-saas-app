FROM node:23.11.0-slim

# Establecer variables de entorno para no tener prompts en instalaciones
ENV NODE_ENV=production

# Establecer directorio de trabajo
WORKDIR /app

# Crear carpetas necesarias
RUN mkdir -p uploads downloads

# Instalar dependencias necesarias para ciertos paquetes nativos (opcional)
# Solo si usas librerías que necesitan compilación como sharp, bcrypt, etc.
RUN apt-get update && apt-get install -y \
  python3 \
  build-essential \
  && rm -rf /var/lib/apt/lists/*

# Copiar y instalar dependencias
COPY package*.json ./
RUN npm install --omit=dev && npm install -g nodemon

# Copiar el resto del código
COPY . .

# Generar Prisma Client (sin bloquear si no hay schema aún)
RUN npx prisma generate || echo "No Prisma schema yet"

# Exponer puerto de la app
EXPOSE 3001

# Comando por defecto
CMD ["node", "src/server.js"]
