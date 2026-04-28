export interface LeadTime {
  id?: number;
  idCliente: number;
  cliente?: string;
  idOrigenDepartamento?: number;
  idOrigenProvincia: number;
  origenProvincia?: string;
  idDestinoDepartamento?: number;
  idDestinoProvincia: number;
  destinoProvincia?: string;
  horas: number;
}

/** Fila editable: departamento + provincia + días (1-6) por cliente */
export interface LeadTimeProvinciaRow {
  idDepartamento: number;
  departamento: string;
  idProvincia: number;
  provincia: string;
  dias: number; // 1 a 30
}

/** Fila retornada por los SPs de lead time (comercial u operativo) */
export interface LeadTimeRow {
  iddepartamento: number;
  departamento: string;
  idprovincia: number;
  provincia: string;
  dias: number | null;
}
