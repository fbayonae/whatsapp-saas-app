FROM node:23.11.0-alpine3.19

# Establecer variables de entorno
ENV NODE_ENV=production

# Directorio de trabajo
WORKDIR /app

# Crear carpetas necesarias
RUN mkdir -p uploads downloads

# Instalar dependencias necesarias
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    curl

# Copiar y instalar dependencias
COPY package*.json ./
RUN npm install --omit=dev && npm install -g nodemon

# Copiar el resto del código
COPY . .

# Generar Prisma Client
RUN npx prisma generate || echo "No Prisma schema yet"

# Exponer puerto
EXPOSE 3001

# Comando por defecto
CMD ["node", "src/server.js"]