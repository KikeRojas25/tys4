import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { UserService } from 'app/core/user/user.service';
import { environment } from 'environments/environment';
import { Manifiesto } from '../trafico/trafico.types';
import { OrdenTransporte } from '../recepcion/ordentransporte/ordentransporte.types';
import { Observable } from 'rxjs';



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
export class DespachoService {

  private _authenticated: boolean = false;
  private _httpClient = inject(HttpClient);
  private _userService = inject(UserService);
  public jwtHelper = new JwtHelperService();
  private decodedToken: any;
  private baseUrl = environment.baseUrl + '/api/Orden/';
  private baseGeneralUrl = environment.baseUrl + '/api/Mantenimiento/';
  private baseUrlDespacho = environment.baseUrl + '/api/Despacho/';

  

constructor() { }

getAllPreHojaRuta(model: any) {
  const param = '?idestado=' + 1
  return this._httpClient.get<OrdenTransporte[]>(this.baseUrl + 'getAllPreHojasRuta' + param  , httpOptions);
}
getAllOrderTransportPending(model: any) : Observable<OrdenTransporte[]> {

  if (model.idcliente === 0 || model.idcliente === undefined) {
      model.idcliente = '';
   }
  const param = '?idcliente=' + model.idcliente ;
  return this._httpClient.get<OrdenTransporte[]>(this.baseUrl + 'GetAllOrderPending' + param  , httpOptions);
}
getAllPreHojaRutaEnBase(model: any) {
  const param = '?idestado=' + 1
  return this._httpClient.get<OrdenTransporte[]>(this.baseUrl + 'getAllPreHojasRutaEnBase' + param  , httpOptions);
}


getAllPreManifiestos(model: any): any {
  const param = '?numhojaruta=' + model.numHojaRuta ;
  return this._httpClient.get<Manifiesto[]>(this.baseUrl + 'getAllPreManifiestos' + param  , httpOptions);
}

confirmarDespacho2(model: any, manifiestos: any[]) {

  model.manifiestos = manifiestos;
  return this._httpClient.post(this.baseUrlDespacho + 'ConfirmarDespacho2', model, httpOptions);

}


getEstibaAutorizada(numhojaruta: string) {
  console.log(numhojaruta, 'hu')
  return this._httpClient.get<OrdenTransporte>(this.baseUrl + 'getEstibaAutorizada?numhojaruta='  + numhojaruta, httpOptions);

}
confirmarSalida(model: any) {

  return this._httpClient.post<OrdenTransporte[]>(this.baseUrl + 'darSalidaVehiculo?', model , httpOptions);
}

getAllOrdersForDespacho(numhojaruta: string) {
  return this._httpClient.get<OrdenTransporte[]>(this.baseUrl + 'getAllOrdersForDespacho?numhojaruta='  + numhojaruta, httpOptions);
}

autorizarHojaRuta (numhojaruta: string) {
  let  model: any  = {};
  model.numhojaruta = numhojaruta ;
  return this._httpClient.post<OrdenTransporte[]>(this.baseUrl + 'autorizarHojaRuta' , model ,httpOptions);
}
confirmarEstibaxOTs (ots: any[]) {
  console.log(ots);
  return this._httpClient.post<OrdenTransporte>(this.baseUrl + 'confirmarEstibaxOTs' , ots ,httpOptions);
}

desvincularOt (idordentrabajo: number) {
  let  model: any  = {};
  model.idordentrabajo = idordentrabajo ;
  return this._httpClient.post<OrdenTransporte[]>(this.baseUrlDespacho + 'desvincularOt' , model ,httpOptions);
}
generarGrt (numhojaruta: string, grt: string) {
  let  model: any  = {};
  model.numhojaruta = numhojaruta ;
  model.grt = grt ;
  return this._httpClient.post<OrdenTransporte[]>(this.baseUrlDespacho + 'generarGrt' , model ,httpOptions);
}

}
