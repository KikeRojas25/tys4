import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Cliente } from '../recepcion/ordentransporte/ordentransporte.types';
import { environment } from 'environments/environment';
import { Estaciones } from '../planning/planning.types';




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
export class ReporteService {
  private _httpClient = inject(HttpClient);
  private baseUrl = environment.baseUrl + '/api/Cliente/';
  private baseGeneralUrl = environment.baseUrl + '/api/Mantenimiento/';
  private baseReporteUrl = environment.baseUrl + '/api/Reporte/';

constructor() { }


getClientes(criterio): Observable<Cliente[]> {
  return this._httpClient.get<Cliente[]>(this.baseUrl + 'GetAllClients?idscliente=' + criterio   , httpOptions);
}

 GetAllEstaciones(): Observable<Estaciones[]> {
  return this._httpClient.get<Estaciones[]>(this.baseGeneralUrl + 'GetAllEstaciones' , httpOptions);
  }

  // Descargar reporte Producción vs Facturación
  getReporteProduccionVsFacturacion(anio: number): Observable<Blob> {
    const reporteUrl = environment.baseUrl + '/api/Reporte/reporte-excel';
    return this._httpClient.get(reporteUrl, {
      params: { anio: anio.toString() },
      headers: httpOptions.headers,
      responseType: 'blob'
    });
  }

  // Descargar PDF: OTs observadas sin seguimiento
  getReporteOTsObservadasSinSeguimiento(formato: 'pdf' | 'excel' = 'pdf'): Observable<Blob> {
    const reporteUrl = `${this.baseReporteUrl}ots-observadas-sin-seguimiento`;
    return this._httpClient.get(reporteUrl, {
      params: { formato },
      headers: httpOptions.headers,
      responseType: 'blob',
    });
  }

}
