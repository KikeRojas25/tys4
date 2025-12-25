# Instrucciones para Configurar el Manual

## 📁 Pasos para Configurar el Manual

### 1. Copiar el archivo HTML
Copia el archivo `MANUAL_USUARIO.html` desde:
```
src/app/modules/admin/mantenimiento/estacion/MANUAL_USUARIO.html
```

A la carpeta:
```
public/manuales/estacion/MANUAL_USUARIO.html
```

### 2. Copiar las imágenes
Copia todas las imágenes desde:
```
src/app/modules/admin/mantenimiento/estacion/imagenes/
```

A la carpeta:
```
public/manuales/estacion/imagenes/
```

### 3. Verificar estructura
La estructura final debe ser:
```
public/
  └── manuales/
      └── estacion/
          ├── MANUAL_USUARIO.html
          └── imagenes/
              ├── 01-listado-estaciones.png
              ├── 02-boton-nueva-estacion.png
              ├── 03-formulario-crear.png
              ├── 04-formulario-crear-completado.png
              ├── 05-dialogo-confirmacion-guardar.png
              ├── 06-mensaje-exito-guardar.png
              ├── 07-botones-acciones.png
              ├── 08-formulario-editar.png
              ├── 09-dialogo-confirmacion-eliminar.png
              ├── 10-filtros-busqueda.png
              ├── 11-tabla-filtrada.png
              ├── 12-dropdown-distrito.png
              └── 13-checkbox-flujo-regular.png
```

## 🚀 Formas de Acceso al Manual

### Opción 1: Desde la aplicación (Recomendado)
1. Ve a **Mantenimiento > Estación > List**
2. Haz clic en el botón **"Manual de Usuario"** (botón gris con icono de libro)
3. Se abrirá el manual dentro de la aplicación

**Ruta**: `/mantenimiento/estacion/manual`

### Opción 2: Acceso directo
Abre directamente en el navegador:
```
http://localhost:4200/manuales/estacion/MANUAL_USUARIO.html
```

### Opción 3: Desde el sistema de archivos
Haz doble clic en el archivo:
```
public/manuales/estacion/MANUAL_USUARIO.html
```

## 📝 Notas Importantes

- Las imágenes deben estar en la carpeta `public/manuales/estacion/imagenes/`
- El archivo HTML debe estar en `public/manuales/estacion/`
- Después de copiar los archivos, reinicia el servidor de desarrollo si es necesario
- Las rutas en el HTML ya están configuradas para apuntar a `/manuales/estacion/imagenes/`









