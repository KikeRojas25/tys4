import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { UserService } from 'app/core/user/user.service';
import { environment } from 'environments/environment';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Chofer, Cliente, Concepto, Documento, Formula, HojaRuta, OperacionCarga, OrdenTrabajoResumen, OrdenTransporte, Ubigeo, ValorTabla, Vehiculo } from './ordentransporte.types';
import { Manifiesto } from '../../trafico/trafico.types';


const httpOptions = {
  headers: new HttpHeaders({
    Authorization : 'Bearer ' + localStorage.getItem('token'),
    'Content-Type' : 'application/json'
  })
  // , observe: 'body', reportProgress: true };
};



const httpOptionsUpload = {
  headers: new HttpHeaders({
    Authorization : 'Bearer ' + localStorage.getItem('token'),
  })
  // , observe: 'body', reportProgress: true };
};





@Injectable({
  providedIn: 'root'
})
export class OrdenTransporteService {

  private _authenticated: boolean = false;
  private _httpClient = inject(HttpClient);
  private _userService = inject(UserService);
  public jwtHelper = new JwtHelperService();
  private decodedToken: any;


  private baseUrl = environment.baseUrl + '/api/Trafico/';
  private baseMantenimientoUrl = environment.baseUrl + '/api/Mantenimiento/';
  private baseUrlCliente = environment.baseUrl + '/api/Cliente/';
  private baseUrlOrden = environment.baseUrl + '/api/Orden/';
  private baseUrlPlanning = environment.baseUrl + '/api/Planning/';



constructor() { }

private handleError(error: HttpErrorResponse) {
  console.error('Error occurred:', error);
  return throwError(() => new Error('Ocurrió un error.'));
}


getUbigeo(criterio): Observable<Ubigeo[]> {
  return this._httpClient.get<Ubigeo[]>(`${this.baseMantenimientoUrl}GetListUbigeo?criterio=${criterio}`  , httpOptions);
}
getClientes(criterio: any): Observable<Cliente[]> {
  if (criterio === undefined) {
    criterio = '';
  }
  return this._httpClient.get<Cliente[]>(`${this.baseUrlCliente}GetAllClients?idscliente=${criterio}`   , httpOptions);
}
getValorTabla(TablaId: number): Observable<ValorTabla[]> {
  return this._httpClient.get<ValorTabla[]>(`${this.baseMantenimientoUrl}GetAllValorTabla?TablaId=${TablaId}` , httpOptions);
}



getVehiculos(placa: string) {
   return this._httpClient.get<Vehiculo[]>(`${this.baseMantenimientoUrl}GetVehiculos?placa=${placa}`, httpOptions);
}
getChoferes(criterio: string): Observable<Chofer[]> {
  return this._httpClient.get<Chofer[]>(`${this.baseMantenimientoUrl}GetChofer?criterio=${criterio}` , httpOptions);
}


getFormulas(idCliente: number ,idOrigen: number, idDestino: number): Observable<Formula[]> {
  return this._httpClient.get<Formula[]>(`${this.baseUrlOrden}GetFormulaTarifa?idcliente=${idCliente}&idorigen=${idOrigen}&iddestino=${idDestino}` , httpOptions);
}

getConceptos(idCliente: number ,idOrigen: number, idDestino: number, idFormula: number, idTipoTransporte:number): Observable<Concepto[]> {
  return this._httpClient.get<Concepto[]>(`${this.baseUrlOrden}ObtenerConceptosTarifa?idcliente=${idCliente}&idorigen=${idOrigen}&iddestino=${idDestino}&idtipotransporte=${idTipoTransporte}&idformula=${idFormula}`
     , httpOptions);
}


getAllOrder(model: any) {

  if (model.idcliente  === 0 || model.idcliente === undefined) {
    model.idcliente = '';
  }

  if (model.idestado  === '0') {
    model.idestado = '';
  }

  let params = new HttpParams()
    .set('idcliente', model.idcliente.toString())
    .set('fecinicio', model.fecinicio.toLocaleDateString()) // Usar un formato estándar de fecha
    .set('fecfin', model.fecfin.toLocaleDateString())       // Misma consideración para la fecha final
    .set('idestado', model.idestado.toString())
    .set('numcp', model.numcp.toString())
    .set('referencia', model.referencia)
    .set('nummanifiesto', model.nummanifiesto.toString())
    .set('numhojaruta', model.numhojaruta.toString())
    .set('idusuario', model.idusuario.toString())
    .set('tipoorden', model.tipoorden.toString());

    return this._httpClient.get<OrdenTransporte[]>(`${this.baseUrlOrden}GetAllOrder`, { params, ...httpOptions })
    .pipe(
      // Manejo de errores
      catchError(this.handleError)
    );
}

getEventos(idordentransporte:number): Observable<any[]> {
  return this._httpClient.get<any[]>(`${this.baseUrlOrden}getAllEventosxOt?idOrden=${idordentransporte}`,httpOptions );
}
GetAllCargasTemporal (tipo: number) {
  return this._httpClient.get<OperacionCarga[]>(this.baseUrlOrden + 'GetAllCargasTemporal?tipooperacioncarga=' + tipo   , httpOptions);
}
GetAllOrdersCargasTemporal (id: number){
  return this._httpClient.get<OrdenTransporte[]>(this.baseUrlOrden + 'GetAllOrdersCargasTemporal?idcarga=' + id   , httpOptions);
 }

 DesAsignarProvinciaCarga(idordentrabajo: number) {
  let  model: any  = {};
  model.idordentrabajo = idordentrabajo;
  return this._httpClient.post<OrdenTransporte[]>(this.baseUrl + 'DesAsignarProvinciaCarga?', model , httpOptions);
}s
actualizarOrden(model: any) {
  return this._httpClient.post(this.baseUrl + 'UpdateOrden', model, httpOptions)
  .pipe(map((response: any) => {

  })
  );
}

 getHojasRuta(idestacion: number) : Observable<HojaRuta[]> {
  return this._httpClient.get<HojaRuta[]>(this.baseUrlOrden + 'getAllPreHojasRuta?idestacion=' + idestacion   , httpOptions);
 }

 saveConfirm(model: any) {

  return this._httpClient.post(this.baseUrl + 'saveConfirm', model, httpOptions)
  .pipe(
    map((response: any) => {
    }
  )
);
}



unConfirm(model: any) {

      return this._httpClient.post(this.baseUrl + 'DesconfirmarEntrega', model, httpOptions)
      .pipe(
        map((response: any) => {
        }
      )
);
}



 confirmar_entrega(model: any) {

  return this._httpClient.post(this.baseUrl + 'ConfirmarEntregav2', model, httpOptions)
  .pipe(
    map((response: any) => {
    }
  )
);
}


agregarVisitaDespacho(command: any): Observable<any> {
  return this._httpClient.post(`${this.baseUrl}AgregarVisitaDespacho`, command);
}



eliminar(model: any): Observable<OrdenTransporte> {
  return this._httpClient.post<OrdenTransporte>(this.baseUrlOrden + 'DeleteOrdenTransporte', model, httpOptions);
}





GetOrdenTransporteByNumero(numcp: string) : Observable<OrdenTransporte> {
  return this._httpClient.get<OrdenTransporte>(this.baseUrlOrden + 'GetOrdenTransporteByNumero?numcp=' + numcp   , httpOptions).pipe(
    catchError((error) => {
      // Verifica si el error es un 404 y extrae el mensaje del backend
      if (error.status === 404 && error.error?.message) {
        return throwError(() => new Error(error.error.message));
      }
      // Para otros errores
      return throwError(() => new Error('Error al buscar la orden de transporte'));
    })
  );

}

registrarOTR(model: any): Observable<OrdenTransporte> {
  return this._httpClient.post<OrdenTransporte>(`${this.baseUrl}registerOTR`, model, httpOptions);
}



 registrarOT(model: any): Observable<OrdenTransporte> {
  return this._httpClient.post<OrdenTransporte>(`${this.baseUrlOrden}registerOT`, model, httpOptions);
}

actualizarOTR(model: any): Observable<OrdenTransporte> {
  return this._httpClient.post<OrdenTransporte>(`${this.baseUrl}updateOTR`, model, httpOptions);
}
GetAllOrdersDetailDistrito(idestacionorigen: number, model: any) {
  return this._httpClient.get<OrdenTransporte[]>(this.baseUrlOrden + 'GetAllOrdersDetailDistrito?idestacionorigen=' + idestacionorigen + '&iddistrito=' + model.id
 + '&fecini=' + model.fechainicio + '&fecfin=' + model.fechafin , httpOptions);
}
GetAllCargasTemporalTrafico (tipo: number) {
  return this._httpClient.get<OperacionCarga[]>(this.baseUrlOrden + 'GetAllCargasTemporalTrafico?tipooperacioncarga=' + tipo   , httpOptions);
}

calcularPrecio(model: any): Observable<OrdenTransporte> {
  return this._httpClient.post<OrdenTransporte>(`${this.baseUrlOrden}calcularPrecio`, model, httpOptions);
}

generarManifiesto(model: any): Observable<Manifiesto> {
  return this._httpClient.post<Manifiesto>(`${this.baseUrlOrden}GenerarManifiestoVirtual`, model, httpOptions);
}

getOrden(idordentrabajo: any): Observable<any>  {
  return this._httpClient.get<any>(`${this.baseUrlOrden}GetOrden?id=${idordentrabajo}` , httpOptions);
}
confirmarDespacho(model: any) {
  return this._httpClient.post(this.baseUrlPlanning + 'ConfirmarDespacho', model, httpOptions);
}

uploadFile(file: File, UserId: number, ClienteId: number) : any {

  ClienteId = 11200;

  const formData = new FormData();
  formData.append('file', file);

  
  return this._httpClient.post(this.baseUrlOrden + 'UploadFile?usrid=' + UserId.toString() + '&idcliente=' + ClienteId
 , formData
 , httpOptionsUpload
);
}

procesarCargaMasiva(idcarga: any) {

  let  model: any  = {};
  model.cargaid = idcarga;
  return this._httpClient.post(this.baseUrlOrden + 'procesarCargaMasiva', model , httpOptions);

}
recepcionarOT(model : any) {
  return this._httpClient.post(this.baseUrlOrden + 'recepcionarOT', model, httpOptions);
}

getAllOrdersForDespacho(numhojaruta: string) {
  return this._httpClient.get<OrdenTransporte[]>(this.baseUrlOrden + 'getAllOrdersForDespacho?numhojaruta='  + numhojaruta, httpOptions);
}
confirmarEstibaxOTs (ots: any[]) {
  console.log(ots);
  return this._httpClient.post<OrdenTransporte>(this.baseUrlOrden + 'confirmarEstibaxOTs' , ots ,httpOptions);
}
getAllOrdersForDespachoAll(numhojaruta: string , IdTipo: number) {
  return this._httpClient.get<OrdenTransporte[]>(this.baseUrlOrden + 'getAllOrdersForDespachoAll?numhojaruta='  + numhojaruta
    + '&IdTipo=' + IdTipo, httpOptions);
}

uploadFileSite(formData: FormData, orden_id: number) {

  console.log(orden_id);


  return this._httpClient.post(this.baseUrlOrden + 'UploadPhoto?idOrden=' + orden_id
  , formData
  , httpOptionsUpload
   );
 }
 getAllDocumentos(id: number): Observable<Documento[]> {
  const params = '?Id=' + id ;
  return this._httpClient.get<Documento[]>(this.baseUrlOrden + 'getAllDocumentos' + params, httpOptions);
}

AsignarOtsCarga(idprovincia: string, idcarga: number) {
  let  model: any  = {};
  model.idsots = idprovincia;
  model.idcarga = idcarga;
  return this._httpClient.post<OrdenTransporte[]>(this.baseUrlOrden + 'AsignarOtCarga?', model , httpOptions);
}


  obtenerResumenPorClienteYOrigen(clienteId: number, origenId: number): Observable<OrdenTrabajoResumen[]> {
    return this._httpClient.get<OrdenTrabajoResumen[]>(`${this.baseUrlOrden}por-cliente-origen`, {
      params: {
        clienteId: clienteId.toString(),
        origenId: origenId.toString()
      }
    });
  }

}
