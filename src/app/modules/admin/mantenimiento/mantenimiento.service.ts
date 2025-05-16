import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from 'environments/environment';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Chofer, InsertarPrecintoRequest, InsertarPrecintoResponse, Precinto, Proveedor } from './mantenimiento.types';
import { Cliente, ValorTabla } from '../recepcion/ordentransporte/ordentransporte.types';



const httpOptions = {
  headers: new HttpHeaders({
    Authorization : 'Bearer ' + localStorage.getItem('token'),
    'Content-Type' : 'application/json'
  }),
};


@Injectable({
  providedIn: 'root'
})
export class MantenimientoService {
  private _httpClient = inject(HttpClient);
  public jwtHelper = new JwtHelperService();
  private baseUrl = environment.baseUrl + '/api/Mantenimiento/';
  private baseUrlCliente = environment.baseUrl + '/api/Cliente/';

constructor() { }

getValorTabla(TablaId: number): Observable<ValorTabla[]> {
  return this._httpClient.get<ValorTabla[]>(this.baseUrl + 'GetAllValorTabla?TablaId=' + TablaId, httpOptions);
}



get(idcliente : number) : Observable<Cliente> {
  return this._httpClient.get<Cliente>(this.baseUrlCliente +"Get?id=" + idcliente  ,httpOptions)
  };

getAllClientes(criterio: string, usuarioid : number) : Observable<Cliente[]> {
  return this._httpClient.get<Cliente[]>(this.baseUrlCliente +"GetAllClientes?criterio="+ criterio+"&UsuarioId=" + usuarioid  ,httpOptions)
  };

  registrarCliente(model: any){
    return this._httpClient.post(this.baseUrlCliente + 'ClientRegister', model, httpOptions)
    .pipe(map((response: any) => {
       

    }))  
  }

  deleteCliente(id:number) {
    return this._httpClient.delete(this.baseUrlCliente + 'ClientDelete?id=' + id, httpOptions )
    .pipe(map((response: any) => {

    }));
}







getProveedores(criterio: string, tipoid : number): Observable<Proveedor[]> {
  return this._httpClient.get<Proveedor[]>(this.baseUrl +'GetProveedores?criterio=' + criterio + '&tipoid=' +  tipoid   , httpOptions);
}

insertarPrecintos(data: InsertarPrecintoRequest): Observable<InsertarPrecintoResponse> {
  return this._httpClient.post<InsertarPrecintoResponse>(`${this.baseUrl}insertarPrecinto`, data);
}

getPrecintos(): Observable<Precinto[]> {
  return this._httpClient.get<Precinto[]>( `${this.baseUrl}GetPrecintos`, httpOptions);
}


deletePrecinto(id: number): Observable<any> {
  return this._httpClient.delete(`${this.baseUrl}deletePrecinto/${id}`);
}

getVehiculoById(id: number): Observable<any> {
  return this._httpClient.get<any>(`${this.baseUrl}GetVehiculoById/${id}`);
}
actualizarVehiculo(id: number, vehiculo: any): Observable<any> {
  return this._httpClient.put<any>(`${this.baseUrl}ActualizarVehiculo/${id}`, vehiculo);
}

guardarVehiculo(vehiculo: any): Observable<any> {
  return this._httpClient.post<any>(`${this.baseUrl}RegistrarVehiculo`, vehiculo).pipe(
    catchError(err => {
      console.error('Error desde el servicio:', err);
      return throwError(() => err);
    })
  );
}



GetAllVehiculos(model: any): Observable<any[]> {

  if (model.IdProveedor === undefined || model.IdProveedor === null) {
    model.IdProveedor = '';
  }
  if (model.placa === undefined) {
    model.placa = '';
  }



  const params = new HttpParams()
  .set('placa', model.placa)
  .set('IdProveedor', model.IdProveedor);
  const url = `${this.baseUrl}GetAllVehiculo?placa=${encodeURIComponent(model.placa)}&IdProveedor=${encodeURIComponent(model.IdProveedor)}`;

  return this._httpClient.get<any[]>(url, httpOptions);
}


eliminarVehiculo(id: number): Observable<any> {
  return this._httpClient.delete(`${this.baseUrl}EliminarVehiculo/${id}`);
}


GetAllChoferes(): Observable<Chofer[]> {
  return this._httpClient.get<Chofer[]>(this.baseUrl +'GetAllConductor' , httpOptions);
}
registrar_chofer(model: any) {
  return this._httpClient.post(this.baseUrl + 'RegistrarConductor', model, httpOptions);
}
getChoferById(id: number): Observable<Chofer> {
  return this._httpClient.get<Chofer>(`${this.baseUrl}GetChofer/${id}`);
}
editar_chofer(model: any) {
  return this._httpClient.put(`${this.baseUrl}ActualizarChofer/${model.idchofer}`, model, httpOptions);
}


}
