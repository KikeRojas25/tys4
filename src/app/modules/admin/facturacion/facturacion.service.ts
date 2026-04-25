import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable, ReplaySubject, tap } from 'rxjs';
import { Factura, PendientePreliquidacion, ListarPreliquidacionResult, PreliquidacionDetalle, OrdenPreliquidacion, AgregarCargoRequest, OrdenTrabajoRecargoUpdateDto, OrdenTrabajoPreliquidacionResult, ComprobanteForCreateDto, ComprobanteResult, ComprobanteConDetallesResult, DocumentoResult, DocumentoForCreateDto, DocumentoForUpdateDto } from './facturacion.types';

const httpOptions = {
  headers: new HttpHeaders({
    Authorization : 'Bearer ' + localStorage.getItem('token'),
    'Content-Type' : 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class FacturacionService {
  private baseUrl = environment.baseUrl + '/api/Facturacion/';
  private _factura: ReplaySubject<Factura> = new ReplaySubject<Factura>(1);
  private _facturas: ReplaySubject<Factura[]> = new ReplaySubject<Factura[]>(1);

  private _httpClient = inject(HttpClient);

  constructor() { }

  // Obtener todas las facturas
  getAll(param?: any): Observable<Factura[]> {
    const url = param
      ? `${this.baseUrl}?param=${encodeURIComponent(param)}`
      : `${this.baseUrl}`;

    return this._httpClient.get<Factura[]>(url, httpOptions).pipe(
      tap((facturas: Factura[]) => {
        this._facturas.next(facturas);
      })
    );
  }

  // Obtener factura por ID
  getById(id: number): Observable<Factura> {
    return this._httpClient.get<Factura>(`${this.baseUrl}${id}`, httpOptions).pipe(
      tap((factura: Factura) => {
        this._factura.next(factura);
      })
    );
  }

  // Obtener factura por número
  getByNumero(numero: string): Observable<Factura> {
    return this._httpClient.get<Factura>(`${this.baseUrl}GetByNumero?numero=${numero}`, httpOptions);
  }

  // Crear nueva factura
  create(factura: Factura): Observable<any> {
    return this._httpClient.post(`${this.baseUrl}Create`, factura, httpOptions);
  }

  // Actualizar factura
  update(factura: Factura): Observable<any> {
    return this._httpClient.post(`${this.baseUrl}Update`, factura, httpOptions);
  }

  // Anular factura
  anular(id: number): Observable<any> {
    const model = { id };
    return this._httpClient.post(`${this.baseUrl}Anular`, model, httpOptions);
  }

  // Obtener facturas pendientes
  getPendientes(): Observable<Factura[]> {
    return this._httpClient.get<Factura[]>(`${this.baseUrl}GetPendientes`, httpOptions);
  }

  // Obtener facturas por rango de fechas
  getByFechas(fechaInicio: string, fechaFin: string): Observable<Factura[]> {
    const params = `?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
    return this._httpClient.get<Factura[]>(`${this.baseUrl}GetByFechas${params}`, httpOptions);
  }

  // Obtener facturas por cliente
  getByCliente(idCliente: number): Observable<Factura[]> {
    return this._httpClient.get<Factura[]>(`${this.baseUrl}GetByCliente?idCliente=${idCliente}`, httpOptions);
  }

  // Generar PDF de factura
  generarPDF(id: number): Observable<Blob> {
    return this._httpClient.get(`${this.baseUrl}GenerarPDF?id=${id}`, {
      headers: httpOptions.headers,
      responseType: 'blob'
    });
  }

  // Obtener pendientes de preliquidación
  getListarPendientePreliquidacion(idcliente?: number, iddestino?: number, numcp?: string): Observable<PendientePreliquidacion[]> {
    let params = '';
    const paramsList: string[] = [];

    if (idcliente !== undefined && idcliente !== null) {
      paramsList.push(`idcliente=${idcliente}`);
    }
    if (iddestino !== undefined && iddestino !== null) {
      paramsList.push(`iddestino=${iddestino}`);
    }
    if (numcp) {
      paramsList.push(`numcp=${encodeURIComponent(numcp)}`);
    }

    if (paramsList.length > 0) {
      params = '?' + paramsList.join('&');
    }

    return this._httpClient.get<PendientePreliquidacion[]>(`${this.baseUrl}ListarPendientePreliquidacion${params}`, httpOptions);
  }

  // Generar preliquidación
  generarpreliquidacion(
    idCliente: number,
    idsOrdenTrabajo: number[],
    fechaEmision: Date,
    idUsuarioRegistro: number,
    fechaInicio?: Date,
    fechaFin?: Date,
    observaciones?: string,
    mesPreliquidacion?: number,
    anioPreliquidacion?: number
  ): Observable<any> {
    const preliquidacion = {
      IdCliente: idCliente,
      FechaEmision: fechaEmision,
      FechaInicio: fechaInicio,
      FechaFin: fechaFin,
      Observaciones: observaciones,
      MesPreliquidacion: mesPreliquidacion,
      AnioPreliquidacion: anioPreliquidacion,
      IdUsuarioRegistro: idUsuarioRegistro,
      IdsOrdenTrabajo: idsOrdenTrabajo
    };

    return this._httpClient.post(`${this.baseUrl}CreatePreliquidacion`, preliquidacion, httpOptions);
  }

  // Listar preliquidaciones
  listarPreliquidacion(
    idestado?: number,
    numerocomprobante?: string,
    idtipocomprobante?: number,
    idcliente?: number,
    numeroliquidacion?: string,
    fecharegistroinicio?: string,
    fecharegistrofin?: string
  ): Observable<ListarPreliquidacionResult[]> {
    let params = '';
    const paramsList: string[] = [];

    if (idestado !== undefined && idestado !== null) {
      paramsList.push(`idestado=${idestado}`);
    }
    if (numerocomprobante) {
      paramsList.push(`numerocomprobante=${encodeURIComponent(numerocomprobante)}`);
    }
    if (idtipocomprobante !== undefined && idtipocomprobante !== null) {
      paramsList.push(`idtipocomprobante=${idtipocomprobante}`);
    }
    if (idcliente !== undefined && idcliente !== null) {
      paramsList.push(`idcliente=${idcliente}`);
    }
    if (numeroliquidacion) {
      paramsList.push(`numeroliquidacion=${encodeURIComponent(numeroliquidacion)}`);
    }
    if (fecharegistroinicio) {
      paramsList.push(`fecharegistroinicio=${fecharegistroinicio}`);
    }
    if (fecharegistrofin) {
      paramsList.push(`fecharegistrofin=${fecharegistrofin}`);
    }

    if (paramsList.length > 0) {
      params = '?' + paramsList.join('&');
    }

    return this._httpClient.get<ListarPreliquidacionResult[]>(`${this.baseUrl}ListarPreliquidacion${params}`, httpOptions);
  }

  // Obtener detalle de preliquidación con órdenes asociadas
  getPreliquidacionDetalle(idpreliquidacion: number): Observable<PreliquidacionDetalle> {
    return this._httpClient.get<PreliquidacionDetalle>(`${this.baseUrl}ListarOrdenTrabajoPreliquidacion/${idpreliquidacion}`, httpOptions);
  }

  // Eliminar órdenes de preliquidación (nuevo endpoint que acepta lista)
  eliminarOrdenesDePreliquidacion(idpreliquidacion: number, idsOrdenTrabajo: number[]): Observable<any> {
    return this._httpClient.post(`${this.baseUrl}EliminarOrdenesPreliquidacion/${idpreliquidacion}`, idsOrdenTrabajo, httpOptions);
  }

  // Agregar órdenes a preliquidación (nuevo endpoint)
  agregarOrdenesAPreliquidacion(idpreliquidacion: number, idsOrdenTrabajo: number[]): Observable<any> {
    return this._httpClient.post(`${this.baseUrl}AgregarOrdenesPreliquidacion/${idpreliquidacion}`, idsOrdenTrabajo, httpOptions);
  }

  // Método legacy para eliminar una sola orden (mantener compatibilidad)
  eliminarOrdenDePreliquidacion(idpreliquidacion: number, idordentrabajo: number): Observable<any> {
    return this.eliminarOrdenesDePreliquidacion(idpreliquidacion, [idordentrabajo]);
  }

  // Agregar cargo a orden
  agregarCargoAOrden(request: AgregarCargoRequest): Observable<any> {
    return this._httpClient.post(`${this.baseUrl}AgregarCargoOrden`, request, httpOptions);
  }

  /** PUT api/Facturacion/ActualizarRecargoOrdenTrabajo — body: IdOrdenTrabajo, Recargo */
  actualizarRecargoOrdenTrabajo(dto: OrdenTrabajoRecargoUpdateDto): Observable<any> {
    return this._httpClient.put(`${this.baseUrl}ActualizarRecargoOrdenTrabajo`, dto, httpOptions);
  }

  // Actualizar preliquidación
  actualizarPreliquidacion(preliquidacion: PreliquidacionDetalle): Observable<any> {
    return this._httpClient.post(`${this.baseUrl}ActualizarPreliquidacion`, preliquidacion, httpOptions);
  }

  // Crear comprobante
  createComprobante(comprobante: ComprobanteForCreateDto): Observable<any> {
    return this._httpClient.post(`${this.baseUrl}CreateComprobante`, comprobante, httpOptions);
  }

  // Listar órdenes de trabajo de preliquidación
  listarOrdenTrabajoPreliquidacion(idpreliquidacion: number): Observable<OrdenTrabajoPreliquidacionResult[]> {
    return this._httpClient.get<OrdenTrabajoPreliquidacionResult[]>(`${this.baseUrl}ListarOrdenTrabajoPreliquidacion/${idpreliquidacion}`, httpOptions);
  }

  // Listar comprobantes
  listarComprobantes(idcliente?: number, idestado?: number, fechainicio?: Date, fechafin?: Date): Observable<ComprobanteResult[]> {
    const paramsList: string[] = [];
    if (idcliente !== null && idcliente !== undefined) {
      paramsList.push(`idcliente=${idcliente}`);
    }
    if (idestado !== null && idestado !== undefined) {
      paramsList.push(`idestado=${idestado}`);
    }
    if (fechainicio) {
      paramsList.push(`fechainicio=${fechainicio.toISOString().split('T')[0]}`);
    }
    if (fechafin) {
      paramsList.push(`fechafin=${fechafin.toISOString().split('T')[0]}`);
    }
    const params = paramsList.length > 0 ? '?' + paramsList.join('&') : '';
    return this._httpClient.get<ComprobanteResult[]>(`${this.baseUrl}ListarComprobantes${params}`, httpOptions);
  }

  // Eliminar comprobante
  deleteComprobante(id: number): Observable<any> {
    return this._httpClient.delete(`${this.baseUrl}DeleteComprobante/${id}`, httpOptions);
  }

  // Obtener comprobante con detalles
  getComprobante(id: number): Observable<ComprobanteConDetallesResult> {
    return this._httpClient.get<ComprobanteConDetallesResult>(`${this.baseUrl}GetComprobante/${id}`, httpOptions);
  }

  getDocumentos(idtipocomprobante: number): Observable<any[]> {
    return this._httpClient.get<any[]>(
      `${this.baseUrl}GetDocumentos?idtipocomprobante=${idtipocomprobante}`,
      httpOptions
    );
  }

  getSiguienteNumeroDocumento(idtipocomprobante: number, serie: string): Observable<{ siguienteNumero: string }> {
    return this._httpClient.get<{ siguienteNumero: string }>(
      `${this.baseUrl}GetSiguienteNumeroDocumento?idtipocomprobante=${idtipocomprobante}&serie=${encodeURIComponent(serie)}`,
      httpOptions
    );
  }

  eliminarPreliquidacion(id: number, idusuario: number): Observable<any> {
    return this._httpClient.delete(
      `${this.baseUrl}DeletePreliquidacion/${id}?idusuario=${idusuario}`,
      httpOptions
    );
  }

  // CRUD Documentos
  listarDocumentos(idtipocomprobante?: number, idestacion?: number): Observable<DocumentoResult[]> {
    const params: string[] = [];
    if (idtipocomprobante != null) params.push(`idtipocomprobante=${idtipocomprobante}`);
    if (idestacion != null) params.push(`idestacion=${idestacion}`);
    const qs = params.length ? '?' + params.join('&') : '';
    return this._httpClient.get<DocumentoResult[]>(`${this.baseUrl}ListarDocumentos${qs}`, httpOptions);
  }

  createDocumento(dto: DocumentoForCreateDto): Observable<any> {
    return this._httpClient.post(`${this.baseUrl}CreateDocumento`, dto, httpOptions);
  }

  updateDocumento(dto: DocumentoForUpdateDto): Observable<any> {
    return this._httpClient.put(`${this.baseUrl}UpdateDocumento`, dto, httpOptions);
  }

  deleteDocumento(id: number): Observable<any> {
    return this._httpClient.delete(`${this.baseUrl}DeleteDocumento/${id}`, httpOptions);
  }
}
