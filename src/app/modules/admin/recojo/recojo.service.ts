import { Injectable, ViewEncapsulation } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { OrdenTransporte, Ubigeo } from '../recepcion/ordentransporte/ordentransporte.types';
import { Documento, Incidencia } from '../trafico/trafico.types';
import { OrdenRecojoFullDto, Usuario } from './recojo.types';




const httpOptions = {
  headers: new HttpHeaders({
    Authorization : 'Bearer ' + localStorage.getItem('token'),
    'Content-Type' : 'application/json'
  }),

};
const headers = new HttpHeaders().set('authorization', 'Bearer ' + localStorage.getItem('token'));

const httpOptionsUpload = {
  headers: new HttpHeaders({
    Authorization : 'Bearer ' + localStorage.getItem('token'),
  })
  // , observe: 'body', reportProgress: true };
};

@Injectable({
  providedIn: 'root'
})

export class RecojoService {

  baseUrl = environment.baseUrl + '/api/recojo/';
  baseUrlAuth = environment.baseUrl + '/api/auth/';
  baseUrlMantenimiento = environment.baseUrl + '/api/mantenimiento/';
constructor(private http: HttpClient) { }


getAllOrderRecojo(model: any) {
  // 🔹 Crear copia inmutable del modelo original
  const params = { ...model };

  // Normalizar valores nulos o vacíos
  params.idcliente = params.idcliente && params.idcliente !== 0 ? params.idcliente : '';
  params.idestado = params.idestado && params.idestado !== 0 ? params.idestado : '';
  params.idresponsable = params.idresponsable && params.idresponsable !== 0 ? params.idresponsable : '';
  params.numcp = params.numcp ? params.numcp.trim() : '';

  console.log('params enviados:', params);

  // ✅ Construir la URL con todos los parámetros, incluyendo responsable
  const url =
    `${this.baseUrl}GetAllOrdenesRecojo` +
    `?idcliente=${params.idcliente}` +
    `&fec_ini=${params.fec_ini.toLocaleDateString()}` +
    `&fec_fin=${params.fec_fin.toLocaleDateString()}` +
    `&idestado=${params.idestado}` +
    `&idresponsable=${params.idresponsable}` +
    `&numcp=${params.numcp}`;

  return this.http.get<OrdenTransporte[]>(url, httpOptions);
}

eliminar(model: any): Observable<OrdenTransporte> {
  return this.http.post<OrdenTransporte>(this.baseUrl + 'DeleteOrdenRecojo', model, httpOptions);
}
getUbigeo(criterio): Observable<Ubigeo[]> {
  return this.http.get<Ubigeo[]>(this.baseUrlMantenimiento + 'GetListUbigeo?criterio=' + criterio  , httpOptions);
}
getAllIncidencias(id: number) {
    return this.http.get<Incidencia[]>(this.baseUrl + 'GetAllIncidencias?idordentrabajo=' + id , httpOptions);
    }
getAllDocumentos(id: number): Observable<Documento[]> {
      const params = '?Id=' + id ;
      return this.http.get<Documento[]>(this.baseUrl + 'GetAllDocumentos' + params, httpOptions);
    }
downloadDocumento(id: number): any {
  return this.http.get(this.baseUrl + 'DownloadArchivo?documentoId=' + id, {headers, responseType: 'blob' as 'json'});
}

registrar(model: any): Observable<OrdenTransporte> {
  return this.http.post<OrdenTransporte>(this.baseUrl + 'registerOR', model, httpOptions);
}


  actualizar(id: number, payload: OrdenTransporte): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}Actualizar/${id}`, payload);
  }


  GetAllDireccionesByClienteId(id: number): Observable<any[]> {
    const params = '?idcliente=' + id ;
    return this.http.get<any[]>(this.baseUrl + 'GetAllDireccionesByClienteId' + params, httpOptions);
  }

  getOrdenRecojoById(id: number): Observable<OrdenRecojoFullDto> {
    return this.http.get<OrdenRecojoFullDto>(`${this.baseUrl}GetOrdenRecojoById/${id}`);
  }

  getUsuariosPorRol(rolId: number): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.baseUrlAuth}usuarios/${rolId}`, httpOptions);
  }

  buscarOrPorNumcp(numcp: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}BuscarOrPorNumcp?numcp=${numcp}`, httpOptions);
  }

  getOtsPendientesRecepcionCreacionOt(idCliente: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}OtsPendientesRecepcionCreacionOt?idCliente=${idCliente}`, httpOptions);
  }

  reasignarProveedor(idordentrabajo: number, idproveedor: number): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}ReasignarProveedor/${idordentrabajo}`, idproveedor, httpOptions);
  }

}