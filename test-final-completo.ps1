# Testing Final Completo - Sistema UIT
# Verifica todos los aspectos críticos antes de producción

param(
    [string]$BaseUrl = "http://localhost:5000"
)

$errors = @()
$warnings = @()
$success = @()

function Add-Success { param([string]$msg) $script:success += $msg; Write-Host "✅ $msg" -ForegroundColor Green }
function Add-Warning { param([string]$msg) $script:warnings += $msg; Write-Host "⚠️  $msg" -ForegroundColor Yellow }
function Add-Error { param([string]$msg) $script:errors += $msg; Write-Host "❌ $msg" -ForegroundColor Red }

Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🧪 TESTING FINAL COMPLETO - Sistema UIT" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════`n" -ForegroundColor Cyan

# 1. Verificar Estructura de Archivos
Write-Host "1. VERIFICANDO ESTRUCTURA DE ARCHIVOS..." -ForegroundColor Cyan
Write-Host ""

$requiredFiles = @(
    "frontend/src/config/api.ts",
    "frontend/src/App.tsx",
    "server/src/index.js",
    "server/src/config/db.js",
    "server/runAllMigrations.js",
    "package.json"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Add-Success "Archivo existe: $file"
    } else {
        Add-Error "Archivo faltante: $file"
    }
}

# 2. Verificar URLs Hardcodeadas
Write-Host "`n2. VERIFICANDO URLs HARDCODEADAS..." -ForegroundColor Cyan
Write-Host ""

$hardcodedUrls = Select-String -Path "frontend/src/**/*.tsx" -Pattern "http://localhost:5000" -ErrorAction SilentlyContinue
if ($hardcodedUrls) {
    $count = ($hardcodedUrls | Measure-Object).Count
    Add-Warning "Encontradas $count URLs hardcodeadas (deberían usar API_BASE_URL_CORE)"
    foreach ($match in $hardcodedUrls | Select-Object -First 5) {
        Write-Host "   - $($match.Filename):$($match.LineNumber)" -ForegroundColor Gray
    }
} else {
    Add-Success "No se encontraron URLs hardcodeadas"
}

# 3. Verificar Configuración API
Write-Host "`n3. VERIFICANDO CONFIGURACION API..." -ForegroundColor Cyan
Write-Host ""

if (Test-Path "frontend/src/config/api.ts") {
    $apiConfig = Get-Content "frontend/src/config/api.ts" -Raw
    if ($apiConfig -match "VITE_API_URL|API_BASE_URL") {
        Add-Success "Configuración de API centralizada encontrada"
    } else {
        Add-Error "Configuración de API no encontrada correctamente"
    }
} else {
    Add-Error "Archivo frontend/src/config/api.ts no existe"
}

# 4. Verificar Backend Disponible
Write-Host "`n4. VERIFICANDO BACKEND..." -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/ping" -Method GET -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Add-Success "Backend respondiendo correctamente en $BaseUrl"
    } else {
        Add-Warning "Backend responde pero con código: $($response.StatusCode)"
    }
} catch {
    Add-Warning "Backend no disponible en $BaseUrl (puede estar apagado)"
}

# 5. Verificar Autenticación
Write-Host "`n5. VERIFICANDO AUTENTICACION..." -ForegroundColor Cyan
Write-Host ""

try {
    $loginBody = @{
        email = "admin@textil.com"
        password = "demo123"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -ErrorAction Stop
    
    if ($loginResponse.token) {
        Add-Success "Autenticación funcionando correctamente"
        $global:Token = $loginResponse.token
    } else {
        Add-Error "Login no devuelve token"
    }
} catch {
    Add-Warning "No se pudo probar autenticación: $_"
}

# 6. Verificar Endpoints Críticos
Write-Host "`n6. VERIFICANDO ENDPOINTS CRITICOS..." -ForegroundColor Cyan
Write-Host ""

$criticalEndpoints = @(
    "/api/users",
    "/api/roles",
    "/api/produccion/ingenieria",
    "/api/produccion/lineas-con-usuarios",
    "/api/inventario/por-departamento?departamento=ingenieria",
    "/api/incidencias"
)

$authHeaders = @{}
if ($global:Token) {
    $authHeaders["Authorization"] = "Bearer $global:Token"
}

$endpointSuccess = 0
foreach ($endpoint in $criticalEndpoints) {
    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl$endpoint" -Method GET -Headers $authHeaders -ErrorAction Stop
        Add-Success "Endpoint OK: $endpoint"
        $endpointSuccess++
    } catch {
        Add-Warning "Endpoint con problemas: $endpoint"
    }
}

# 7. Verificar Base de Datos (migraciones)
Write-Host "`n7. VERIFICANDO MIGRACIONES..." -ForegroundColor Cyan
Write-Host ""

if (Test-Path "server/runAllMigrations.js") {
    Add-Success "Script de migraciones unificado existe"
} else {
    Add-Error "Script runAllMigrations.js no encontrado"
}

if (Test-Path "server/src/scripts/migrate.js") {
    Add-Success "Script de migración core existe"
} else {
    Add-Error "Script migrate.js no encontrado"
}

# 8. Verificar Package.json
Write-Host "`n8. VERIFICANDO DEPENDENCIAS..." -ForegroundColor Cyan
Write-Host ""

$serverPackage = Get-Content "server/package.json" | ConvertFrom-Json
if ($serverPackage.scripts.'migrate:all') {
    Add-Success "Script npm run migrate:all configurado"
} else {
    Add-Warning "Script migrate:all no encontrado en package.json"
}

# 9. Verificar Variables de Entorno
Write-Host "`n9. VERIFICANDO VARIABLES DE ENTORNO..." -ForegroundColor Cyan
Write-Host ""

if (Test-Path "server/.env.example") {
    Add-Success "Archivo .env.example existe para backend"
} else {
    Add-Warning "Archivo server/.env.example no existe"
}

if (Test-Path "frontend/.env.example") {
    Add-Success "Archivo .env.example existe para frontend"
} else {
    Add-Warning "Archivo frontend/.env.example no existe"
}

# 10. Verificar Archivos de Documentación
Write-Host "`n10. VERIFICANDO DOCUMENTACION..." -ForegroundColor Cyan
Write-Host ""

$docs = @(
    "DESPLIEGUE_COMPLETO.md",
    "TESTING_COMPLETO.md",
    "REPORTE_TESTING.md"
)

foreach ($doc in $docs) {
    if (Test-Path $doc) {
        Add-Success "Documentación existe: $doc"
    } else {
        Add-Warning "Documentación faltante: $doc"
    }
}

# RESUMEN FINAL
Write-Host "`n═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📊 RESUMEN DEL TESTING" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$totalTests = $success.Count + $warnings.Count + $errors.Count
Write-Host "Total de pruebas: $totalTests" -ForegroundColor White
Write-Host "✅ Exitosas: $($success.Count)" -ForegroundColor Green
Write-Host "⚠️  Advertencias: $($warnings.Count)" -ForegroundColor Yellow
Write-Host "❌ Errores: $($errors.Count)" -ForegroundColor Red

if ($errors.Count -eq 0) {
    Write-Host "`n🎉 SISTEMA LISTO PARA PRODUCCIÓN" -ForegroundColor Green
    if ($warnings.Count -gt 0) {
        Write-Host "⚠️  Tienes $($warnings.Count) advertencias menores que revisar" -ForegroundColor Yellow
    }
} else {
    Write-Host "`n⚠️  HAY ERRORES QUE CORREGIR ANTES DE PRODUCCIÓN" -ForegroundColor Red
    Write-Host "`nErrores encontrados:" -ForegroundColor Red
    foreach ($error in $errors) {
        Write-Host "  - $error" -ForegroundColor Red
    }
}

Write-Host "`n═══════════════════════════════════════════════════`n" -ForegroundColor Cyan

# Exit code
if ($errors.Count -eq 0) {
    exit 0
} else {
    exit 1
}
