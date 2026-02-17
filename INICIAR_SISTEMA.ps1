<# 
 Script para iniciar el sistema UIT-MASTER
 Ejecutar con: .\INICIAR_SISTEMA.ps1

 Ahora las credenciales y variables sensibles se leen desde un archivo .env.local
 en la raíz del proyecto (no debe subirse a Git).
#>

Write-Host "🚀 Iniciando Sistema UIT-MASTER..." -ForegroundColor Cyan
Write-Host ""

# Detener procesos Node existentes
Write-Host "Deteniendo procesos Node existentes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Ruta del proyecto y archivo .env.local
$projectPath = "D:\Empresa UIT\UIT-master"
$envFilePath = Join-Path $projectPath ".env.local"

# Cargar variables de entorno desde .env.local si existe
if (Test-Path $envFilePath) {
    Write-Host "📄 Cargando variables de entorno desde .env.local..." -ForegroundColor Cyan
    Get-Content $envFilePath | ForEach-Object {
        if ($_ -match '^\s*#' -or $_ -match '^\s*$') { return }
        $parts = $_ -split '=', 2
        if ($parts.Length -eq 2) {
            $name = $parts[0].Trim()
            $value = $parts[1].Trim()
            Set-Item -Path "Env:$name" -Value $value
        }
    }
} else {
    Write-Host "⚠️  Archivo .env.local no encontrado. Usando variables de entorno del sistema." -ForegroundColor Yellow
}

# Valor por defecto para el puerto del backend si no está definido en el entorno
if (-not $env:PORT) { $env:PORT = '5000' }

# Cambiar al directorio del proyecto
Set-Location $projectPath

# Iniciar Backend (server/)
Write-Host "Iniciando Backend (server/) en puerto $($env:PORT)..." -ForegroundColor Green
$backendPath = Join-Path $projectPath "server"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host '=== BACKEND SERVER (Puerto $($env:PORT)) ===' -ForegroundColor Cyan; npm run dev"

# Iniciar Frontend (frontend/) – Vite está configurado para usar el puerto 3000
Write-Host "Iniciando Frontend (frontend/) en puerto 3000..." -ForegroundColor Green
$frontendPath = Join-Path $projectPath "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host '=== FRONTEND (Puerto 3000) ===' -ForegroundColor Cyan; npm run dev"

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
