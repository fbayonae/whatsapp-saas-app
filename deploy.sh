#!/bin/bash

echo "🔁 Haciendo pull de la última versión del repositorio..."
sudo git pull origin main

echo "🧹 Cerrando contenedores anteriores..."
docker-compose down

echo "🔨 Reconstruyendo imágenes sin caché..."
docker-compose build --no-cache

echo "🚀 Levantando contenedores en segundo plano..."
docker-compose up -d

echo "🧽 Limpiando recursos no utilizados..."
docker system prune -f

echo "✅ Despliegue completado correctamente."
