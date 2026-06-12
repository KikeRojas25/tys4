import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { PerfilBot, UserBot } from './usersbot.types';

const httpOptions = {
  headers: new HttpHeaders({
    Authorization: 'Bearer ' + localStorage.getItem('token'),
    'Content-Type': 'application/json'
  })
};

@Injectable({ providedIn: 'root' })
export class UsersBotService {
  private _http = inject(HttpClient);
  private baseUrl = environment.baseUrl + '/api/UserBot';

  getAll(criterio: string = '', idperfil?: number | null): Observable<UserBot[]> {
    let params = new HttpParams().set('criterio', criterio ?? '');
    if (idperfil != null) {
      params = params.set('idperfil', idperfil.toString());
    }
    return this._http.get<UserBot[]>(this.baseUrl, { ...httpOptions, params });
  }

  getById(id: number): Observable<UserBot> {
    return this._http.get<UserBot>(`${this.baseUrl}/${id}`, httpOptions);
  }

  getPerfiles(): Observable<PerfilBot[]> {
    return this._http.get<PerfilBot[]>(`${this.baseUrl}/perfiles`, httpOptions);
  }

  create(model: UserBot): Observable<any> {
    return this._http.post(this.baseUrl, model, httpOptions);
  }

  update(id: number, model: UserBot): Observable<any> {
    return this._http.put(`${this.baseUrl}/${id}`, model, httpOptions);
  }

  delete(id: number): Observable<any> {
    return this._http.delete(`${this.baseUrl}/${id}`, httpOptions);
  }
}
