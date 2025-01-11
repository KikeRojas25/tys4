import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { UserService } from 'app/core/user/user.service';
import { environment } from 'environments/environment';
import { Manifiesto, OrdenTransporte } from '../trafico/trafico.types';



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


}
