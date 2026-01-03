import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from 'environments/environment';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Chofer, Departamento, Distrito, Estacion, InsertarPrecintoRequest, InsertarPrecintoResponse, Precinto, Proveedor, Provincia } from './mantenimiento.types';
import { Cliente, Ubigeo, ValorTabla, ClienteDetalleResult } from '../recepcion/ordentransporte/ordentransporte.types';
import { Tarifa } from './tarifa/tarifa.types';



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
  private baseUrlCliente = environment.baseUrl + '/api/Cliente/';
    private baseUrlTarifa = environment.baseUrl + '/api/tarifa/';

constructor() { }

getValorTabla(TablaId: number): Observable<ValorTabla[]> {
  return this._httpClient.get<ValorTabla[]>(this.baseUrl + 'GetAllValorTabla?TablaId=' + TablaId, httpOptions);
}



get(idcliente : number) : Observable<Cliente> {
  return this._httpClient.get<Cliente>(this.baseUrlCliente +"Get?id=" + idcliente  ,httpOptions)
  };

getClienteDetalle(idCliente: number): Observable<ClienteDetalleResult> {
  return this._httpClient.get<ClienteDetalleResult>(`${this.baseUrlCliente}GetCliente?id=${idCliente}`, httpOptions);
}

getAllClientes(criterio: string, usuarioid : number, esComercial : boolean = false) : Observable<Cliente[]> {
  return this._httpClient.get<Cliente[]>(this.baseUrlCliente +"GetAllClientes?criterio="+ criterio+"&UsuarioId=" + usuarioid + "&esComercial=" + esComercial, httpOptions)
  };

  registrarCliente(model: any){
    return this._httpClient.post(this.baseUrlCliente + 'ClientRegister', model, httpOptions)
    .pipe(map((response: any) => {
       

    }))  
  }

  deleteCliente(id:number) {
    return this._httpClient.delete(this.baseUrlCliente + 'ClientDelete?id=' + id, httpOptions )
    .pipe(map((response: any) => {

    }));
}







getProveedores(criterio: string, tipoid : number): Observable<Proveedor[]> {
  return this._httpClient.get<Proveedor[]>(this.baseUrl +'GetProveedores?criterio=' + criterio + '&tipoid=' +  tipoid   , httpOptions);
}

insertarPrecintos(data: InsertarPrecintoRequest): Observable<InsertarPrecintoResponse> {
  return this._httpClient.post<InsertarPrecintoResponse>(`${this.baseUrl}insertarPrecinto`, data);
}

getPrecintos(): Observable<Precinto[]> {
  return this._httpClient.get<Precinto[]>( `${this.baseUrl}GetPrecintos`, httpOptions);
}


deletePrecinto(id: number): Observable<any> {
  return this._httpClient.delete(`${this.baseUrl}deletePrecinto/${id}`);
}

getVehiculoById(id: number): Observable<any> {
  return this._httpClient.get<any>(`${this.baseUrl}GetVehiculoById/${id}`);
}
actualizarVehiculo(id: number, vehiculo: any): Observable<any> {
  return this._httpClient.put<any>(`${this.baseUrl}ActualizarVehiculo/${id}`, vehiculo);
}

guardarVehiculo(vehiculo: any): Observable<any> {
  return this._httpClient.post<any>(`${this.baseUrl}RegistrarVehiculo`, vehiculo).pipe(
    catchError(err => {
      console.error('Error desde el servicio:', err);
      return throwError(() => err);
    })
  );
}



GetAllVehiculos(model: any): Observable<any[]> {

  if (model.IdProveedor === undefined || model.IdProveedor === null) {
    model.IdProveedor = '';
  }
  if (model.placa === undefined) {
    model.placa = '';
  }



  const params = new HttpParams()
  .set('placa', model.placa)
  .set('IdProveedor', model.IdProveedor);
  const url = `${this.baseUrl}GetAllVehiculo?placa=${encodeURIComponent(model.placa)}&IdProveedor=${encodeURIComponent(model.IdProveedor)}`;

  return this._httpClient.get<any[]>(url, httpOptions);
}


eliminarVehiculo(id: number): Observable<any> {
  return this._httpClient.delete(`${this.baseUrl}EliminarVehiculo/${id}`);
}


GetAllChoferes(): Observable<Chofer[]> {
  return this._httpClient.get<Chofer[]>(this.baseUrl +'GetAllConductor' , httpOptions);
}
registrar_chofer(model: any) {
  return this._httpClient.post(this.baseUrl + 'RegistrarConductor', model, httpOptions);
}
getChoferById(id: number): Observable<Chofer> {
  return this._httpClient.get<Chofer>(`${this.baseUrl}GetChofer/${id}`);
}
editar_chofer(model: any) {
  return this._httpClient.put(`${this.baseUrl}ActualizarChofer/${model.idchofer}`, model, httpOptions);
}

  getProvincias(): Observable<Provincia[]> {
    return this._httpClient.get<Provincia[]>(`${this.baseUrl}GetProvincias`, httpOptions);
  }

  getDepartamentos(): Observable<Departamento[]> {
    return this._httpClient.get<Departamento[]>(`${this.baseUrl}GetDepartamentos`, httpOptions);
  }

  getProvinciasByDepartamento(iddepartamento: number): Observable<Provincia[]> {
    return this._httpClient.get<Provincia[]>(`${this.baseUrl}GetProvinciasByDepartamento/${iddepartamento}`, httpOptions);
  }

  getDistritosByProvincia(idprovincia: number): Observable<Distrito[]> {
    return this._httpClient.get<Distrito[]>(`${this.baseUrl}GetDistritosByProvincia/${idprovincia}`, httpOptions);
  }

  // Métodos para Estaciones
  getAllEstaciones(criterio: string): Observable<Estacion[]> {
    return this._httpClient.get<Estacion[]>(this.baseUrl + 'GetAllEstaciones?criterio=' + criterio, httpOptions);
  }

  getEstacionById(id: number): Observable<Estacion> {
    return this._httpClient.get<Estacion>(this.baseUrl + 'GetEstacion/' + id, httpOptions);
  }

  registrarEstacion(model: any): Observable<any> {
    return this._httpClient.post(this.baseUrl + 'RegistrarEstacion', model, httpOptions)
      .pipe(map((response: any) => {
        return response;
      }));
  }

  actualizarEstacion(id: number, model: any): Observable<any> {
    return this._httpClient.put(this.baseUrl + 'EstacionUpdate?id=' + id, model, httpOptions)
      .pipe(map((response: any) => {
        return response;
      }));
  }

  eliminarEstacion(id: number): Observable<any> {
    return this._httpClient.delete(this.baseUrl + 'EliminarEstacion/' + id, httpOptions)
      .pipe(map((response: any) => {
        return response;
      }));
  }

  inhabilitarEstacion(id: number): Observable<any> {
    return this._httpClient.put(this.baseUrl + 'EstacionInhabilitar?id=' + id, {}, httpOptions)
      .pipe(map((response: any) => {
        return response;
      }));
  }

  getUbigeo(criterio: string): Observable<Ubigeo[]> {
    return this._httpClient.get<Ubigeo[]>(this.baseUrl + 'GetListUbigeo?criterio=' + criterio, httpOptions);
  }




  obtenerTarifasPorCliente(
    idCliente: number,
    idorigendepartamento?: number,
    idorigenprovincia?: number,
    idorigendistrito?: number,
    iddepartamentodestino?: number,
    idprovinciadestino?: number,
    iddistritodestino?: number,
    idtipotransporte?: number
  ): Observable<Tarifa[]> {
    let params = new HttpParams();
    if (idorigendepartamento) params = params.set('idorigendepartamento', idorigendepartamento.toString());
    if (idorigenprovincia) params = params.set('idorigenprovincia', idorigenprovincia.toString());
    if (idorigendistrito) params = params.set('idorigendistrito', idorigendistrito.toString());
    if (iddepartamentodestino) params = params.set('iddepartamentodestino', iddepartamentodestino.toString());
    if (idprovinciadestino) params = params.set('idprovinciadestino', idprovinciadestino.toString());
    if (iddistritodestino) params = params.set('iddistritodestino', iddistritodestino.toString());
    if (idtipotransporte) params = params.set('idtipotransporte', idtipotransporte.toString());
    
    return this._httpClient.get<Tarifa[]>(`${this.baseUrlTarifa}cliente/${idCliente}/filtrado`, {
      headers: httpOptions.headers,
      params: params
    });
  }

  obtenerTarifaPorId(idTarifa: number): Observable<Tarifa> {
    return this._httpClient.get<Tarifa>(`${this.baseUrlTarifa}/${idTarifa}`, httpOptions);
  }

  obtenerTarifasMismoOrigenDestino(idTarifa: number): Observable<Tarifa[]> {
    return this._httpClient.get<Tarifa[]>(`${this.baseUrlTarifa}${idTarifa}/mismo-origen-destino`, httpOptions);
  }

  crearTarifa(tarifa: Tarifa): Observable<Tarifa> {
    return this._httpClient.post<Tarifa>(this.baseUrlTarifa, tarifa, httpOptions);
  }

  actualizarTarifa(idTarifa: number, tarifa: Tarifa): Observable<Tarifa> {
    return this._httpClient.put<Tarifa>(`${this.baseUrlTarifa}${idTarifa}`, tarifa, httpOptions);
  }

  eliminarTarifa(idTarifa: number): Observable<void> {
    return this._httpClient.delete<void>(`${this.baseUrlTarifa}/${idTarifa}`, httpOptions);
  }

  copiarTarifas(idClienteOrigen: number, idClienteDestino: number): Observable<void> {
    return this._httpClient.post<void>(`${this.baseUrlTarifa}/copiar`, {
      idClienteOrigen,
      idClienteDestino
    }, httpOptions);
  }

  getFormulas(): Observable<any[]> {
    return this._httpClient.get<any[]>(`${this.baseUrl}GetFormulas`, httpOptions);
  }
}