#!/bin/bash

echo "========================================"
echo "    ERP TEXTIL - Instalación y Setup"
echo "========================================"
echo

echo "[1/5] Instalando dependencias del proyecto principal..."
npm install
if [ $? -ne 0 ]; then
    echo "Error instalando dependencias principales"
    exit 1
fi

echo
echo "[2/5] Instalando dependencias del backend..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "Error instalando dependencias del backend"
    exit 1
fi

echo
echo "[3/5] Instalando dependencias del frontend..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo "Error instalando dependencias del frontend"
    exit 1
fi

echo
echo "[4/5] Configurando base de datos..."
cd ../backend
echo
echo "IMPORTANTE: Asegúrate de tener PostgreSQL instalado y ejecutándose"
echo
echo "Creando base de datos..."
createdb erp_textil 2>/dev/null || echo "Base de datos ya existe o error al crear"

echo
echo "Ejecutando migraciones..."
npx prisma migrate dev --name init
if [ $? -ne 0 ]; then
    echo "Error ejecutando migraciones"
    echo "Por favor verifica la conexión a la base de datos"
    exit 1
fi

echo
echo "Generando cliente Prisma..."
npx prisma generate
if [ $? -ne 0 ]; then
    echo "Error generando cliente Prisma"
    exit 1
fi

echo
echo "[5/5] Configuración completada!"
echo
echo "========================================"
echo "    CONFIGURACIÓN FINAL"
echo "========================================"
echo
echo "1. Copia el archivo backend/env.example a backend/.env"
echo "2. Edita backend/.env con tus credenciales de PostgreSQL"
echo "3. Ejecuta 'npm run dev' para iniciar el servidor"
echo
echo "Credenciales por defecto:"
echo "- Admin: admin@textil.com / admin123"
echo "- Producción: prod@textil.com / prod123"
echo "- Ventas: ventas@textil.com / ventas123"
echo
echo "========================================"
echo
