# Script para descargar e instalar URL Rewrite para IIS
# Ejecutar como Administrador

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Instalación de URL Rewrite para IIS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si ya está instalado
if (Test-Path "C:\Program Files\IIS\URL Rewrite") {
    Write-Host "⚠ URL Rewrite ya parece estar instalado" -ForegroundColor Yellow
    Write-Host "¿Deseas continuar de todos modos? (S/N): " -NoNewline -ForegroundColor Yellow
    $continuar = Read-Host
    if ($continuar -ne "S" -and $continuar -ne "s") {
        Write-Host "Instalación cancelada." -ForegroundColor Yellow
        exit
    }
}

# URL de descarga
$downloadUrl = "https://download.microsoft.com/download/1/2/8/128E2E22-C1B9-44A4-BE2A-5859ED1D4592/rewrite_amd64_en-US.msi"
$installerPath = "$env:TEMP\rewrite_amd64_en-US.msi"

Write-Host "[1] Descargando URL Rewrite..." -ForegroundColor Yellow
Write-Host "    URL: $downloadUrl" -ForegroundColor Gray
Write-Host "    Destino: $installerPath" -ForegroundColor Gray
Write-Host ""

try {
    # Descargar el instalador
    Invoke-WebRequest -Uri $downloadUrl -OutFile $installerPath -UseBasicParsing
    Write-Host "✓ Descarga completada" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "✗ Error al descargar: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Descarga manual:" -ForegroundColor Yellow
    Write-Host "1. Visita: https://www.iis.net/downloads/microsoft/url-rewrite" -ForegroundColor White
    Write-Host "2. Descarga: rewrite_amd64_en-US.msi" -ForegroundColor White
    Write-Host "3. Ejecuta el instalador manualmente" -ForegroundColor White
    exit
}

Write-Host "[2] Instalando URL Rewrite..." -ForegroundColor Yellow
Write-Host "    Esto puede tardar unos momentos..." -ForegroundColor Gray
Write-Host ""

try {
    # Instalar silenciosamente
    $process = Start-Process -FilePath "msiexec.exe" -ArgumentList "/i `"$installerPath`" /quiet /norestart" -Wait -PassThru -NoNewWindow
    
    if ($process.ExitCode -eq 0) {
        Write-Host "✓ Instalación completada exitosamente" -ForegroundColor Green
    } else {
        Write-Host "⚠ Instalación completada con código: $($process.ExitCode)" -ForegroundColor Yellow
        Write-Host "   (Código 0 = éxito, otros códigos pueden ser normales)" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ Error durante la instalación: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Intenta instalar manualmente:" -ForegroundColor Yellow
    Write-Host "1. Abre: $installerPath" -ForegroundColor White
    Write-Host "2. Sigue el asistente de instalación" -ForegroundColor White
    exit
}

Write-Host ""
Write-Host "[3] Reiniciando IIS..." -ForegroundColor Yellow
try {
    iisreset
    Write-Host "✓ IIS reiniciado" -ForegroundColor Green
} catch {
    Write-Host "⚠ No se pudo reiniciar IIS automáticamente" -ForegroundColor Yellow
    Write-Host "   Ejecuta manualmente: iisreset" -ForegroundColor White
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Verificación final" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar instalación
if (Test-Path "C:\Program Files\IIS\URL Rewrite") {
    Write-Host "✓ URL Rewrite instalado correctamente" -ForegroundColor Green
    Write-Host ""
    Write-Host "Tu aplicación ahora debería funcionar con el web.config" -ForegroundColor Green
} else {
    Write-Host "⚠ La carpeta de instalación no se encontró" -ForegroundColor Yellow
    Write-Host "   Puede que necesites reiniciar el servidor o verificar manualmente" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Limpieza: Eliminando instalador temporal..." -ForegroundColor Gray
if (Test-Path $installerPath) {
    Remove-Item $installerPath -Force -ErrorAction SilentlyContinue
    Write-Host "✓ Instalador temporal eliminado" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan


