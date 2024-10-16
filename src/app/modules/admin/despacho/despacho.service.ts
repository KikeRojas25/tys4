import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { UserService } from 'app/core/user/user.service';
import { environment } from 'environments/environment';
import { OrdenTransporte } from '../trafico/trafico.types';



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

  

constructor() { }

getAllPreHojaRuta(model: any) {
  const param = '?idestado=' + 1
  return this._httpClient.get<OrdenTransporte[]>(this.baseUrl + 'getAllPreHojasRuta' + param  , httpOptions);
}

getAllPreHojaRutaEnBase(model: any) {
  const param = '?idestado=' + 1
  return this._httpClient.get<OrdenTransporte[]>(this.baseUrl + 'getAllPreHojasRutaEnBase' + param  , httpOptions);
}


getAllPreManifiestos(model: any) {
  const param = '?numhojaruta=' + model.numHojaRuta ;
  return this._httpClient.get<OrdenTransporte[]>(this.baseUrl + 'getAllPreManifiestos' + param  , httpOptions);
}



}
