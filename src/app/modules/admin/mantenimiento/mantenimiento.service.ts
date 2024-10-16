import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { Proveedor } from './mantenimiento.types';



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

constructor() { }


getProveedores(criterio: string, tipoid : number): Observable<Proveedor[]> {
  return this._httpClient.get<Proveedor[]>(this.baseUrl +'GetProveedores?criterio=' + criterio + '&tipoid=' +  tipoid   , httpOptions);
}


}
