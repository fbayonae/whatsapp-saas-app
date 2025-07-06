FROM node:23.11.0-bookworm-slim

# Establecer variables de entorno
ENV NODE_ENV=production
ENV DEBIAN_FRONTEND=noninteractive

# Directorio de trabajo
WORKDIR /app

# Crear carpetas necesarias
RUN mkdir -p uploads downloads

# SOLUCIÓN: Actualizar repositorios y claves GPG
RUN apt-get update --allow-releaseinfo-change \
    && apt-get install -y --no-install-recommends \
        ca-certificates \
        gnupg \
        curl \
    && curl -sSL https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && curl -sSL https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add - \
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

# Generar Prisma Client
RUN npx prisma generate || echo "No Prisma schema yet"

# Exponer puerto
EXPOSE 3001

# Comando por defecto
CMD ["node", "src/server.js"]