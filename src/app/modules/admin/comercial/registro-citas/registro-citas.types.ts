export type TipoRegistro = 'cita' | 'reclamo' | 'consulta' | 'recojo' | 'incidencia';

export interface OTPendiente {
  idordentrabajo: number;
  numcp: string;
  razonsocial?: string;
  destino?: string;
  origen?: string;
  puntopartida?: string;
  peso?: number;
  bulto?: number;
  volumen?: number;
  estado?: string;
  idestado?: number;
  fecharegistro?: string;
  remitente?: string;
  destinatario?: string;
  estacionorigen?: string;
}

export interface OTObservada {
  idordentrabajo: number;
  numcp: string;
  razonsocial?: string;
  remitente?: string;
  destinatario?: string;
  origen?: string;
  destino?: string;
  estacionorigen?: string;
  peso?: number;
  bulto?: number;
  volumen?: number;
  estado?: string;
  idestado?: number;
  fecharegistro?: string;
  /** Motivo de la observación (lo que en vistarepartidor marca la OT como observada). */
  tipoentrega?: string;
  observacion?: string;
  fechaobservacion?: string;
}
