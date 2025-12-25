# Manual de Usuario - Mantenimiento de Estaciones

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Acceso al Módulo](#acceso-al-módulo)
3. [Listar Estaciones](#listar-estaciones)
4. [Crear Nueva Estación](#crear-nueva-estación)
5. [Editar Estación](#editar-estación)
6. [Eliminar Estación](#eliminar-estación)
7. [Inhabilitar Estación](#inhabilitar-estación)
8. [Filtros y Búsqueda](#filtros-y-búsqueda)
9. [Preguntas Frecuentes](#preguntas-frecuentes)

---

## 📖 Introducción

El módulo de **Mantenimiento de Estaciones** permite gestionar las estaciones del sistema. Con este módulo puedes crear, editar, eliminar e inhabilitar estaciones, así como consultar la información de las estaciones existentes.

### Campos de una Estación

- **ID Estación**: Identificador único de la estación (generado automáticamente)
- **Estación Origen**: Nombre de la estación (obligatorio)
- **Distrito**: Distrito al que pertenece la estación (obligatorio)
- **Flujo Regular**: Indica si la estación tiene flujo regular (Sí/No)

---

## 🚪 Acceso al Módulo

1. Inicia sesión en el sistema TTrack
2. En el menú principal, navega a **Mantenimiento**
3. Selecciona **Estación** del submenú
4. Se abrirá la pantalla de listado de estaciones

**Ruta directa**: `/mantenimiento/estacion/list`

![Acceso al módulo desde el menú](imagenes/01-listado-estaciones.png)

---

## 📊 Listar Estaciones

La pantalla principal muestra una tabla con todas las estaciones registradas en el sistema.

![Pantalla principal - Listado de estaciones](imagenes/01-listado-estaciones.png)

### Información mostrada

La tabla incluye las siguientes columnas:

| Columna | Descripción |
|---------|-------------|
| **ID** | Identificador único de la estación |
| **Estación Origen** | Nombre de la estación |
| **Distrito** | Nombre del distrito |
| **Flujo Regular** | Estado del flujo regular (Sí en verde / No en rojo) |
| **Acciones** | Botones para editar y eliminar |

### Características

- **Paginación**: La tabla muestra 10 registros por página
- **Ordenamiento**: Haz clic en el encabezado de cualquier columna para ordenar
- **Filtros**: Utiliza los campos de búsqueda en la parte superior de cada columna

---

## ➕ Crear Nueva Estación

### Pasos para crear una estación

1. En la pantalla de listado, haz clic en el botón **"Nueva Estación"** (botón azul con icono +)

![Botón Nueva Estación](imagenes/02-boton-nueva-estacion.png)

2. Se abrirá un modal con el formulario de registro

![Formulario para crear estación](imagenes/03-formulario-crear.png)

3. Completa los siguientes campos:

#### Campos del formulario

##### Estación Origen (Obligatorio)
- **Campo**: Campo de texto
- **Requisitos**: 
  - Mínimo 3 caracteres
  - Máximo 100 caracteres
- **Ejemplo**: "Estación Lima Centro"

##### Distrito (Obligatorio)
- **Campo**: Dropdown (lista desplegable)
- **Funcionalidad**: 
  - Puedes buscar escribiendo en el campo
  - Selecciona un distrito de la lista
- **Ejemplo**: "LIMA - LIMA - LIMA"

![Dropdown de distritos](imagenes/12-dropdown-distrito.png)

##### Flujo Regular (Opcional)
- **Campo**: Checkbox
- **Funcionalidad**: Marca la casilla si la estación tiene flujo regular
- **Valor por defecto**: Desmarcado (No)

![Checkbox Flujo Regular](imagenes/13-checkbox-flujo-regular.png)

4. Una vez completados los campos, haz clic en **"Guardar"** (botón verde)

![Formulario completado](imagenes/04-formulario-crear-completado.png)

5. Se mostrará un diálogo de confirmación

![Diálogo de confirmación](imagenes/05-dialogo-confirmacion-guardar.png)

6. Confirma la acción haciendo clic en **"Sí"**
7. Si el registro es exitoso, verás un mensaje de confirmación y la tabla se actualizará automáticamente

![Mensaje de éxito](imagenes/06-mensaje-exito-guardar.png)

### Validaciones

- El campo **Estación Origen** es obligatorio y debe tener entre 3 y 100 caracteres
- El campo **Distrito** es obligatorio
- El botón **Guardar** se habilita solo cuando todos los campos obligatorios están completos y válidos

---

## ✏️ Editar Estación

### Pasos para editar una estación

1. En la tabla de estaciones, localiza la estación que deseas editar
2. Haz clic en el botón **"Editar"** (icono de lápiz azul) en la columna de Acciones

![Botones de acción](imagenes/07-botones-acciones.png)

3. Se abrirá un modal con el formulario pre-cargado con los datos actuales

![Formulario de edición](imagenes/08-formulario-editar.png)
4. Modifica los campos que necesites:

   - **Estación Origen**: Puedes cambiar el nombre
   - **Distrito**: Puedes seleccionar un distrito diferente
   - **Flujo Regular**: Puedes marcar o desmarcar la casilla

5. Haz clic en **"Guardar"** (botón verde)
6. Se mostrará un diálogo de confirmación
7. Confirma la acción haciendo clic en **"Sí"**
8. Si la actualización es exitosa, verás un mensaje de confirmación y la tabla se actualizará

### Notas importantes

- Todos los campos mantienen las mismas validaciones que en el formulario de creación
- Los cambios se aplican inmediatamente después de confirmar

---

## 🗑️ Eliminar Estación

### Pasos para eliminar una estación

1. En la tabla de estaciones, localiza la estación que deseas eliminar
2. Haz clic en el botón **"Eliminar"** (icono de papelera rojo) en la columna de Acciones
3. Se mostrará un diálogo de confirmación con el mensaje:
   > "¿Está seguro que desea eliminar esta estación?"

![Diálogo de confirmación eliminar](imagenes/09-dialogo-confirmacion-eliminar.png)
4. **IMPORTANTE**: Esta acción es permanente y no se puede deshacer
5. Si estás seguro, haz clic en **"Sí"** para confirmar
6. Si cancelas, haz clic en **"No"**
7. Si la eliminación es exitosa, verás un mensaje de confirmación y la estación desaparecerá de la tabla

### ⚠️ Advertencia

La eliminación de una estación es **permanente**. Asegúrate de que realmente deseas eliminar la estación antes de confirmar.

---

## 🚫 Inhabilitar Estación

### Pasos para inhabilitar una estación

1. En la tabla de estaciones, localiza la estación que deseas inhabilitar
2. Haz clic en el botón **"Inhabilitar"** (icono de prohibición amarillo) en la columna de Acciones
   - **Nota**: Este botón solo aparece si la estación está activa
3. Se mostrará un diálogo de confirmación con el mensaje:
   > "¿Está seguro que desea inhabilitar esta estación?"
4. Si estás seguro, haz clic en **"Sí"** para confirmar
5. Si cancelas, haz clic en **"No"**
6. Si la inhabilitación es exitosa, verás un mensaje de confirmación y el estado de la estación cambiará a "Inactivo" (en rojo)

### Diferencia entre Eliminar e Inhabilitar

- **Eliminar**: Elimina permanentemente la estación de la base de datos
- **Inhabilitar**: Desactiva la estación pero mantiene los datos en el sistema (permite reactivarla más tarde)

---

## 🔍 Filtros y Búsqueda

La tabla incluye funcionalidades de búsqueda y filtrado para facilitar la localización de estaciones.

### Filtros disponibles

#### Por Estación Origen
1. Localiza la columna **"Estación Origen"**
2. En el campo de búsqueda debajo del encabezado, escribe el nombre o parte del nombre
3. La tabla se filtrará automáticamente mientras escribes
4. Los resultados mostrarán solo las estaciones que contengan el texto ingresado

#### Por Distrito
1. Localiza la columna **"Distrito"**
2. En el campo de búsqueda debajo del encabezado, escribe el nombre del distrito
3. La tabla se filtrará automáticamente

![Filtros de búsqueda](imagenes/10-filtros-busqueda.png)

![Tabla con filtros aplicados](imagenes/11-tabla-filtrada.png)

### Características de los filtros

- **Búsqueda en tiempo real**: Los resultados se actualizan mientras escribes
- **Búsqueda parcial**: No necesitas escribir el texto completo
- **No distingue mayúsculas/minúsculas**: Puedes escribir en cualquier formato
- **Combinación de filtros**: Puedes usar múltiples filtros simultáneamente

### Limpiar filtros

Para limpiar un filtro, simplemente borra el texto del campo de búsqueda correspondiente.

---

## ❓ Preguntas Frecuentes

### ¿Puedo crear una estación sin distrito?

**No**. El campo Distrito es obligatorio. Debes seleccionar un distrito de la lista desplegable.

### ¿Cuál es la diferencia entre "Flujo Regular: Sí" y "Flujo Regular: No"?

- **Sí (verde)**: La estación tiene flujo regular activo
- **No (rojo)**: La estación no tiene flujo regular activo

### ¿Puedo editar el ID de una estación?

**No**. El ID de la estación se genera automáticamente y no se puede modificar.

### ¿Qué pasa si intento eliminar una estación que está en uso?

El sistema validará si la estación puede ser eliminada. Si está siendo utilizada en otros módulos, es posible que no se permita la eliminación y se mostrará un mensaje de error.

### ¿Cómo puedo reactivar una estación inhabilitada?

Actualmente, el módulo permite inhabilitar estaciones. Para reactivar una estación, contacta con el administrador del sistema o utiliza la funcionalidad de edición si está disponible.

### ¿Puedo exportar la lista de estaciones?

La funcionalidad de exportación no está disponible en esta versión del módulo. Si necesitas exportar los datos, contacta con el administrador del sistema.

### ¿Hay un límite de caracteres para el nombre de la estación?

Sí. El nombre de la estación (Estación Origen) debe tener:
- **Mínimo**: 3 caracteres
- **Máximo**: 100 caracteres

### ¿Puedo buscar estaciones por ID?

Sí, puedes ordenar la tabla por ID haciendo clic en el encabezado de la columna "ID", pero el filtro de búsqueda por ID no está disponible en esta versión.

---

## 📞 Soporte

Si encuentras algún problema o tienes dudas sobre el uso del módulo:

1. Revisa este manual
2. Contacta con el administrador del sistema
3. Reporta el problema al equipo de soporte técnico

---

## 📝 Notas Adicionales

- Todos los cambios realizados en el módulo se guardan inmediatamente en la base de datos
- Los mensajes de confirmación aparecen en la esquina superior derecha de la pantalla
- La tabla se actualiza automáticamente después de crear, editar o eliminar una estación
- Es recomendable verificar los datos antes de confirmar cualquier acción

---

**Versión del Manual**: 1.0  
**Última actualización**: 2024  
**Módulo**: Mantenimiento de Estaciones  
**Sistema**: TTrack

