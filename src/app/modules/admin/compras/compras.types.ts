export interface LiquidacionCajaDetalleDto {
  idliquidaciondetalle: number;
  idmanifiesto: number | null;
  idordentransporte: number | null;
  monto: number;
  idliquidacion: number;
}

// --- Búsqueda/selección OTs para Liquidación Caja Chica ---
export interface OrdenTransporteLite {
  idordentrabajo: number;
  numcp: string;
  peso: number;
}

export interface LiquidacionCajaDto {
  idliquidacion: number;
  numeroliquidacion: string;
  numcp?: string | null;
  fechaliquidacion: string;
  idusuarioregistro: number;
  usuarioregistro?: string | null;
  fecharegistro: string;
  idconcepto: number;
  concepto?: string | null;
  monto: number;
  numerocomprobante: string;
  tipocomprobante?: string | null;
  razonsocialdocumento?: string | null;
  observacion?: string | null;
  observaciones?: string | null;
  liquidado?: boolean | null;
  IdTipoLiquidacion?: number | null;

  // --- Transferencia ---
  idtipotransferencia: number | null;
  tipotransferencia?: string | null;
  destinatariotransferencia: string | null;
  cuentatransferencia: string | null;
  numerooperacion: string | null;

  // --- Datos del primer detalle ---
  provinciadestino?: string | null;

  detalles: LiquidacionCajaDetalleDto[] | null;
}

export interface LiquidacionCajaDetalleForUpsertDto {
  idmanifiesto: number | null;
  idordentransporte: number | null;
  monto: number;
}

export interface LiquidacionCajaForCreateDto {
  numeroliquidacion: string;
  fechaliquidacion: string;
  idusuarioregistro: number;
  idconcepto: number;
  monto: number;
  numerocomprobante: string;
  tipocomprobante?: string | null;
  razonsocialdocumento?: string | null;
  observacion?: string | null;
  observaciones?: string | null;
  IdTipoLiquidacion?: number | null;

  // --- Transferencia ---
  idtipotransferencia: number;
  destinatariotransferencia: string | null;
  cuentatransferencia: string | null;
  numerooperacion: string | null;

  detalles?: LiquidacionCajaDetalleForUpsertDto[] | null;
}

export interface LiquidacionCajaForUpdateDto extends LiquidacionCajaForCreateDto {
  idliquidacion: number;
}

export interface DetalleLiquidadoResult {
  idliquidaciondetalle: number;
  idliquidacion: number;
  numeroliquidacion?: string | null;
  idordentransporte?: number | null;
  numcp?: string | null;
  idmanifiesto?: number | null;
  nummanifiesto?: string | null;
  subtotalorden?: number | null;
  montoprorrateado?: number | null;
  idconcepto?: number | null;
  concepto?: string | null;
  fechaliquidacion?: string | Date | null;
  destino?: string | null;
  cliente?: string | null;
}

export interface MasterLiquidacionResult {
  IdMasterLiquidacion: number;
  NumeroMasterCaja?: string | null;
  FechaLiquidacion?: string | Date | null;
  IdEstado?: number | null;
  IdTipoLiquidacion?: number | null;
  Liquidador?: string | null;
  TotalMovimientos: number;
  TotalMonto: number;
}
