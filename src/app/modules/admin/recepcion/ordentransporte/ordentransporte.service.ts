import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { UserService } from 'app/core/user/user.service';
import { environment } from 'environments/environment';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Chofer, Cliente, Concepto, Formula, HojaRuta, OperacionCarga, OrdenTransporte, Ubigeo, ValorTabla, Vehiculo } from './ordentransporte.types';
import { Manifiesto } from '../../trafico/trafico.types';


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
export class OrdenTransporteService {

  private _authenticated: boolean = false;
  private _httpClient = inject(HttpClient);
  private _userService = inject(UserService);
  public jwtHelper = new JwtHelperService();
  private decodedToken: any;


  private baseUrl = environment.baseUrl + '/api/Trafico/';
  private baseMantenimientoUrl = environment.baseUrl + '/api/Mantenimiento/';
  private baseUrlCliente = environment.baseUrl + '/api/Cliente/';
  private baseUrlOrden = environment.baseUrl + '/api/Orden/';



constructor() { }

private handleError(error: HttpErrorResponse) {
  console.error('Error occurred:', error);
  return throwError(() => new Error('Ocurrió un error.'));
}


getUbigeo(criterio): Observable<Ubigeo[]> {
  return this._httpClient.get<Ubigeo[]>(`${this.baseMantenimientoUrl}GetListUbigeo?criterio=${criterio}`  , httpOptions);
}
getClientes(criterio: any): Observable<Cliente[]> {
  return this._httpClient.get<Cliente[]>(`${this.baseUrlCliente}GetAllClients?idscliente=${criterio}`   , httpOptions);
}
getValorTabla(TablaId: number): Observable<ValorTabla[]> {
  return this._httpClient.get<ValorTabla[]>(`${this.baseMantenimientoUrl}GetAllValorTabla?TablaId=${TablaId}` , httpOptions);
}



getVehiculos(placa: string) {
   return this._httpClient.get<Vehiculo[]>(`${this.baseMantenimientoUrl}GetVehiculos?placa=${placa}`, httpOptions);
}
getChoferes(criterio: string): Observable<Chofer[]> {
  return this._httpClient.get<Chofer[]>(`${this.baseMantenimientoUrl}GetChofer?criterio=${criterio}` , httpOptions);
}


getFormulas(idCliente: number ,idOrigen: number, idDestino: number): Observable<Formula[]> {
  return this._httpClient.get<Formula[]>(`${this.baseUrlOrden}GetFormulaTarifa?idcliente=${idCliente}&idorigen=${idOrigen}&iddestino=${idDestino}` , httpOptions);
}

getConceptos(idCliente: number ,idOrigen: number, idDestino: number, idFormula: number, idTipoTransporte:number): Observable<Concepto[]> {
  return this._httpClient.get<Concepto[]>(`${this.baseUrlOrden}ObtenerConceptosTarifa?idcliente=${idCliente}&idorigen=${idOrigen}&iddestino=${idDestino}&idtipotransporte=${idTipoTransporte}&idformula=${idFormula}`
     , httpOptions);
}


getAllOrder(model: any) {

  if (model.idcliente  === 0 || model.idcliente === undefined) {
    model.idcliente = '';
  }

  if (model.idestado  === 0) {
    model.idestado = '';
  }

  let params = new HttpParams()
    .set('idcliente', model.idcliente.toString())
    .set('fecinicio', model.fecinicio.toLocaleDateString()) // Usar un formato estándar de fecha
    .set('fecfin', model.fecfin.toLocaleDateString())       // Misma consideración para la fecha final
    .set('idestado', model.idestado.toString())
    .set('numcp', model.numcp.toString())
    .set('nummanifiesto', model.nummanifiesto.toString())
    .set('numhojaruta', model.numhojaruta.toString())
    .set('idusuario', model.idusuario.toString());

    return this._httpClient.get<OrdenTransporte[]>(`${this.baseUrlOrden}GetAllOrder`, { params, ...httpOptions })
    .pipe(
      // Manejo de errores
      catchError(this.handleError)
    );
}

getEventos(idordentransporte:number): Observable<any[]> {
  return this._httpClient.get<any[]>(`${this.baseUrlOrden}getAllEventosxOt?idOrden=${idordentransporte}`,httpOptions );
}
GetAllCargasTemporal (tipo: number) {
  return this._httpClient.get<OperacionCarga[]>(this.baseUrlOrden + 'GetAllCargasTemporal?tipooperacioncarga=' + tipo   , httpOptions);
}
GetAllOrdersCargasTemporal (id: number){
  return this._httpClient.get<OrdenTransporte[]>(this.baseUrlOrden + 'GetAllOrdersCargasTemporal?idcarga=' + id   , httpOptions);
 }


 getHojasRuta(idestacion: number) : Observable<HojaRuta[]> {
  return this._httpClient.get<HojaRuta[]>(this.baseUrlOrden + 'getAllPreHojasRuta?idestacion=' + idestacion   , httpOptions);
 }



 confirmar_entrega(model: any) {

  return this._httpClient.post(this.baseUrl + 'ConfirmarEntregav2', model, httpOptions)
  .pipe(
    map((response: any) => {
    }
  )
);
}








 registrarOTR(model: any, guias: any): Observable<OrdenTransporte> {
  model.guias = guias;
  return this._httpClient.post<OrdenTransporte>(`${this.baseUrl}registerOTR`, model, httpOptions);
}
calcularPrecio(model: any): Observable<OrdenTransporte> {
  return this._httpClient.post<OrdenTransporte>(`${this.baseUrlOrden}calcularPrecio`, model, httpOptions);
}

generarManifiesto(model: any): Observable<Manifiesto> {
  return this._httpClient.post<Manifiesto>(`${this.baseUrlOrden}GenerarManifiestoVirtual`, model, httpOptions);
}




}
