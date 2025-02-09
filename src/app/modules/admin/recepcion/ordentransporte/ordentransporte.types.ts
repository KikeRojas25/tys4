import { NumberInput } from "@angular/cdk/coercion";
import { NumericDictionary } from "lodash";


export interface OrdenTransporte {
    idordentrabajo?: number;
    idordenrecojo?: number;
    numcp?: string;
    
    idcliente?: number;
    idremitente?: number;
    iddestinatario?: number;
    idorigen?: number;
    puntopartida?: string;
    iddestino?: number;
    puntollegada?: string;
    idchofer?: number;
    horarecojo?: string;
    guiarecojo?: string;
    pesovol?: number;
    idformula?: number;
    idtipotransporte?: number;
    idconceptocobro?: number;
    idtipomercaderia?: number;
    descripciongeneral?: string;
    guiasremitente?: string;

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
    nummanifiesto?: string;
    placa?: string;
    chofer?: string ;
    cliente?: string;
    oriflameid?: number;
    origen?:string;
    lat?: number;
    lng?: number;
    personarecojo?: string;
    direccion?: string;
    telefonorecojo?: string;
    numHojaRuta?: string;
    ruta?: string;

    fecvisita1?: Date;
    fecvisita2?: Date;
    fecvisita3?: Date;
    tipoorden?:string;

    tipoentrega?: string;
    idtipoentrega?: number;
    idusuarioentrega?: number;

    subtotal?: number;

    enzona?: boolean;
    cantidad?: number;
    iddepartamento?: number;
    idprovincia?: number;
    zona?: string;
    idorden?: number;
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
    validado?: false;
    mensaje?: string;


}


export interface Ubigeo {
    idDistrito: number;
    idprovincia: number;
    iddepartamento: number;
    ubigeo: string;
}

export interface Cliente {
    idCliente: number;
    nombre: string;
    razonSocial: string;
    tipoDocumentoId: number;
    documento: string;
    idproveedor: number;
}

export interface ValorTabla {
    idValorTabla: number;
    valor: string;
    idmaestrotabla: number;
    activo: boolean;
    orden: number;
}
export interface Chofer {
    idChofer: number;
    dni: string;
    nombreChofer: string;
    apellidoChofer: string;
    brevete: string ;
}

export interface Formula {
    idFormula: number;
    formula: string;
}
export interface Concepto {
    idConceptoCobro: number;
    concepto: string;
}

export interface Vehiculo {
    idVehiculo: number;
    placa: string;
    tipoVehiculo: string;
    marca: string;
    cargaUtil: number;
    pesoBruto: number;
    tipoVehiculoId: number;
    marcaId: number;
    confVeh: string;
    volumen: number;
    chofer: string;
    estado: string;
    proveedor: string;
}

export interface OperacionCarga {
    idcarga : number;
    numcarga : string;
    peso : number;
    vol : number;
    fecharegistro : Date,
    planificador: string;
    tipounidad : string;
    subtotal: number;
  }
  
export interface HojaRuta {
        numHojaRuta: string;        // Número de la Hoja de Ruta (required en TS se hace con "!")
        placa?: string;              // Placa del vehículo (opcional)
        nombreChofer?: string;       // Nombre del chofer (opcional)
        fechaHoraPlanning?: Date;    // Fecha y hora del planning (opcional)
        idDespacho: number;         // ID del despacho (required)
        proveedor?: string;          // Nombre del proveedor (opcional)
        cantidadPrecintos: number;  // Cantidad de precintos (required)
        cantidadValija: number;     // Cantidad de valijas (required)
        ruta?: string;               // Ruta (opcional)
        preManifiesto?: string;      // Pre-manifiesto (opcional)
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