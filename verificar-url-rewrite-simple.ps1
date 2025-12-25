# Script simple y rápido para verificar URL Rewrite
# Ejecutar como Administrador

Write-Host "Verificando URL Rewrite..." -ForegroundColor Cyan
Write-Host ""

$instalado = $false
$metodos = @()

# Verificación 1: módulo IIS (más confiable)
Write-Host "[1] Verificando módulo en IIS..." -ForegroundColor Yellow
try {
    Import-Module WebAdministration -ErrorAction SilentlyContinue
    $module = Get-WebGlobalModule | Where-Object { $_.Name -like "*Rewrite*" }
    if ($module) {
        Write-Host "   ✓ Módulo encontrado en IIS: $($module.Name)" -ForegroundColor Green
        $instalado = $true
        $metodos += "Módulo IIS"
    } else {
        Write-Host "   ✗ Módulo no encontrado en IIS" -ForegroundColor Red
    }
} catch {
    Write-Host "   ⚠ No se pudo verificar (WebAdministration no disponible)" -ForegroundColor Yellow
}
Write-Host ""

# Verificación 2: carpeta de instalación (puede estar en otra ubicación)
Write-Host "[2] Verificando carpeta de instalación..." -ForegroundColor Yellow
$rutasPosibles = @(
    "C:\Program Files\IIS\URL Rewrite",
    "C:\Program Files (x86)\IIS\URL Rewrite",
    "${env:ProgramFiles}\IIS\URL Rewrite",
    "${env:ProgramFiles(x86)}\IIS\URL Rewrite"
)

$carpetaEncontrada = $false
foreach ($ruta in $rutasPosibles) {
    if (Test-Path $ruta) {
        Write-Host "   ✓ Carpeta encontrada: $ruta" -ForegroundColor Green
        $instalado = $true
        $carpetaEncontrada = $true
        $metodos += "Carpeta de instalación"
        break
    }
}

if (-not $carpetaEncontrada) {
    Write-Host "   ⚠ Carpeta no encontrada en rutas estándar" -ForegroundColor Yellow
    Write-Host "      (Esto es normal si el módulo está instalado de otra forma)" -ForegroundColor Gray
}
Write-Host ""

# Resumen
Write-Host "========================================" -ForegroundColor Cyan
if ($instalado) {
    Write-Host "✓ URL Rewrite ESTÁ INSTALADO" -ForegroundColor Green
    Write-Host ""
    Write-Host "Métodos que confirmaron la instalación:" -ForegroundColor White
    foreach ($metodo in $metodos) {
        Write-Host "  - $metodo" -ForegroundColor Green
    }
    Write-Host ""
    Write-Host "Tu aplicación debería funcionar correctamente con el web.config" -ForegroundColor Green
} else {
    Write-Host "✗ URL Rewrite NO ESTÁ INSTALADO" -ForegroundColor Red
    Write-Host ""
    Write-Host "Para instalar:" -ForegroundColor Yellow
    Write-Host "1. https://www.iis.net/downloads/microsoft/url-rewrite" -ForegroundColor White
    Write-Host "2. Instalar el .msi" -ForegroundColor White
    Write-Host "3. Ejecutar: iisreset" -ForegroundColor White
}
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

