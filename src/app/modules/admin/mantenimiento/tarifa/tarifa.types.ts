export interface Tarifa {
  // IDs principales
  idtarifa?: number;
  idcliente?: number;
  razonsocial?: string;
  
  // ORIGEN
  idorigendepartamento?: number;
  origendepartamento?: string;
  idorigenprovincia?: number;
  origenprovincia?: string;
  idorigendistrito?: number;
  origendistrito?: string;
  
  // DESTINO
  iddepartamentodestino?: number;
  destinodepartamento?: string;
  idprovinciadestino?: number;
  destinoprovincia?: string;
  iddistritodestino?: number;
  destinodistrito?: string;
  
  // RESTO DE DATOS
  idformula?: number;
  formula?: string;
  idmoneda?: number;
  moneda?: string;
  urgente?: boolean;
  autoserv?: boolean;
  val?: boolean;
  conceptos?: string;
  idconceptocobro?: number;
  idtipounidad?: number;
  tipounidad?: string;
  idtipotransporte?: number;
  tipotransporte?: string;
  idzona?: number;
  zona?: string;
  montobase?: number;
  pesovolumen?: number;
  minimo?: number;
  desde?: number;
  hasta?: number;
  precio?: number;
  adicional?: number;
  consideraPesoVolumetrico?: boolean;
  
  // Campos legacy para compatibilidad
  idTarifa?: number;
  idCliente?: number;
  departamentoOrigen?: string;
  provinciaOrigen?: string;
  distritoOrigen?: string;
  zonaOrigen?: string;
  departamentoDestino?: string;
  provinciaDestino?: string;
  distritoDestino?: string;
  modalidadTransporte?: string;
  cobrarPor?: string;
  tipoUnidad?: string;
  base?: number;
  pesoVolumen?: number;
  min?: number;
  adiciona?: number;
  origen?: string;
  departamento?: string;
  provincia?: string;
  distrito?: string;
}
export interface FiltroTarifa {
  idCliente?: number;
  idorigendepartamento?: number;
  idorigenprovincia?: number;
  idorigendistrito?: number;
  iddepartamentodestino?: number;
  idprovinciadestino?: number;
  iddistritodestino?: number;
}