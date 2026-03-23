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
  dias: number; // 1 a 6
}
