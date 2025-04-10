FROM node:18-alpine

# Crear directorio de trabajo
WORKDIR /app
RUN mkdir -p uploads

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias y nodemon globalmente
RUN npm install && npm install -g nodemon
# Copiar el resto de los archivos de la aplicación
COPY . .

# Exponer el puerto de la aplicación
EXPOSE 3001

# Compila el cliente de Prisma
RUN npx prisma generate || echo "Sin schema definido todavía"

# Usar nodemon en lugar de node
CMD ["nodemon", "src/index.js"]
