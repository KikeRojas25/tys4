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