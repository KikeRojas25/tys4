# Estructura de Datos para Almacenar Etapas de Despacho

## Propuesta de Esquema de Base de Datos

### 1. Tabla Principal: `EtapaDespacho`

Almacena la información principal de cada etapa del despacho.

```sql
CREATE TABLE EtapaDespacho (
    idEtapaDespacho INT PRIMARY KEY IDENTITY(1,1),
    idCarga INT NOT NULL,  -- FK a OperacionCarga
    nombre VARCHAR(200) NOT NULL,
    descripcion VARCHAR(500),
    orden INT NOT NULL,  -- Secuencia de la etapa (1, 2, 3, ...)
    idTipoOperacion INT,  -- FK a ValorTabla (tipo de operación)
    idUsuarioCreacion INT NOT NULL,
    fechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
    idUsuarioModificacion INT,
    fechaModificacion DATETIME,
    activo BIT NOT NULL DEFAULT 1,
    
    -- Datos de Proveedor/Tercero
    idRemitente INT,  -- FK a Proveedor
    idDestinatario INT,  -- FK a Proveedor (Repartidor)
    idDireccion INT,  -- FK a DireccionProveedor
    
    -- Datos de Agencia (si tipoOperacion = 123)
    pesoAgencia DECIMAL(10,2),
    bultoAgencia INT,
    nroFactura VARCHAR(50),
    consignadoAgencia VARCHAR(200),
    claveAgencia VARCHAR(50),
    nroRemito VARCHAR(50),
    costoEnvio DECIMAL(10,2),
    idAgencia INT,  -- FK a Proveedor (tipo agencia)
    
    CONSTRAINT FK_EtapaDespacho_Carga FOREIGN KEY (idCarga) REFERENCES OperacionCarga(idcarga),
    CONSTRAINT FK_EtapaDespacho_TipoOperacion FOREIGN KEY (idTipoOperacion) REFERENCES ValorTabla(idValorTabla),
    CONSTRAINT FK_EtapaDespacho_Remitente FOREIGN KEY (idRemitente) REFERENCES Proveedor(idProveedor),
    CONSTRAINT FK_EtapaDespacho_Destinatario FOREIGN KEY (idDestinatario) REFERENCES Proveedor(idProveedor),
    CONSTRAINT FK_EtapaDespacho_Direccion FOREIGN KEY (idDireccion) REFERENCES DireccionProveedor(iddireccion),
    CONSTRAINT FK_EtapaDespacho_Agencia FOREIGN KEY (idAgencia) REFERENCES Proveedor(idProveedor),
    CONSTRAINT UQ_EtapaDespacho_Carga_Orden UNIQUE (idCarga, orden)  -- Evita duplicados de orden por despacho
);
```

### 2. Tabla de Relación: `EtapaDespacho_OrdenTrabajo`

Relación muchos a muchos entre etapas y órdenes de trabajo.

```sql
CREATE TABLE EtapaDespacho_OrdenTrabajo (
    idEtapaDespachoOT INT PRIMARY KEY IDENTITY(1,1),
    idEtapaDespacho INT NOT NULL,  -- FK a EtapaDespacho
    idOrdenTrabajo INT NOT NULL,  -- FK a OrdenTrabajo
    fechaAsignacion DATETIME NOT NULL DEFAULT GETDATE(),
    idUsuarioAsignacion INT NOT NULL,
    activo BIT NOT NULL DEFAULT 1,
    
    CONSTRAINT FK_EtapaDespachoOT_Etapa FOREIGN KEY (idEtapaDespacho) REFERENCES EtapaDespacho(idEtapaDespacho),
    CONSTRAINT FK_EtapaDespachoOT_OrdenTrabajo FOREIGN KEY (idOrdenTrabajo) REFERENCES OrdenTrabajo(idordentrabajo),
    CONSTRAINT UQ_EtapaDespachoOT_Etapa_OT UNIQUE (idEtapaDespacho, idOrdenTrabajo)  -- Evita duplicados
);
```

## Estructura de Datos en TypeScript

### Interface para el Backend (DTO)

```typescript
export interface EtapaDespachoDTO {
  idEtapaDespacho?: number;
  idCarga: number;
  nombre: string;
  descripcion: string;
  orden: number;
  idTipoOperacion?: number;
  idUsuarioCreacion: number;
  fechaCreacion?: Date;
  idUsuarioModificacion?: number;
  fechaModificacion?: Date;
  activo?: boolean;
  
  // Datos de Proveedor/Tercero
  idRemitente?: number;
  idDestinatario?: number;
  idDireccion?: number;
  
  // Datos de Agencia
  pesoAgencia?: number;
  bultoAgencia?: number;
  nroFactura?: string;
  consignadoAgencia?: string;
  claveAgencia?: string;
  nroRemito?: string;
  costoEnvio?: number;
  idAgencia?: number;
  
  // OTs asociadas (para crear/actualizar)
  idOrdenesTrabajo?: number[];
}

export interface EtapaDespachoResponse {
  idEtapaDespacho: number;
  idCarga: number;
  numCarga: string;  // Para mostrar
  nombre: string;
  descripcion: string;
  orden: number;
  idTipoOperacion?: number;
  tipoOperacionLabel?: string;  // Para mostrar
  fechaCreacion: Date;
  fechaModificacion?: Date;
  
  // Datos de Proveedor/Tercero
  idRemitente?: number;
  remitenteLabel?: string;
  idDestinatario?: number;
  destinatarioLabel?: string;
  idDireccion?: number;
  direccionLabel?: string;
  
  // Datos de Agencia
  pesoAgencia?: number;
  bultoAgencia?: number;
  nroFactura?: string;
  consignadoAgencia?: string;
  claveAgencia?: string;
  nroRemito?: string;
  costoEnvio?: number;
  idAgencia?: number;
  agenciaLabel?: string;
  
  // OTs asociadas
  ordenesTrabajo?: OrdenTrabajoEtapa[];
}

export interface OrdenTrabajoEtapa {
  idOrdenTrabajo: number;
  numcp: string;
  razonsocial: string;
  destino: string;
  peso?: number;
  bulto?: number;
  subtotal?: number;
  tipooperacion?: string;
  proveedor?: string;
}
```

## Endpoints de API Propuestos

### 1. Crear Etapa
```
POST /api/Planning/CrearEtapaDespacho
Body: EtapaDespachoDTO
Response: EtapaDespachoResponse
```

### 2. Actualizar Etapa
```
PUT /api/Planning/ActualizarEtapaDespacho/{idEtapaDespacho}
Body: EtapaDespachoDTO
Response: EtapaDespachoResponse
```

### 3. Obtener Etapas por Despacho
```
GET /api/Planning/GetEtapasDespacho?idCarga={idCarga}
Response: EtapaDespachoResponse[]
```

### 4. Eliminar Etapa
```
DELETE /api/Planning/EliminarEtapaDespacho/{idEtapaDespacho}
Response: { success: boolean, message: string }
```

### 5. Obtener Etapa con OTs
```
GET /api/Planning/GetEtapaDespachoConOTs/{idEtapaDespacho}
Response: EtapaDespachoResponse (con ordenesTrabajo completas)
```

## Consideraciones de Diseño

### 1. Integridad Referencial
- La relación con `OperacionCarga` asegura que la etapa pertenezca a un despacho válido
- La relación con `OrdenTrabajo` permite rastrear qué OTs están en cada etapa
- El constraint único en `(idCarga, orden)` previene etapas duplicadas con el mismo orden

### 2. Auditoría
- Campos de usuario y fecha de creación/modificación para auditoría
- Campo `activo` para soft delete (no eliminar físicamente)

### 3. Flexibilidad
- Los campos de proveedor/tercero son opcionales (pueden no aplicarse a todas las etapas)
- Los campos de agencia solo se usan cuando `idTipoOperacion = 123`
- Permite múltiples etapas por despacho con orden secuencial

### 4. Performance
- Índices recomendados:
  - `idx_EtapaDespacho_idCarga` en `EtapaDespacho(idCarga)`
  - `idx_EtapaDespacho_orden` en `EtapaDespacho(idCarga, orden)`
  - `idx_EtapaDespachoOT_idEtapa` en `EtapaDespacho_OrdenTrabajo(idEtapaDespacho)`
  - `idx_EtapaDespachoOT_idOT` en `EtapaDespacho_OrdenTrabajo(idOrdenTrabajo)`

## Ejemplo de Uso

### Crear una nueva etapa desde el frontend:

```typescript
const nuevaEtapa: EtapaDespachoDTO = {
  idCarga: 12345,
  nombre: "Transporte Intermedio",
  descripcion: "Etapa de transporte entre origen y destino",
  orden: 2,
  idTipoOperacion: 112,
  idUsuarioCreacion: user.usr_int_id,
  idRemitente: 100,
  idDestinatario: 200,
  idDireccion: 50,
  idOrdenesTrabajo: [1, 2, 3, 4, 5]  // IDs de las OTs seleccionadas
};

this.planningService.crearEtapaDespacho(nuevaEtapa).subscribe(response => {
  console.log('Etapa creada:', response);
});
```

### Obtener todas las etapas de un despacho:

```typescript
this.planningService.getEtapasDespacho(idCarga).subscribe(etapas => {
  this.etapas = etapas;
  // Las etapas vienen ordenadas por el campo 'orden'
});
```

