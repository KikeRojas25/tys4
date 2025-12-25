/**
 * Tipos TypeScript para la gestión de Etapas de Despacho
 * Estos tipos corresponden a la estructura de base de datos propuesta
 */

import { OrdenTransporte } from '../../recepcion/ordentransporte/ordentransporte.types';

/**
 * DTO para crear/actualizar una etapa de despacho
 */
export interface EtapaDespachoDTO {
  idEtapaDespacho?: number;
  idCarga: number;
  nombre: string;
  descripcion: string;
  orden: number;
  idTipoOperacion?: number;
  idUsuarioCreacion: number;
  idUsuarioModificacion?: number;
  
  // Datos de Proveedor/Tercero
  idRemitente?: number;
  idDestinatario?: number;
  idDireccion?: number;
  
  // Datos de Agencia (si tipoOperacion === 123)
  pesoAgencia?: number;
  bultoAgencia?: number;
  nroFactura?: string;
  consignadoAgencia?: string;
  claveAgencia?: string;
  nroRemito?: string;
  costoEnvio?: number;
  idAgencia?: number;
  
  // OTs asociadas (IDs de las órdenes de trabajo)
  idOrdenesTrabajo?: number[];
}

/**
 * Respuesta del backend con información completa de la etapa
 */
export interface EtapaDespachoResponse {
  idEtapaDespacho: number;
  idCarga: number;
  numCarga: string;  // Número de despacho para mostrar
  nombre: string;
  descripcion: string;
  orden: number;
  idTipoOperacion?: number;
  tipoOperacionLabel?: string;  // Label del tipo de operación
  fechaCreacion: Date;
  fechaModificacion?: Date;
  activo: boolean;
  
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

/**
 * Información de Orden de Trabajo asociada a una etapa
 */
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
  fechaAsignacion?: Date;
}

/**
 * Respuesta de la API al crear/actualizar una etapa
 */
export interface EtapaDespachoApiResponse {
  success: boolean;
  message: string;
  data?: EtapaDespachoResponse;
  error?: string;
}

/**
 * Request para eliminar una etapa
 */
export interface EliminarEtapaRequest {
  idEtapaDespacho: number;
  idUsuario: number;
}

