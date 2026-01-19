# Script de Despliegue Guiado - Sistema UIT
# Este script ayuda a ejecutar las migraciones y verificar el sistema

Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🚀 SCRIPT DE DESPLIEGUE - Sistema UIT" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════`n" -ForegroundColor Cyan

# Función para verificar si existe un comando
function Test-Command {
    param($Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

# Verificar dependencias
Write-Host "🔍 Verificando dependencias..." -ForegroundColor Yellow
if (-not (Test-Command "node")) {
    Write-Host "❌ Node.js no está instalado" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js encontrado: $(node --version)" -ForegroundColor Green

if (-not (Test-Command "npm")) {
    Write-Host "❌ npm no está instalado" -ForegroundColor Red
    exit 1
}
Write-Host "✅ npm encontrado: $(npm --version)`n" -ForegroundColor Green

# Menú de opciones
Write-Host "Selecciona una opción:" -ForegroundColor Cyan
Write-Host "  1. Ejecutar migraciones de base de datos (producción)" -ForegroundColor White
Write-Host "  2. Verificar estructura de base de datos" -ForegroundColor White
Write-Host "  3. Generar JWT_SECRET seguro" -ForegroundColor White
Write-Host "  4. Salir`n" -ForegroundColor White

$opcion = Read-Host "Ingresa el número de opción"

switch ($opcion) {
    "1" {
        Write-Host "`n🔄 Ejecutando migraciones..." -ForegroundColor Yellow
        
        # Solicitar credenciales de producción
        Write-Host "`n⚠️  IMPORTANTE: Ingresa las credenciales de PRODUCCIÓN" -ForegroundColor Yellow
        $DB_HOST = Read-Host "DB_HOST (ej: mysql123.jawsdb.com:3306)"
        $DB_USER = Read-Host "DB_USER"
        $DB_PASS = Read-Host "DB_PASS" -AsSecureString
        $DB_PASS_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
            [Runtime.InteropServices.Marshal]::SecureStringToBSTR($DB_PASS)
        )
        $DB_NAME = Read-Host "DB_NAME" -Default "uit"
        
        # Configurar variables de entorno
        $env:DB_HOST = $DB_HOST
        $env:DB_USER = $DB_USER
        $env:DB_PASS = $DB_PASS_PLAIN
        $env:DB_NAME = $DB_NAME
        
        # Cambiar al directorio del servidor
        Push-Location "server"
        
        # Ejecutar migraciones
        Write-Host "`n📊 Ejecutando migraciones...`n" -ForegroundColor Cyan
        try {
            node src/scripts/migrate.js
            node src/scripts/migrateProduccion.js
            node src/scripts/migrateInventario.js
            node src/scripts/migrateReportesProduccion.js
            node src/scripts/migrateContabilidad.js
            
            Write-Host "`n✅ ¡Migraciones completadas exitosamente!`n" -ForegroundColor Green
        } catch {
            Write-Host "`n❌ Error al ejecutar migraciones: $_`n" -ForegroundColor Red
        } finally {
            Pop-Location
            # Limpiar variables sensibles
            Remove-Item Env:\DB_PASS
        }
    }
    
    "2" {
        Write-Host "`n🔍 Verificando estructura de base de datos..." -ForegroundColor Yellow
        Write-Host "⚠️  Esta opción requiere configuración de conexión a BD`n" -ForegroundColor Yellow
        # Aquí podrías agregar un script de verificación
    }
    
    "3" {
        Write-Host "`n🔐 Generando JWT_SECRET seguro...`n" -ForegroundColor Yellow
        $secret = node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
        Write-Host "Tu JWT_SECRET seguro:" -ForegroundColor Green
        Write-Host $secret -ForegroundColor White
        Write-Host "`n⚠️  GUARDA ESTE VALOR DE FORMA SEGURA - NO LO COMPARTAS`n" -ForegroundColor Red
    }
    
    "4" {
        Write-Host "`n👋 ¡Hasta luego!`n" -ForegroundColor Cyan
        exit 0
    }
    
    default {
        Write-Host "`n❌ Opción inválida`n" -ForegroundColor Red
        exit 1
    }
}

Write-Host "═══════════════════════════════════════════════════`n" -ForegroundColor Cyan
