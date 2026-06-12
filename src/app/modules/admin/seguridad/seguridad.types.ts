export interface Rol {
  id: number;
  descripcion: string;
  alias: string;
  activo: boolean;
  publico: boolean;
}

export interface Pagina {
  id: number;
  codmenu: string;
  codmenuPadre: string | null;
  descripcion: string;
  nombre: string;
  url: string | null;
  nivel: number;
  secuencia: number | null;
}

export interface RolMantenimientoPayload {
  rolId?: number | null;
  descripcion: string;
  alias: string;
  publico: boolean;
}
