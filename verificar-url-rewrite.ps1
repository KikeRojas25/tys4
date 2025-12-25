# Script para verificar si URL Rewrite está instalado en IIS
# Ejecutar como Administrador

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Verificación de URL Rewrite en IIS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$rewriteInstalado = $false
$metodos = @()

# Método 1: Verificar carpeta de instalación
Write-Host "[1] Verificando carpeta de instalación..." -ForegroundColor Yellow
$rutaRewrite = "C:\Program Files\IIS\URL Rewrite"
if (Test-Path $rutaRewrite) {
    Write-Host "   ✓ Carpeta encontrada: $rutaRewrite" -ForegroundColor Green
    $rewriteInstalado = $true
    $metodos += "Carpeta de instalación"
} else {
    Write-Host "   ✗ Carpeta no encontrada: $rutaRewrite" -ForegroundColor Red
}
Write-Host ""

# Método 2: Verificar módulo en IIS
Write-Host "[2] Verificando módulo en IIS..." -ForegroundColor Yellow
try {
    Import-Module WebAdministration -ErrorAction SilentlyContinue
    $modules = Get-WebGlobalModule | Where-Object { $_.Name -like "*Rewrite*" }
    if ($modules) {
        Write-Host "   ✓ Módulo encontrado en IIS:" -ForegroundColor Green
        foreach ($module in $modules) {
            Write-Host "     - $($module.Name) (Imagen: $($module.Image))" -ForegroundColor Green
        }
        $rewriteInstalado = $true
        $metodos += "Módulo IIS"
    } else {
        Write-Host "   ✗ Módulo no encontrado en IIS" -ForegroundColor Red
    }
} catch {
    Write-Host "   ⚠ No se pudo verificar módulos IIS (WebAdministration no disponible)" -ForegroundColor Yellow
}
Write-Host ""

# Método 3: Verificar registro de Windows
Write-Host "[3] Verificando registro de Windows..." -ForegroundColor Yellow
try {
    $regPath = "HKLM:\SOFTWARE\Microsoft\IIS\Extensions"
    if (Test-Path $regPath) {
        $regKeys = Get-ItemProperty $regPath -ErrorAction SilentlyContinue
        $rewriteFound = $false
        foreach ($prop in $regKeys.PSObject.Properties) {
            if ($prop.Value -like "*Rewrite*" -or $prop.Name -like "*Rewrite*") {
                Write-Host "   ✓ Referencia encontrada en registro: $($prop.Name)" -ForegroundColor Green
                $rewriteFound = $true
                $rewriteInstalado = $true
            }
        }
        if (-not $rewriteFound) {
            Write-Host "   ✗ No se encontraron referencias en el registro" -ForegroundColor Red
        }
    } else {
        Write-Host "   ✗ Ruta de registro no encontrada" -ForegroundColor Red
    }
} catch {
    Write-Host "   ⚠ Error al leer el registro: $_" -ForegroundColor Yellow
}
Write-Host ""

# Método 4: Verificar archivos DLL
Write-Host "[4] Verificando archivos DLL del módulo..." -ForegroundColor Yellow
$dllPaths = @(
    "C:\Program Files\IIS\URL Rewrite\rewrite.dll",
    "C:\Windows\System32\inetsrv\rewrite.dll"
)
$dllFound = $false
foreach ($dllPath in $dllPaths) {
    if (Test-Path $dllPath) {
        Write-Host "   ✓ DLL encontrada: $dllPath" -ForegroundColor Green
        $dllFound = $true
        $rewriteInstalado = $true
        $metodos += "Archivo DLL"
        break
    }
}
if (-not $dllFound) {
    Write-Host "   ✗ DLL no encontrada en las rutas esperadas" -ForegroundColor Red
}
Write-Host ""

# Método 5: Verificar desde Get-WindowsFeature (si está disponible)
Write-Host "[5] Verificando con Get-WindowsFeature..." -ForegroundColor Yellow
try {
    $feature = Get-WindowsFeature -Name IIS-URLRewrite -ErrorAction SilentlyContinue
    if ($feature) {
        if ($feature.Installed) {
            Write-Host "   ✓ URL Rewrite está instalado según Windows Features" -ForegroundColor Green
            $rewriteInstalado = $true
            $metodos += "Windows Feature"
        } else {
            Write-Host "   ✗ URL Rewrite NO está instalado (disponible pero no instalado)" -ForegroundColor Red
        }
    } else {
        Write-Host "   ⚠ Feature IIS-URLRewrite no encontrado (puede ser normal en algunas versiones)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠ Get-WindowsFeature no disponible o requiere permisos elevados" -ForegroundColor Yellow
}
Write-Host ""

# Resumen final
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RESUMEN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($rewriteInstalado) {
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
    Write-Host "Para instalar URL Rewrite:" -ForegroundColor Yellow
    Write-Host "  1. Descarga desde: https://www.iis.net/downloads/microsoft/url-rewrite" -ForegroundColor White
    Write-Host "  2. Instala el archivo .msi" -ForegroundColor White
    Write-Host "  3. Reinicia IIS con: iisreset" -ForegroundColor White
    Write-Host ""
    Write-Host "Sin URL Rewrite, el web.config no funcionará correctamente" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

# Verificar permisos
Write-Host ""
Write-Host "Nota: Algunas verificaciones requieren permisos de Administrador" -ForegroundColor Yellow
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "⚠ Advertencia: Este script no se está ejecutando como Administrador" -ForegroundColor Yellow
    Write-Host "  Algunas verificaciones pueden no funcionar correctamente" -ForegroundColor Yellow
    Write-Host "  Ejecuta PowerShell como Administrador para una verificación completa" -ForegroundColor Yellow
} else {
    Write-Host "✓ Script ejecutándose con permisos de Administrador" -ForegroundColor Green
}

Write-Host ""


