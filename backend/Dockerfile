#FROM node:23.11.0-slim
FROM node:23.11.0-bookworm-slim

# Establecer variables de entorno para no tener prompts en instalaciones
ENV NODE_ENV=production

# Establecer directorio de trabajo
WORKDIR /app

# Crear carpetas necesarias
RUN mkdir -p uploads downloads

# SOLUCIÓN: Actualizar claves GPG antes de apt-get
RUN apt-get update --allow-releaseinfo-change -o Acquire::AllowInsecureRepositories=true -o Acquire::AllowDowngradeToInsecureRepositories=true \
    && apt-get install -y --no-install-recommends \
       ca-certificates \
       gnupg \
    && apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 0xA1BC6A3CF7E4CD5E \
    && rm -rf /var/lib/apt/lists/*

# Instalar dependencias necesarias
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