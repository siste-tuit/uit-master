# Script para iniciar el sistema UIT-MASTER
# Ejecutar con: .\INICIAR_SISTEMA.ps1

Write-Host "🚀 Iniciando Sistema UIT-MASTER..." -ForegroundColor Cyan
Write-Host ""

# Detener procesos Node existentes
Write-Host "Deteniendo procesos Node existentes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Configurar variables de entorno para el backend
$env:DB_HOST = 'localhost'
$env:DB_USER = 'root'
$env:DB_PASS = 'Muni2025...'
$env:DB_NAME = 'uit'
$env:PORT = '5000'
$env:JWT_SECRET = 'uit_master_secret_123'

# Cambiar al directorio del proyecto
Set-Location "D:\Empresa UIT\UIT-master"

# Iniciar Backend
Write-Host "Iniciando Backend en puerto 5000..." -ForegroundColor Green
$backendPath = "D:\Empresa UIT\UIT-master\server"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host '=== BACKEND SERVER (Puerto 5000) ===' -ForegroundColor Cyan; `$env:DB_HOST='localhost'; `$env:DB_USER='root'; `$env:DB_PASS='Muni2025...'; `$env:DB_NAME='uit'; `$env:PORT='5000'; `$env:JWT_SECRET='uit_master_secret_123'; npm run dev"

# Iniciar Frontend
Write-Host "Iniciando Frontend en puerto 3000..." -ForegroundColor Green
$frontendPath = "D:\Empresa UIT\UIT-master\frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host '=== FRONTEND SERVER (Puerto 3000) ===' -ForegroundColor Cyan; npm run dev"

Write-Host ""
Write-Host "⏳ Esperando 10 segundos para que los servidores inicien..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "🔍 Verificando estado de los servidores..." -ForegroundColor Cyan
Write-Host ""

# Verificar Backend
$backendOK = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/ping" -Method GET -TimeoutSec 5
    Write-Host "✅ Backend: ACTIVO en puerto 5000" -ForegroundColor Green
    $backendOK = $true
} catch {
    Write-Host "❌ Backend: No responde - Verifica la ventana del backend" -ForegroundColor Red
}

# Verificar Frontend
$frontendOK = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 5
    Write-Host "✅ Frontend: ACTIVO en puerto 3000" -ForegroundColor Green
    $frontendOK = $true
} catch {
    Write-Host "❌ Frontend: No responde - Verifica la ventana del frontend" -ForegroundColor Yellow
}

Write-Host ""
if ($backendOK -and $frontendOK) {
    Write-Host "🎉 ¡Sistema completamente operativo!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📱 Frontend: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "🔧 Backend:  http://localhost:5000" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🔐 Credenciales:" -ForegroundColor Yellow
    Write-Host "   Email: admin@textil.com" -ForegroundColor White
    Write-Host "   Contraseña: demo123" -ForegroundColor White
} else {
    Write-Host "⚠️  Algunos servidores aún no responden." -ForegroundColor Yellow
    Write-Host "   Revisa las ventanas PowerShell que se abrieron." -ForegroundColor Yellow
}

Write-Host ""
