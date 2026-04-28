export type ReclamoEstadoCodigo = 'registrado' | 'en-atencion' | 'resuelto' | 'descartado';

export type ReclamoAreaCodigo =
  | 'programacion-local'
  | 'programacion-provincia'
  | 'trafico'
  | 'almacen'
  | 'incidencia';

export interface ReclamoArea {
  idarea: number;
  codigo: ReclamoAreaCodigo;
  nombre: string;
}

export interface ReclamoSubtipo {
  idsubtipo: number;
  idarea: number;
  codigo: string;
  nombre: string;
  permite_texto_libre: boolean;
}

export interface ReclamoEstado {
  idestado: number;
  codigo: ReclamoEstadoCodigo;
  nombre: string;
  es_terminal: boolean;
}

export interface ReclamoCatalogo {
  areas: ReclamoArea[];
  subtipos: ReclamoSubtipo[];
  estados: ReclamoEstado[];
}

/** Payload de creación de un reclamo (POST /api/Reclamo). */
export interface ReclamoCreatePayload {
  idcliente: number;
  area_codigo: ReclamoAreaCodigo;
  subtipo_codigo: string;
  texto_libre?: string | null;
  /** OT/OR relacionada — comparten tabla (Seguimiento.OrdenTrabajo) diferenciada por tipo. */
  idordentrabajo?: number | null;
  observaciones?: string | null;
  idusuarioregistro: number;
}

/** Reclamo tal como lo devuelve el listado o el detalle. */
export interface Reclamo {
  idreclamo: number;
  idcliente: number;
  cliente?: string | null;
  idarea: number;
  area_codigo: ReclamoAreaCodigo;
  area_nombre: string;
  idsubtipo: number;
  subtipo_codigo: string;
  subtipo_nombre: string;
  texto_libre?: string | null;
  idordentrabajo?: number | null;
  ot_numcp?: string | null;
  observaciones?: string | null;
  idestado: number;
  estado_codigo: ReclamoEstadoCodigo;
  estado_nombre: string;
  idusuarioregistro: number;
  usuario_registro?: string | null;
  fecharegistro: string;
  idusuarioactualiza?: number | null;
  usuario_actualiza?: string | null;
  fechaactualiza?: string | null;
}

export interface ReclamoHistorial {
  idhistorial: number;
  idreclamo: number;
  idestado_anterior?: number | null;
  estado_anterior?: string | null;
  idestado_nuevo: number;
  estado_nuevo: string;
  comentario?: string | null;
  idusuario: number;
  usuario?: string | null;
  fecha: string;
}

export interface CambiarEstadoPayload {
  estado_codigo: ReclamoEstadoCodigo;
  comentario?: string | null;
  idusuario: number;
}

export interface ReclamoDetalle {
  reclamo: Reclamo;
  historial: ReclamoHistorial[];
}
