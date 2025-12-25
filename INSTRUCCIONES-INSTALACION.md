# Instrucciones para Instalar URL Rewrite en IIS

## ⚠️ URL Rewrite NO está instalado

Para que tu aplicación funcione correctamente con el `web.config`, necesitas instalar URL Rewrite.

---

## Opción 1: Instalación Automática (Recomendada)

### Requisitos:
- PowerShell ejecutándose como **Administrador**
- Conexión a Internet

### Pasos:

1. **Abre PowerShell como Administrador:**
   - Clic derecho en PowerShell → "Ejecutar como administrador"

2. **Navega a la carpeta del proyecto:**
   ```powershell
   cd D:\Fuentes\Tys\TysWeb\TysWeb
   ```

3. **Ejecuta el script de instalación:**
   ```powershell
   .\instalar-url-rewrite.ps1
   ```

El script:
- ✅ Descargará el instalador automáticamente
- ✅ Lo instalará silenciosamente
- ✅ Reiniciará IIS
- ✅ Verificará la instalación

---

## Opción 2: Instalación Manual

### Pasos:

1. **Descarga el instalador:**
   - Visita: https://www.iis.net/downloads/microsoft/url-rewrite
   - O descarga directamente: https://download.microsoft.com/download/1/2/8/128E2E22-C1B9-44A4-BE2A-5859ED1D4592/rewrite_amd64_en-US.msi

2. **Ejecuta el instalador:**
   - Doble clic en `rewrite_amd64_en-US.msi`
   - Sigue el asistente de instalación
   - Acepta los términos y condiciones
   - Completa la instalación

3. **Reinicia IIS:**
   - Abre PowerShell como Administrador
   - Ejecuta: `iisreset`

---

## Verificación Post-Instalación

Después de instalar, verifica que funcionó:

```powershell
.\verificar-url-rewrite-simple.ps1
```

Deberías ver:
```
✓ URL Rewrite ESTÁ INSTALADO
```

---

## Solución de Problemas

### Error: "No se puede ejecutar el script"
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Error: "No se puede descargar"
- Descarga manualmente desde: https://www.iis.net/downloads/microsoft/url-rewrite
- Ejecuta el `.msi` manualmente

### Error: "Instalación falló"
- Verifica que tengas permisos de Administrador
- Cierra el Administrador de IIS si está abierto
- Intenta instalar manualmente

### IIS no se reinicia
- Ejecuta manualmente: `iisreset` en PowerShell como Administrador
- O reinicia el servicio desde el Administrador de IIS

---

## Después de Instalar

Una vez instalado URL Rewrite:

1. ✅ Tu `web.config` funcionará correctamente
2. ✅ Los archivos estáticos (como el manual) se servirán correctamente
3. ✅ Las rutas de Angular funcionarán como SPA

**Prueba accediendo a:**
```
http://tu-servidor/manuales/estacion/MANUAL_USUARIO.html
```

Debería mostrar el manual correctamente.

---

## ¿Necesitas ayuda?

Si tienes problemas:
1. Verifica que IIS esté instalado
2. Verifica que tengas permisos de Administrador
3. Revisa los logs de eventos de Windows
4. Intenta la instalación manual si la automática falla

