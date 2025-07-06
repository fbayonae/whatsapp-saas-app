# backend/Dockerfile
FROM node:20-alpine3.19 

ENV NODE_ENV=production
WORKDIR /app

# Instalar dependencias con apk (no apt-get)
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    curl \
    # Agrega librerías para Prisma:
    openssl

RUN mkdir -p uploads downloads
COPY package*.json ./
RUN npm install --omit=dev
COPY . .

# Generar Prisma Client (maneja errores)
RUN npx prisma generate || echo "Prisma skip"

EXPOSE 3001
CMD ["node", "src/server.js"]