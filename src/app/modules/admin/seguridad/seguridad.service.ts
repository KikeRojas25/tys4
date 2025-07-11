import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from 'app/core/user/user.types';

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


  get(): Observable<User[]> {
    return this._httpClient.get<User[]>(`${this.baseUrlUser}`).pipe(
        tap((users: User[]) => {
            this._users.next(users);  
        })
    );
}

getUser(id: any): Observable<User> {
  return this._httpClient.get<User>(`${this.baseUrlUser} ${id}`).pipe(
      tap((user: User) => {
          this._user.next(user); 
      })
  );
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

  // getRolesByUser(user: any): Observable<any> {
  //   return this._httpClient.get<Rol>(`${this.baseUrlRol}getallroles?UserId=${user}` , user);
  // }
  // getRoles(user: any): Observable<any> {
  //   return this._httpClient.get<Rol>(`${this.baseUrlRol}` , user);
  // }


}