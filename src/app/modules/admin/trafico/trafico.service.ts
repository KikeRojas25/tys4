import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { UserService } from 'app/core/user/user.service';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { HojaRuta, Manifiesto, Proveedor } from './trafico.types';
import { OrdenTransporte } from '../recepcion/ordentransporte/ordentransporte.types';


const httpOptions = {
  headers: new HttpHeaders({
    Authorization : 'Bearer ' + localStorage.getItem('token'),
    'Content-Type' : 'application/json'
  })
  // , observe: 'body', reportProgress: true };
};



@Injectable({
  providedIn: 'root'
})
export class TraficoService {

  
  private _authenticated: boolean = false;
  private _httpClient = inject(HttpClient);
  private _userService = inject(UserService);
  public jwtHelper = new JwtHelperService();
  private decodedToken: any;
  private baseUrl = environment.baseUrl + '/api/Trafico/';
  private baseGeneralUrl = environment.baseUrl + '/api/Mantenimiento/';


constructor() { }
VerHojasRutaTrocal(model: any) {
  const idequipo = model.idequipo ? model.idequipo : ''; // Si model.idequipo es null, usar una cadena vacía
  return this._httpClient.get<HojaRuta[]>(`${this.baseUrl}ListarHojaRutaTroncal?idequipo=${idequipo}`, httpOptions);
}


VerHojasRutaTrocalLocal(model: any) {
  return this._httpClient.get<HojaRuta[]>(`${this.baseUrl}GetAllTraficoLocal?`, httpOptions);
}

  VerDespachosxDepartamentoxProveedor(model: any) {
    const idequipo = model.idequipo ? model.idequipo : ''; // Si model.idequipo es null, usar una cadena vacía
     return this._httpClient.get<HojaRuta[]>(`${this.baseUrl}ListarDespachosxDepartamentoxProveedor?idequipo=${idequipo}`  , httpOptions);
  }

  VerResumenManifiesto (idhojaruta: number){
    return this._httpClient.get<Manifiesto[]>(`${this.baseUrl}VerResumenManifiesto?idhojaruta=${idhojaruta} ` , httpOptions);
  }

   ListarOrdenesTransporte(IdManifiesto: number): Observable<OrdenTransporte[]> {
    return this._httpClient.get<OrdenTransporte[]>(`${this.baseUrl}getAllOrdersForManifest?IdManifiesto=${IdManifiesto}`, httpOptions);
  }

  getAllManifiestosForProvider(IdProveedor: number, IdEstado: number, IdDepartamento: number) : Observable<Manifiesto[]> {
    return this._httpClient.get<Manifiesto[]>(`${this.baseUrl}getAllManifiestosForProvider?IdProveedor=${IdProveedor}&IdEstado=${IdEstado}&IdDepartamento=${IdDepartamento}`, httpOptions);
  }

  getProveedor(idproveedor : number): Observable<Proveedor> {
    return this._httpClient.get<Proveedor>(`${this.baseGeneralUrl}GetProveedor?id=${idproveedor}` , httpOptions);
  }

  getProveedores(criterio : string, idtipo: number): Observable<Proveedor[]> {
    return this._httpClient.get<Proveedor[]>(`${this.baseGeneralUrl}GetProveedores?criterio=${criterio}&tipoid=${idtipo}` , httpOptions);
  }
  cambiarEstadoOT(model) {
    
    model.fechaestado = model.fechaestado.toLocaleString();

    return this._httpClient.post<Manifiesto[]>(this.baseUrl + 'cambiarEstadoOT?', model , httpOptions);
  }


  getAllManifiestosForProviderRecojo(IdProveedor: number  , IdDepartamento: number  ) : Observable<Manifiesto[]> {
    return this._httpClient.get<Manifiesto[]>(`${this.baseUrl}getAllManifiestosForProviderRecojo?IdProveedor=${IdProveedor}&IdDepartamento=${IdDepartamento}`, httpOptions);
  }

  getAllOrdersxRepartidor(idrepartidor: number, idestado: number){
    const param = '?idrepartidor=' + idrepartidor + '&idestado=' + idestado;
    return this._httpClient.get<OrdenTransporte[]>(this.baseUrl + 'getAllOrdersxRepartidor' + param  , httpOptions);
   }

   CompararDestinos(iddestino: number, IdDestinatario: number){
    const param = '?IdDestino=' + iddestino + '&IdProveedor=' + IdDestinatario;
    return this._httpClient.get<any>(this.baseUrl + 'CompararDestinos' + param  , httpOptions);
   }

   getDireccionesProveedor(IdDestinatario: number) {
    const param = '?IdProveedor=' + IdDestinatario;
    return this._httpClient.get<any>(`${this.baseUrl}GetDistritosProveedor${param}`  , httpOptions);
   }

   getProveedorxDireccion(IdDestino: number) {
    const param = '?IdDestino=' + IdDestino;
    return this._httpClient.get<any>(`${this.baseUrl}GetProveedoresxDistrito${param}`  , httpOptions);
   }
  

}
