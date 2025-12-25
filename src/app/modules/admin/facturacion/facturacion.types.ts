export interface Factura {
    id?: number;
    numero?: string;
    serie?: string;
    fechaEmision?: Date | string;
    fechaVencimiento?: Date | string;
    idCliente?: number;
    nombreCliente?: string;
    rucCliente?: string;
    direccionCliente?: string;
    subtotal?: number;
    igv?: number;
    total?: number;
    estado?: string;
    estadoId?: number;
    observaciones?: string;
    tipoComprobante?: string;
    moneda?: string;
    tipoCambio?: number;
    detalles?: DetalleFactura[];
    fechaRegistro?: Date | string;
    usuarioRegistro?: string;
    fechaModificacion?: Date | string;
    usuarioModificacion?: string;
}

export interface DetalleFactura {
    id?: number;
    idFactura?: number;
    item?: number;
    descripcion?: string;
    cantidad?: number;
    unidadMedida?: string; // Mantener para compatibilidad
    conceptoCobro?: number; // Nuevo campo para concepto de cobro (idValorTabla)
    precioUnitario?: number;
    subtotal?: number;
    igv?: number;
    total?: number;
    idProducto?: number;
    codigoProducto?: string;
}

export interface EstadoFactura {
    id: number;
    descripcion: string;
    alias: string;
    activo: boolean;
}

export interface PendientePreliquidacion {
    fecharegistro: Date | string;
    idordentrabajo: number;
    idCliente: number;
    numcp: string;
    remitente: string;
    destinatario: string;
    modotransporte: string;
    tipooperacion: string;
    origen: string;
    destino: string;
    peso: number;
    volumen: number;
    bulto: number;
    pesovol: number;
    tarifa: number;
    subtotal: number;
    igv: number;
    base1: number;
    total: number;
    recargo: number;
    guiatransportista: string;
    conceptocobro: string;
    selected?: boolean; // Para la selección
}

export interface ListarPreliquidacionResult {
    idpreliquidacion: number;
    numeropreliquidacion?: string;
    idcomprobantepago?: number;
    numerocomprobante?: string;
    tipocomprobantepago?: string;
    cliente?: string;
    totalbulto?: number;
    totalpeso?: number;
    totalvolumen?: number;
    fechaemision?: Date | string;
    subtotal?: number;
    recargo?: number;
    total?: number;
}

export interface PreliquidacionDetalle {
    idpreliquidacion: number;
    numeropreliquidacion?: string;
    idcliente?: number;
    cliente?: string;
    fechaemision?: Date | string;
    ordenes?: OrdenPreliquidacion[];
    subtotal?: number;
    igv?: number;
    total?: number;
    recargo?: number;
}

export interface OrdenPreliquidacion {
    idordentrabajo: number;
    numcp?: string;
    destinatario?: string;
    origen?: string;
    destino?: string;
    fecharegistro?: Date | string;
    peso?: number;
    volumen?: number;
    bulto?: number;
    subtotal?: number;
    igv?: number;
    total?: number;
    recargo?: number;
    conceptocobro?: string;
    guiatransportista?: string;
}

export interface AgregarCargoRequest {
    idordentrabajo: number;
    concepto: string;
    monto: number;
    descripcion?: string;
}

export interface OrdenTrabajoPreliquidacionResult {
    fecharegistro: Date | string;
    idordentrabajo: number;
    numcp: string;
    remitente: string;
    destinatario: string;
    modotransporte: string;
    tipooperacion: string;
    origen: string;
    destino: string;
    peso: number;
    volumen: number;
    bulto?: number;
    tarifa?: number;
    subtotal?: number;
    base1?: number;
    total?: number;
    idcliente: number;
    recargo?: number;
    igv?: number;
    guiatransportista: string;
    conceptocobro: string;
}

export interface ComprobanteForCreateDto {
    numeroComprobante: string;
    idTipoComprobante: number;
    emisionRapida: boolean;
    idPreliquidacion: number;
    idCliente: number;
    fechaEmision: Date | string;
    idUsuarioRegistro: number;
    subtotal: number;
    igv: number;
    total: number;
    totalPeso: number;
    totalVolumen: number;
    totalBulto: number;
    motivo?: string;
    descripcion?: string;
    idFacturaVinculada?: number;
    idEstado: number;
    ordenCompra?: string;
    detalles: DetalleComprobanteForCreateDto[];
}

export interface DetalleComprobanteForCreateDto {
    idOrdenTrabajo?: number;
    descripcion?: string;
    subtotal: number;
    igv: number;
    total: number;
    recargo?: number;
}

export interface ComprobanteResult {
    idComprobantePago: number;
    numeroComprobante: string;
    idTipoComprobante: number;
    tipoComprobante: string;
    emisionRapida: boolean;
    idPreliquidacion: number;
    numeroPreliquidacion: string;
    idCliente: number;
    nombreCliente: string;
    fechaEmision: Date | string;
    idUsuarioRegistro: number;
    usuarioRegistro: string;
    subtotal: number;
    igv: number;
    total: number;
    totalPeso: number;
    totalVolumen: number;
    totalBulto: number;
    motivo?: string;
    descripcion?: string;
    idFacturaVinculada?: number;
    idEstado: number;
    estado: string;
    ordenCompra?: string;
}

export interface DetalleComprobanteResult {
    idDetalleComprobante?: number;
    idOrdenTrabajo?: number;
    numeroOrdenTrabajo?: string;
    descripcion?: string;
    subtotal: number;
    igv: number;
    total: number;
    recargo?: number;
    conceptoCobro?: string;
}

export interface ComprobanteConDetallesResult {
    comprobante?: ComprobanteResult;
    Comprobante?: ComprobanteResult; // Para compatibilidad con backend
    detalles?: DetalleComprobanteResult[];
    Detalles?: DetalleComprobanteResult[]; // Para compatibilidad con backend
}