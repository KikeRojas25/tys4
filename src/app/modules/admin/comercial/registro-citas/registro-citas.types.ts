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
