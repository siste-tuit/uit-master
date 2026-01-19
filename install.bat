@echo off
echo ========================================
echo    ERP TEXTIL - Instalacion y Setup
echo ========================================
echo.

echo [1/5] Instalando dependencias del proyecto principal...
call npm install
if %errorlevel% neq 0 (
    echo Error instalando dependencias principales
    pause
    exit /b 1
)

echo.
echo [2/5] Instalando dependencias del backend...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo Error instalando dependencias del backend
    pause
    exit /b 1
)

echo.
echo [3/5] Instalando dependencias del frontend...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo Error instalando dependencias del frontend
    pause
    exit /b 1
)

echo.
echo [4/5] Configurando base de datos...
cd ..\backend
echo.
echo IMPORTANTE: Asegurate de tener PostgreSQL instalado y ejecutandose
echo.
echo Creando base de datos...
echo CREATE DATABASE erp_textil; | psql -U postgres
if %errorlevel% neq 0 (
    echo Advertencia: No se pudo crear la base de datos automaticamente
    echo Por favor crea manualmente la base de datos 'erp_textil' en PostgreSQL
)

echo.
echo Ejecutando migraciones...
call npx prisma migrate dev --name init
if %errorlevel% neq 0 (
    echo Error ejecutando migraciones
    echo Por favor verifica la conexion a la base de datos
    pause
    exit /b 1
)

echo.
echo Generando cliente Prisma...
call npx prisma generate
if %errorlevel% neq 0 (
    echo Error generando cliente Prisma
    pause
    exit /b 1
)

echo.
echo [5/5] Configuracion completada!
echo.
echo ========================================
echo    CONFIGURACION FINAL
echo ========================================
echo.
echo 1. Copia el archivo backend\env.example a backend\.env
echo 2. Edita backend\.env con tus credenciales de PostgreSQL
echo 3. Ejecuta 'npm run dev' para iniciar el servidor
echo.
echo Credenciales por defecto:
echo - Admin: admin@textil.com / admin123
echo - Produccion: prod@textil.com / prod123
echo - Ventas: ventas@textil.com / ventas123
echo.
echo ========================================
echo.
pause
