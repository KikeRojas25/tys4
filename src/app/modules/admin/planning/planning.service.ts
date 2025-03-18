import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { UserService } from 'app/core/user/user.service';
import { environment } from 'environments/environment';
import { catchError, Observable, throwError } from 'rxjs';
import { Estaciones, RespuestaApi } from './planning.types';
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
export class PlanningService {

  private _authenticated: boolean = false;
  private _httpClient = inject(HttpClient);
  private _userService = inject(UserService);
  public jwtHelper = new JwtHelperService();
  private decodedToken: any;
  private baseUrl = environment.baseUrl + '/api/Planning/';
  private baseGeneralUrl = environment.baseUrl + '/api/Mantenimiento/';

  

constructor() { }



GetAllOrdersGroupDepartament(model: any){
  if (model.idestacionorigen === 0 || model.idestacionorigen === undefined) {
    model.idestacionorigen = '';
 }

 if (model.iddepartamento === 0|| model.iddepartamento === undefined) {
    model.iddepartamento = '';
 }
 const param = '?idestacionorigen=' + model.idestacionorigen ;
 return this._httpClient.get<OrdenTransporte[]>(this.baseUrl + 'GetAllOrdersGroupDepartament' + param  , httpOptions);
}


 GetAllEstaciones(): Observable<Estaciones[]> {
  return this._httpClient.get<Estaciones[]>(this.baseGeneralUrl + 'GetAllEstaciones' , httpOptions);
  }

  GetAllOrdersGroupProvincias(model: any){

    model.ids = model.ids.substring(1, model.ids.length + 1 );
  
   const param = '?idsdepartamento=' + model.ids + '&idestacionorigen=' + model.idestacionorigen
   return this._httpClient.get<OrdenTransporte[]>(this.baseUrl + 'GetAllOrdersGroupProvincia' + param  , httpOptions);
  }

  CrearCarga(idusuariocreacion: number , idtipovehiculo: number, tipoperacioncarga: number, idestacion: number) {

    let  model: any  = {};
    model.idusuariocreacion = idusuariocreacion;
    model.idtipounidad = idtipovehiculo;
    model.tipooperacioncarga = tipoperacioncarga;
    model.idestacion = idestacion;

    console.log(model);

    return this._httpClient.post<any[]>(this.baseUrl + 'GenerarOperacionCarga?', model , httpOptions);
  }
  eliminarDespacho(model : any ) {
    return this._httpClient.post<any[]>(this.baseUrl + 'EliminarDespacho?', model , httpOptions);
  }
  confirmarSalida(model: any) {

    return this._httpClient.post<any[]>(this.baseUrl + 'darSalidaVehiculo?', model , httpOptions);
  }
  
  asignarTipoOperacion(model: any) {
    console.log('enviando:', model);
    return this._httpClient.post<RespuestaApi>(this.baseUrl + 'AsignarTipoOperacion?', model , httpOptions);
  }

  asignarTipoOperacionLocal(model: any) {
    console.log('enviando:', model);
    return this._httpClient.post<RespuestaApi>(this.baseUrl + 'asignarTipoOperacionLocal?', model , httpOptions);
  }

  AsignarProvinciaCarga(idprovincia: string, idcarga: number, idestacionorigen: number) {
    let  model: any  = {};
    model.idsprovincia = idprovincia;
    model.idcarga = idcarga;
    model.idestacionorigen = idestacionorigen;
    return this._httpClient.post<any[]>(this.baseUrl + 'AsignarProvinciaCarga?', model , httpOptions);
  }
  DesAsignarProvinciaCarga(idordentrabajo: number) {
    let  model: any  = {};
    model.idordentrabajo = idordentrabajo;
    return this._httpClient.post<any[]>(this.baseUrl + 'DesAsignarProvinciaCarga?', model , httpOptions);
  }

  GetAllOrdersDetailDeparment(idestacionorigen: number, iddepartamento: number) {
    return this._httpClient.get<OrdenTransporte[]>(this.baseUrl + 'GetAllOrdersDetailDeparment?idestacionorigen=' + idestacionorigen + '&iddepartamento=' + iddepartamento , httpOptions);
  }
  // confirmarDespacho(model: any) {
  //   return this._httpClient.post(this.baseUrl + 'ConfirmarDespacho', model, httpOptions);
  // }


  confirmarDespacho(model: any): Observable<any> {
    return this._httpClient.post(this.baseUrl + 'ConfirmarDespacho', model, httpOptions)
        .pipe(
            catchError(this.handleError)
        );
}


  AsignarOtsaLocal(model: any) {
    return this._httpClient.post(this.baseUrl + 'AsignarOtsaLocal', model, httpOptions);
  }
  
private handleError(error: HttpErrorResponse) {
  let errorMessage = 'Ocurrió un error desconocido';

  if (error.error instanceof ErrorEvent) {
      // Error de cliente (navegador, red)
      errorMessage = `Error: ${error.error.message}`;
  } else {
      // Error devuelto por el backend (500, 400, etc.)
      if (error.status === 400) {
          errorMessage = error.error?.message || 'Solicitud inválida';
      } else if (error.status === 500) {
          errorMessage = error.error?.message || 'Error interno del servidor';
      }
  }

  console.error(errorMessage);
  return throwError(() => new Error(errorMessage));
}
  
}
