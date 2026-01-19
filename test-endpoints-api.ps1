# Script para probar endpoints API del sistema UIT
# Requiere: PowerShell 5.1+ y backend corriendo

param(
    [string]$BaseUrl = "http://localhost:5000",
    [string]$Token = ""
)

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "TESTING DE ENDPOINTS API - Sistema UIT" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Funcion para hacer peticiones HTTP
function Test-Endpoint {
    param(
        [string]$Method = "GET",
        [string]$Endpoint,
        [hashtable]$Headers = @{},
        [object]$Body = $null
    )
    
    $url = "$BaseUrl$Endpoint"
    Write-Host "Test: $Method $Endpoint" -ForegroundColor Yellow -NoNewline
    
    try {
        $params = @{
            Uri = $url
            Method = $Method
            Headers = $Headers
            ContentType = "application/json"
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-RestMethod @params -ErrorAction Stop
        
        Write-Host " - OK" -ForegroundColor Green
        return @{ Success = $true; Data = $response }
    }
    catch {
        $statusCode = ""
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode.value__
        }
        Write-Host " - ERROR ($statusCode)" -ForegroundColor Red
        return @{ Success = $false; Error = $_.Exception.Message; StatusCode = $statusCode }
    }
}

# 1. Testing de Health Check
Write-Host "1. HEALTH CHECK" -ForegroundColor Cyan
Write-Host ""
Test-Endpoint -Method "GET" -Endpoint "/ping" | Out-Null

# 2. Testing de Autenticacion
Write-Host ""
Write-Host "2. AUTENTICACION" -ForegroundColor Cyan
Write-Host ""

# Login
$loginResponse = Test-Endpoint -Method "POST" -Endpoint "/api/auth/login" -Body @{
    email = "admin@textil.com"
    password = "demo123"
}

if ($loginResponse.Success) {
    $Token = $loginResponse.Data.token
    Write-Host "Token obtenido correctamente" -ForegroundColor Green
} else {
    Write-Host "No se pudo obtener token. Continuando sin autenticacion..." -ForegroundColor Yellow
}

# Headers con autenticacion
$authHeaders = @{}
if ($Token) {
    $authHeaders["Authorization"] = "Bearer $Token"
}

# 3. Testing de Endpoints de Produccion
Write-Host ""
Write-Host "3. PRODUCCION" -ForegroundColor Cyan
Write-Host ""
Test-Endpoint -Method "GET" -Endpoint "/api/produccion/ingenieria" -Headers $authHeaders | Out-Null
Test-Endpoint -Method "GET" -Endpoint "/api/produccion/lineas-con-usuarios" -Headers $authHeaders | Out-Null
Test-Endpoint -Method "GET" -Endpoint "/api/produccion/metricas" -Headers $authHeaders | Out-Null

# 4. Testing de Endpoints de Usuarios
Write-Host ""
Write-Host "4. USUARIOS" -ForegroundColor Cyan
Write-Host ""
Test-Endpoint -Method "GET" -Endpoint "/api/users" -Headers $authHeaders | Out-Null

# 5. Testing de Endpoints de Roles
Write-Host ""
Write-Host "5. ROLES" -ForegroundColor Cyan
Write-Host ""
Test-Endpoint -Method "GET" -Endpoint "/api/roles" -Headers $authHeaders | Out-Null

# 6. Testing de Endpoints de Inventario
Write-Host ""
Write-Host "6. INVENTARIO" -ForegroundColor Cyan
Write-Host ""
Test-Endpoint -Method "GET" -Endpoint "/api/inventario/por-departamento?departamento=ingenieria" -Headers $authHeaders | Out-Null

# 7. Testing de Endpoints de Incidencias
Write-Host ""
Write-Host "7. INCIDENCIAS" -ForegroundColor Cyan
Write-Host ""
Test-Endpoint -Method "GET" -Endpoint "/api/incidencias" -Headers $authHeaders | Out-Null

# Resumen
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Testing completado" -ForegroundColor Green
Write-Host "Si todos los endpoints muestran OK, el sistema funciona correctamente." -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
