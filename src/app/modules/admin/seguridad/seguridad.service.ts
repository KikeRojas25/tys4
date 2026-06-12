import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from 'app/core/user/user.types';
import { Rol, Pagina, RolMantenimientoPayload } from './seguridad.types';

import { environment } from 'environments/environment';
import { Observable, ReplaySubject, tap } from 'rxjs';

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
export class SeguridadService {
  private baseUrlUser = environment.baseUrl + '/api/Users/';
  private baseUrlRol = environment.baseUrl + '/api/Roles/';
  private _user: ReplaySubject<User> = new ReplaySubject<User>(1);
  private _users: ReplaySubject<User[]> = new ReplaySubject<User[]>(1);

  private _httpClient = inject(HttpClient);

  constructor() { }


get(param?: any): Observable<User[]> {
  const url = param
    ? `${this.baseUrlUser}?param=${encodeURIComponent(param)}`
    : `${this.baseUrlUser}`;

  return this._httpClient.get<User[]>(url).pipe(
    tap((users: User[]) => {
      this._users.next(users);
    })
  );
}

getUser(id: any): Observable<User> {
  return this._httpClient.get<User>(`${this.baseUrlUser}${id}`).pipe(
      tap((user: User) => {
          this._user.next(user); 
      })
  );
}

  updateEquipo(userId: number, idEquipo: number): Observable<any> {
    const body = { userId, idEquipo };
    return this._httpClient.post(`${this.baseUrlUser}update-equipo`, body);
  }
  registerUser(user: User): Observable<any> {
    console.log('para registrar:', user);
    return this._httpClient.post(`${this.baseUrlUser}register`, user);
  }

  updateUser(user: User): Observable<any> {
    console.log('para registrar:', user);
    return this._httpClient.post(`${this.baseUrlUser}update`, user);
  }


  // Método para actualizar el estado del usuario
  updateUserStatus(user: any): Observable<any> {
    return this._httpClient.post(`${this.baseUrlUser}updateestado`, user);
  }

  // Método para actualizar la contraseña del usuario
  updatePassword(user: any): Observable<any> {
    return this._httpClient.post(`${this.baseUrlUser}updatePassword`, user);
  }

  // Método para bloquear/desbloquear usuario (usr_int_bloqueado)
  bloquearUsuario(userId: number, bloqueado: number): Observable<any> {
    return this._httpClient.post(`${this.baseUrlUser}bloquear`, { userId, bloqueado });
  }

  // Método para cambiar la contraseña de un usuario via SP
  cambiarPassword(userId: number, nuevaPassword: string): Observable<any> {
    return this._httpClient.post(`${this.baseUrlUser}cambiar-password`, { userId, nuevaPassword });
  }

  registrarUsuario(dto: { username: string; nombres: string; apellidos: string; email: string; password: string; clientesIds: string[] }): Observable<any> {
    return this._httpClient.post(`${this.baseUrlUser}registrar`, dto);
  }

  actualizarUsuario(dto: { userId: number; nombres: string; apellidos: string; email: string; clientesIds: string[] }): Observable<any> {
    return this._httpClient.post(`${this.baseUrlUser}actualizar`, dto);
  }

  getAllRoles(): Observable<Rol[]> {
    return this._httpClient.get<Rol[]>(`${this.baseUrlRol}`);
  }

  getRolesByUser(userId: number): Observable<number[]> {
    return this._httpClient.get<number[]>(`${this.baseUrlRol}by-user/${userId}`);
  }

  updateRolesUser(userId: number, roleIds: number[]): Observable<any> {
    return this._httpClient.post(`${this.baseUrlRol}update-user`, { userId, roleIds });
  }

  // ==================== Mantenimiento de Roles ====================

  listarRolesMantenimiento(param?: string): Observable<Rol[]> {
    const url = param
      ? `${this.baseUrlRol}mantenimiento?param=${encodeURIComponent(param)}`
      : `${this.baseUrlRol}mantenimiento`;
    return this._httpClient.get<Rol[]>(url);
  }

  registrarRol(payload: RolMantenimientoPayload): Observable<any> {
    return this._httpClient.post(`${this.baseUrlRol}registrar`, payload);
  }

  actualizarRol(payload: RolMantenimientoPayload): Observable<any> {
    return this._httpClient.post(`${this.baseUrlRol}actualizar`, payload);
  }

  toggleActivoRol(rolId: number, activo: boolean): Observable<any> {
    return this._httpClient.post(`${this.baseUrlRol}toggle-activo`, { rolId, activo });
  }

  getPaginasArbol(): Observable<Pagina[]> {
    return this._httpClient.get<Pagina[]>(`${this.baseUrlRol}paginas-arbol`);
  }

  getPaginasPorRol(rolId: number): Observable<number[]> {
    return this._httpClient.get<number[]>(`${this.baseUrlRol}paginas-por-rol/${rolId}`);
  }

  asignarPaginasRol(rolId: number, paginaIds: number[]): Observable<any> {
    return this._httpClient.post(`${this.baseUrlRol}asignar-paginas`, { rolId, paginaIds });
  }

}