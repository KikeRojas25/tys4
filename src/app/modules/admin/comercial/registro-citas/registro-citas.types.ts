export type TipoRegistro = 'cita' | 'reclamo' | 'consulta' | 'recojo';

export interface OTPendiente {
  numcp: string;
  destino: string;
  peso: number;
  bulto: number;
  estado: string;
}
