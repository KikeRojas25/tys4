export interface Proveedor {
    idProveedor: number;
    ruc: string;
    razonSocial: string;
    distrito?: string;

    // Campos CRUD (según ProveedorController)
    activo?: boolean;
    direccion?: string | null;
    tipoId?: number | null;
    idDepartamento?: number | null;
    idProvincia?: number | null;
    idProvinciaRepartidor?: number | null;
    telefono?: string | null;

    // Campos de presentación (cuando el API devuelve joins/labels)
    tipo?: string | null;
    departamento?: string | null;
    provincia?: string | null;
    provinciaRepartidor?: string | null;
    ubigeo?: string | null;
  }

export interface ProveedorForCreateDto {
  razonSocial: string;
  ruc: string;
  direccion?: string | null;
  tipoId: number;
  idDepartamento: number | null;
  idProvincia: number | null;
  idProvinciaRepartidor?: number | null;
  telefono?: string | null;
}

  export interface InsertarPrecintoRequest {
    precinto: string;
    cantidad: number;
  }

  
export interface InsertarPrecintoResponse {
  insertados: number;
}

export interface Precinto {
  idPrecinto: number;
  precinto: string;
}

export interface Chofer {
  id: number;
  dni: string;
  nombreCompleto: string;
  brevete: string ;
  telefono: string;
}
export interface Departamento {
  idDepartamento: number;
  departamento: string;
}

export interface Provincia {
  idProvincia: number;
  provincia: string;
}

export interface Distrito {
  idDistrito: number;
  distrito: string;
}

export interface Estacion {
  idEstacion: number;
  estacionOrigen: string;
  idDistrito: number;
  flujoRegular: boolean;
  distrito?: string;
}