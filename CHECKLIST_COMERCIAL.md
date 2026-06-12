# Checklist de Conformidad — Módulo Comercial

**Propósito:** Validar funcionalidad y comportamiento esperado de cada pantalla del módulo Comercial. El ejecutivo debe ejecutar cada caso, marcar el resultado y dejar observaciones.

| Datos del responsable | |
|---|---|
| Nombre | |
| Rol | |
| Fecha de prueba | |
| Ambiente (Dev / QA / Prod) | |

**Leyenda:**
- [ ] Pendiente
- [x] Conforme
- [!] Con observación (anotar abajo)
- [F] Falla bloqueante

---

## 1. Lead Times Comerciales (`/comercial/leadtimes`)

Mantenimiento de tiempos de entrega (días) por **cliente** y provincia destino.

| # | Caso | Resultado esperado | Estado | Obs. |
|---|---|---|---|---|
| 1.1 | Ingresar a la pantalla | Carga el dropdown "Cliente" con la lista de clientes asignados al usuario | [ ] | |
| 1.2 | Seleccionar un cliente | Se cargan todas las provincias destino agrupadas por departamento | [ ] | |
| 1.3 | Verificar agrupación visual | Cada departamento aparece una sola vez (rowspan) y debajo lista sus provincias | [ ] | |
| 1.4 | Filtrar por texto (departamento o provincia) | El listado se reduce dinámicamente y resalta la coincidencia | [ ] | |
| 1.5 | Activar "Solo vacíos" | Solo se muestran las provincias sin días asignados | [ ] | |
| 1.6 | Hacer clic sobre un número de día (1–30) | El día queda marcado como seleccionado para esa provincia | [ ] | |
| 1.7 | Hacer clic sobre el día ya seleccionado | El día se desmarca (vuelve a vacío) | [ ] | |
| 1.8 | Pulsar "Guardar" | Toast verde "Lead times guardados correctamente (N registros)" | [ ] | |
| 1.9 | Recargar la pantalla y volver a seleccionar el mismo cliente | Los días guardados persisten | [ ] | |
| 1.10 | Cambiar de cliente sin guardar | Los cambios no se mezclan entre clientes | [ ] | |

---

## 2. Lead Times Operativos (`/comercial/leadtimes/operativo`)

Tiempos de entrega estándar por provincia (no depende de cliente).

| # | Caso | Resultado esperado | Estado | Obs. |
|---|---|---|---|---|
| 2.1 | Ingresar a la pantalla | Carga directa de todas las provincias (sin selector de cliente) | [ ] | |
| 2.2 | Filtrar y "solo vacíos" | Mismo comportamiento que el comercial | [ ] | |
| 2.3 | Seleccionar/deseleccionar día | Funciona igual que el flujo comercial | [ ] | |
| 2.4 | Pulsar "Guardar" | Toast verde con el total de registros afectados | [ ] | |
| 2.5 | Verificar persistencia | Al recargar, los valores guardados se mantienen | [ ] | |

---

## 3. Registro de Citas (`/comercial/registro-citas`)

Pantalla maestra con 4 flujos: **Registro de OR, Cita de OT, Reclamos, Instrucción de Incidencias**.

### 3.0 Selección base

| # | Caso | Resultado esperado | Estado | Obs. |
|---|---|---|---|---|
| 3.0.1 | Ingresar a la pantalla | Se muestra el selector de cliente + tarjetas de tipo (Registro de OR, Cita de OT, Reclamos, Instrucción de Incidencias) | [ ] | |
| 3.0.2 | Seleccionar cliente | Se cargan internamente las OTs pendientes del cliente | [ ] | |
| 3.0.3 | Cambiar de cliente | Se resetean los campos de detalle y selecciones previas | [ ] | |

### 3.1 Registro de OR (Orden de Recojo)

| # | Caso | Resultado esperado | Estado | Obs. |
|---|---|---|---|---|
| 3.1.1 | Seleccionar tipo "Registro de OR" | Se muestran campos: fecha y hora de cita, origen, contacto, teléfono, destino, centro acopio, observaciones, destinos finales | [ ] | |
| 3.1.2 | Fecha de recojo por defecto | Día siguiente a hoy | [ ] | |
| 3.1.3 | Botones para ajustar la fecha (+/-) | No permite seleccionar fechas anteriores a hoy (toast de aviso) | [ ] | |
| 3.1.4 | Hora con formato inválido | Toast "Hora inválida (HH:mm)" | [ ] | |
| 3.1.5 | Agregar destino final | Requiere destino y cantidad; se agrega a la tabla con peso/volumen opcionales | [ ] | |
| 3.1.6 | Eliminar destino final | Se quita la fila de la tabla | [ ] | |
| 3.1.7 | Totales (cantidad / peso / volumen) | Se actualizan en pie de tabla | [ ] | |
| 3.1.8 | Guardar con campos obligatorios faltantes | Toast amarillo "Complete los campos obligatorios del recojo (*)" | [ ] | |
| 3.1.9 | Guardar correctamente | Modal de confirmación → toast "Orden de recojo registrada correctamente" | [ ] | |
| 3.1.10 | Toggle "Listado de OR embebido" | Se despliega el listado de órdenes de recojo del cliente | [ ] | |

### 3.2 Cita de OT

| # | Caso | Resultado esperado | Estado | Obs. |
|---|---|---|---|---|
| 3.2.1 | Seleccionar tipo "Cita de OT" | Se muestra la tabla de OTs pendientes del cliente | [ ] | |
| 3.2.2 | Buscar por numcp/remitente/destinatario/destino | Filtro client-side dinámico | [ ] | |
| 3.2.3 | Seleccionar una OT de la tabla | Queda marcada como `selectedOT` | [ ] | |
| 3.2.4 | Guardar sin OT seleccionada | Toast "Debe seleccionar una OT de la tabla" | [ ] | |
| 3.2.5 | Guardar sin fecha o hora | Toast "Debe seleccionar fecha y hora de la cita" | [ ] | |
| 3.2.6 | Guardar correctamente | Confirmación con resumen (numcp + fecha + hora) → toast "Cita guardada correctamente" | [ ] | |

### 3.3 Registro de Reclamos

Flujo de 4 áreas: Programación local, Programación provincia, Tráfico provincia, Almacén.

| # | Caso | Resultado esperado | Estado | Obs. |
|---|---|---|---|---|
| 3.3.1 | Seleccionar tipo "Registro de Reclamos" | Se muestran las 4 tarjetas de área | [ ] | |
| 3.3.2 | **Programación local** → seleccionar subtipo (no recojo, no LI, arribo tarde, falta drive, no procedimiento) | Aparece buscador de OR (mín. 3 caracteres) | [ ] | |
| 3.3.3 | Buscar OR con < 3 caracteres | Toast "Ingrese al menos 3 caracteres" | [ ] | |
| 3.3.4 | Buscar OR válida y seleccionarla | Queda asociada al reclamo | [ ] | |
| 3.3.5 | **Programación provincia** → seleccionar "Otros" sin texto | Toast "Especifique el detalle en 'Otros'" | [ ] | |
| 3.3.6 | **Tráfico** → seleccionar subtipo y buscar OT | Buscador de OT por numcp | [ ] | |
| 3.3.7 | **Almacén** → seleccionar subtipo | Algunos requieren búsqueda de OT (falta-ingreso, faltante-carga); otros no | [ ] | |
| 3.3.8 | Guardar sin área seleccionada | Toast "Seleccione el área" | [ ] | |
| 3.3.9 | Guardar sin OR/OT relacionada cuando aplica | Toast pidiendo seleccionar OR / OT | [ ] | |
| 3.3.10 | Guardar correctamente | Toast verde "Reclamo registrado (#N)" | [ ] | |
| 3.3.11 | Toggle "Reclamos embebidos" | Se muestra el seguimiento de reclamos del cliente dentro de la pantalla | [ ] | |

### 3.4 Instrucción de Incidencias (sobre OT observada)

| # | Caso | Resultado esperado | Estado | Obs. |
|---|---|---|---|---|
| 3.4.1 | Seleccionar tipo "Instrucción de Incidencias" | Carga tabla de OTs observadas del cliente | [ ] | |
| 3.4.2 | Filtrar OTs observadas (numcp/remitente/destinatario/destino/tipoentrega/observación) | Filtro client-side dinámico | [ ] | |
| 3.4.3 | Seleccionar una OT | Queda marcada como `selectedOTObservada` | [ ] | |
| 3.4.4 | Guardar sin OT observada | Toast "Seleccione una OT con observaciones" | [ ] | |
| 3.4.5 | Guardar sin instrucción (observaciones vacías) | Toast "Escriba la instrucción de la observación" | [ ] | |
| 3.4.6 | Guardar correctamente | Toast "Instrucción registrada (#N)" | [ ] | |

---

## 4. Seguimiento de Reclamos (`/comercial/seguimiento-reclamos`)

Listado, detalle y cambio de estado de reclamos.

| # | Caso | Resultado esperado | Estado | Obs. |
|---|---|---|---|---|
| 4.1 | Ingresar a la pantalla | Cargan filtros (cliente, área, estado, fechas), default fechas: últimos 30 días | [ ] | |
| 4.2 | Acceder con `?idcliente=N` en URL | Cliente queda preseleccionado | [ ] | |
| 4.3 | Pulsar "Buscar" | Lista de reclamos según filtros | [ ] | |
| 4.4 | Cambiar área / estado / rango de fechas y buscar | Listado se actualiza correctamente | [ ] | |
| 4.5 | "Limpiar filtros" | Vuelve a default (últimos 30 días, sin cliente/área/estado) | [ ] | |
| 4.6 | Hacer clic en "Ver detalle" de un reclamo | Se abre diálogo con datos + historial completo | [ ] | |
| 4.7 | Pulsar "Cambiar estado" | Aparece diálogo con estados disponibles (excluye el actual) y campo comentario | [ ] | |
| 4.8 | Confirmar cambio de estado sin elegir nuevo estado | Toast "Seleccione el nuevo estado" | [ ] | |
| 4.9 | Cambiar estado correctamente | Toast verde, se refresca detalle e historial, listado actualizado | [ ] | |
| 4.10 | Verificar colores de severidad de estados | `registrado` info, `en-atencion` warning, `resuelto` success, `descartado` danger | [ ] | |

---

## 5. Integración con otros módulos

| # | Caso | Resultado esperado | Estado | Obs. |
|---|---|---|---|---|
| 5.1 | Desde Registro de Citas → toggle Listado de OR | El componente embebido `listarOrdenRecojoComponent` carga las OR del cliente | [ ] | |
| 5.2 | Desde Registro de Citas → toggle Reclamos | El componente embebido `SeguimientoReclamosComponent` carga reclamos del cliente | [ ] | |
| 5.3 | Verificar que clientes filtrados por usuario | Solo aparecen los clientes asignados al usuario logueado | [ ] | |

---

## 6. Validaciones cruzadas y errores

| # | Caso | Resultado esperado | Estado | Obs. |
|---|---|---|---|---|
| 6.1 | Pérdida de conexión durante guardar | Toast rojo de error, sin perder los datos del formulario | [ ] | |
| 6.2 | Sesión vencida | Redirige a login | [ ] | |
| 6.3 | Permisos insuficientes (si aplica) | Mensaje claro o pantalla bloqueada | [ ] | |
| 6.4 | Caracteres especiales en observaciones | Se guardan tal cual | [ ] | |
| 6.5 | Campos numéricos con valores no válidos (negativos, texto) | Validación visible o rechazo | [ ] | |

---

## Observaciones generales / sugerencias de mejora

| # | Pantalla | Observación / sugerencia | Severidad (Info/Menor/Mayor/Bloqueante) |
|---|---|---|---|
| | | | |
| | | | |
| | | | |
| | | | |

---

## Resumen de conformidad

| Sección | Total casos | Conformes | Con observación | Falla bloqueante |
|---|---|---|---|---|
| 1. Lead Times Comerciales | 10 | | | |
| 2. Lead Times Operativos | 5 | | | |
| 3.0 Selección base | 3 | | | |
| 3.1 Registro de OR | 10 | | | |
| 3.2 Cita de OT | 6 | | | |
| 3.3 Reclamos | 11 | | | |
| 3.4 Instrucción de Incidencias | 6 | | | |
| 4. Seguimiento de Reclamos | 10 | | | |
| 5. Integración | 3 | | | |
| 6. Validaciones cruzadas | 5 | | | |
| **Total** | **69** | | | |

---

**Conformidad final**

- [ ] **Aprobado** — todas las funcionalidades operan según lo esperado.
- [ ] **Aprobado con observaciones** — listadas en la sección anterior, no bloquean producción.
- [ ] **Rechazado** — existen fallas bloqueantes que impiden el pase a producción.

Firma del responsable: ________________________________

Fecha: ________________________________
