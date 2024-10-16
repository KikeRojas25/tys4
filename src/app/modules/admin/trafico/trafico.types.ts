export interface User {
  id: number;
  usr_int_id: number;
  username: string  ;
  nombreCompleto: string  ;
  dni: string;
  email: string  ;
  enLinea: boolean  ;
  estado: string  ;
  edad: number  ;
  created?: Date ;
  lastActive: Date  ;
  nombreEstado: string;
  estadoId: number;
  idclientes: string;
  usr_str_red: string;
  idestacionorigen? : number;
}
export interface Manifiesto {
  idManifiesto: number;
  idDespacho: number;
  idCarga: number;
  respuesta: boolean;
  chofer: string;
  numHojaRuta: string;
  placa: string;

}
export interface OrdenTransporte {

  idordentrabajo?: number;
  idordenrecojo?: number;
  numcp?: string;
  tipoorden?:string;
  iddepartamento?: number;
  cantidad?:number;
  bulto?: number;
  peso?: number;
  subtotal?: number;
  idCarga?: number;
  cantidadprecintos?: number;
  precinto?: string;

}
export interface Proveedor {
  idProveedor: number;
  ruc: string;
  razonSocial: string;
  distrito : string;
  direccion: string;
  telefono: string;
  
}


export interface HojaRuta {
 
  idcliente?: number;

  numcarga?: string;
  idcarga?: number;
  detalle?: string;

  razonsocial?: string;
  destino?: string;
  remitente?: string;
  destinatario?: string;
  tipotransporte?: string;
  conceptocobro?: string;
  fecharegistro?: Date;
  fechadespacho?: Date;
  fechaentrega?: Date;
  fechaenzona?: Date;
  fecharecojo?: Date;
  fechacita?: Date;
  horacita?: string;
  peso?: number;
  volumen?: number;
  bulto?: number;
  docgeneral?: string;
  grr?: string;
  estado?: string;
  responsable?: string;
  idvehiculo?: number;
  numManifiesto?: string;
  placa?: string;
  chofer?: string ;
  cliente?: string;
  origen?:string;
  lat?: number;
  lng?: number;
  personarecojo?: string;
  direccion?: string;
  telefonorecojo?: string;
  numHojaRuta?: string;
  ruta?: string;

 
  

  tipoentrega?: string;
  idtipoentrega?: number;
  idusuarioentrega?: number;

  subtotal?: number;

  enzona?: boolean;
  cantidad?: number;
  iddepartamento?: number;
  idprovincia?: number;
  zona?: string;

  idmanifiesto?: number;
  iddespacho?: number;
  despachado?: boolean;

  cantidadprecintos?: number;
  precinto? : string;
  terminado?: boolean;
  repartidor?: string;
  valija?: boolean;

  fechaetaentrega?: Date;
  fechaetacargo?: Date;
  fechaetaenviocargo?: Date;
  fechaentregareparto?: Date;
  fechahoracita?: Date;
  numcarga2?: string;
}

export interface Incidencia {
  incidencia: string;
  fecha_incidencia: Date;
  observacion: string;
  usuario_registro: string ;
}

export interface Documento {
  id: number;
  ruta: string;
  nombre: string;
  tipo_id: number;
  tipo_documento: string;
  numero_documento: string;
  carga_id: number;
}