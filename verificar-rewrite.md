# Cómo verificar si URL Rewrite está instalado en IIS

## Método 1: Desde el Administrador de IIS (IIS Manager)

1. Abre el **Administrador de IIS** (IIS Manager)
   - Presiona `Win + R`, escribe `inetmgr` y presiona Enter
   - O busca "IIS Manager" en el menú de inicio

2. Selecciona el servidor en el panel izquierdo

3. En el panel central, busca el módulo **"URL Rewrite"**
   - Si aparece en la lista, está instalado ✅
   - Si NO aparece, no está instalado ❌

## Método 2: Desde PowerShell (Recomendado)

Abre PowerShell como Administrador y ejecuta:

```powershell
Get-WindowsFeature -Name IIS-URLRewrite
```

O también puedes verificar con:

```powershell
Get-Module -ListAvailable | Where-Object {$_.Name -like "*Rewrite*"}
```

## Método 3: Verificar archivos físicos

El módulo URL Rewrite se instala en:
```
C:\Program Files\IIS\URL Rewrite\
```

Si esta carpeta existe, el módulo está instalado.

## Método 4: Verificar en web.config

Si intentas usar reglas de rewrite y el servidor da error, probablemente no está instalado.

## Instalación (si no está instalado)

1. Descarga desde: https://www.iis.net/downloads/microsoft/url-rewrite
2. Instala el archivo `.msi`
3. Reinicia IIS:
   ```powershell
   iisreset
   ```

## Verificación rápida desde la aplicación

Puedes crear un archivo de prueba `test-rewrite.html` en la raíz y verificar si las reglas funcionan.


