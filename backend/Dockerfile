FROM node:18-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias y nodemon globalmente
RUN npm install && npm install -g nodemon
# Copiar el resto de los archivos de la aplicación
COPY . .

# Exponer el puerto de la aplicación
EXPOSE 3001

# Usar nodemon en lugar de node
CMD ["nodemon", "src/index.js"]
