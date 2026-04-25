export interface User {
    id: number;
    name: string;
    avatar?: string;
    status?: string;
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
    idscliente: string;
    usr_str_red: string;
    idestacionorigen? : number;
    estrafico?: boolean;
    esalmacen?: boolean;
    idclientes: string;
    
    usr_str_nombre: string;
    usr_str_apellidos: string;
    usr_str_email?: string;
    idequipo: number;
    usr_int_bloqueado?: number;

}

export interface UserForUpdateDto {
    Id: number;
    Nombres: string;
    Apellidos: string;
    Email: string;
    clientesids: string[];
}
