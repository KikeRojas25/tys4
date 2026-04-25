import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { LeadTimeRow } from './leadtimes.types';

const httpOptions = {
  headers: new HttpHeaders({
    Authorization: 'Bearer ' + localStorage.getItem('token'),
    'Content-Type': 'application/json',
  }),
};

@Injectable({ providedIn: 'root' })
export class LeadTimeService {
  private _httpClient = inject(HttpClient);
  private baseUrl = environment.baseUrl + '/api/Comercial/leadtime/';

  getComercial(idcliente: number): Observable<LeadTimeRow[]> {
    return this._httpClient.get<LeadTimeRow[]>(
      `${this.baseUrl}comercial?idcliente=${idcliente}`,
      httpOptions
    );
  }

  saveComercial(rows: LeadTimeRow[]): Observable<{ afectados: number }> {
    return this._httpClient.post<{ afectados: number }>(
      `${this.baseUrl}comercial`,
      rows,
      httpOptions
    );
  }

  getOperativo(): Observable<LeadTimeRow[]> {
    return this._httpClient.get<LeadTimeRow[]>(
      `${this.baseUrl}operativo`,
      httpOptions
    );
  }

  saveOperativo(rows: LeadTimeRow[]): Observable<{ afectados: number }> {
    return this._httpClient.post<{ afectados: number }>(
      `${this.baseUrl}operativo`,
      rows,
      httpOptions
    );
  }
}
