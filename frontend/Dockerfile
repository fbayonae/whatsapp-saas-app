# Etapa 1: Construcción
FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Etapa 2: Servir con nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Opcional: eliminar default.conf si no usas uno personalizado
RUN rm /etc/nginx/conf.d/default.conf
