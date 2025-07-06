# frontend/Dockerfile
FROM node:23.11.0-alpine3.19 AS build
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist /usr/share/nginx/html
# Elimina esta línea ↓
# COPY infra/nginx/nginx.conf /etc/nginx/conf.d/