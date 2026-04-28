import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import {
  CambiarEstadoPayload,
  Reclamo,
  ReclamoCatalogo,
  ReclamoCreatePayload,
  ReclamoDetalle,
} from './reclamo.types';

const httpOptions = {
  headers: new HttpHeaders({
    Authorization: 'Bearer ' + localStorage.getItem('token'),
    'Content-Type': 'application/json',
  }),
};

@Injectable({ providedIn: 'root' })
export class ReclamoService {
  private http = inject(HttpClient);
  private baseUrl = environment.baseUrl + '/api/Reclamo';

  guardar(payload: ReclamoCreatePayload): Observable<{ idreclamo: number }> {
    return this.http.post<{ idreclamo: number }>(this.baseUrl, payload, httpOptions);
  }

  listar(filtros: {
    idcliente?: number | null;
    idarea?: number | null;
    idestado?: number | null;
    fechaDesde?: string | null;
    fechaHasta?: string | null;
  } = {}): Observable<Reclamo[]> {
    const qs: string[] = [];
    if (filtros.idcliente   != null) qs.push(`idcliente=${filtros.idcliente}`);
    if (filtros.idarea      != null) qs.push(`idarea=${filtros.idarea}`);
    if (filtros.idestado    != null) qs.push(`idestado=${filtros.idestado}`);
    if (filtros.fechaDesde)          qs.push(`fechaDesde=${filtros.fechaDesde}`);
    if (filtros.fechaHasta)          qs.push(`fechaHasta=${filtros.fechaHasta}`);
    const url = qs.length ? `${this.baseUrl}?${qs.join('&')}` : this.baseUrl;
    return this.http.get<Reclamo[]>(url, httpOptions);
  }

  obtener(idreclamo: number): Observable<ReclamoDetalle> {
    return this.http.get<ReclamoDetalle>(`${this.baseUrl}/${idreclamo}`, httpOptions);
  }

  catalogo(): Observable<ReclamoCatalogo> {
    return this.http.get<ReclamoCatalogo>(`${this.baseUrl}/catalogo`, httpOptions);
  }

  cambiarEstado(idreclamo: number, payload: CambiarEstadoPayload): Observable<{ idhistorial: number }> {
    return this.http.put<{ idhistorial: number }>(`${this.baseUrl}/${idreclamo}/estado`, payload, httpOptions);
  }
}
