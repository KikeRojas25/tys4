export interface Proveedor {
    idProveedor: number;
    ruc: string;
    razonSocial: string;
    distrito : string;
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