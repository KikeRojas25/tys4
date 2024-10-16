export interface Estaciones {
    idEstacion: number;
    estacionOrigen: string;
}
export interface Carga {
    idcarga: number;
    numcarga: string;
    idtipounidad: number;
  
   }

   export interface RespuestaApi {
    error: boolean;
    resp: string;
  }
  