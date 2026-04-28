import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { IntegradoComercialPorClienteResult, IntegradoSemaforoPorClienteResult, SemaforoIntegradoDetalleResult } from '../recojo/recojo.types';
import { LeadTime } from './leadtimes/leadtimes.types';

const httpOptions = {
  headers: new HttpHeaders({
    Authorization: 'Bearer ' + localStorage.getItem('token'),
    'Content-Type': 'application/json',
  }),
};

export interface OrdenTrabajoDetallePorClienteEstadoResult {
  idordentrabajo?: number;
  numcp?: string;
  idestado?: number;
  peso?: number;
  bulto?: number;
  fecharegistro?: string;
  idestacion?: number;
  estacion?: string;
  idmanifiesto?: number;
  idtipooperacion?: number;
  observada?: number;
  destino_distrito?: string;
  destino_provincia?: string;
  destino_departamento?: string;
  estado?: string;
  cliente?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ComercialService {
  private _httpClient = inject(HttpClient);
  private baseUrl = environment.baseUrl + '/api/Comercial/';

  getIntegradoComercialPorCliente(idusuario: number, idequipo?: number | null): Observable<IntegradoComercialPorClienteResult[]> {
    let params = `idusuario=${idusuario}`;
    if (idequipo != null && idequipo !== undefined) {
      params += `&idequipo=${idequipo}`;
    }
    return this._httpClient.get<IntegradoComercialPorClienteResult[]>(
      `${this.baseUrl}integrado-por-cliente?${params}`,
      httpOptions
    );
  }

  getIntegradoSemaforoPorCliente(
    idusuario?: number | null,
    idequipo?:  number | null,
    fechaDesde?: string | null,
    fechaHasta?: string | null,
    idcliente?:  number | null
  ): Observable<IntegradoSemaforoPorClienteResult[]> {
    const params: string[] = [];
    if (fechaDesde) params.push(`fechaDesde=${fechaDesde}`);
    if (fechaHasta) params.push(`fechaHasta=${fechaHasta}`);
    if (idcliente != null) params.push(`idcliente=${idcliente}`);
    const qs = params.length ? `?${params.join('&')}` : '';
    return this._httpClient.get<IntegradoSemaforoPorClienteResult[]>(
      `${this.baseUrl}integrado-semaforo${qs}`,
      httpOptions
    );
  }

  getSemaforoIntegradoDetalle(
    idcliente: number,
    tipo: 'atiempo' | 'porvencer' | 'fueratiempo',
    fechaDesde?: string | null,
    fechaHasta?: string | null
  ): Observable<SemaforoIntegradoDetalleResult[]> {
    const params: string[] = [`idcliente=${idcliente}`, `tipo=${tipo}`];
    if (fechaDesde) params.push(`fechaDesde=${fechaDesde}`);
    if (fechaHasta) params.push(`fechaHasta=${fechaHasta}`);
    return this._httpClient.get<SemaforoIntegradoDetalleResult[]>(
      `${this.baseUrl}integrado-semaforo/detalle?${params.join('&')}`,
      httpOptions
    );
  }

  getOrdenesDetallePorClienteEstado(idcliente: number, estados: number | number[]): Observable<OrdenTrabajoDetallePorClienteEstadoResult[]> {
    const estadosParam = Array.isArray(estados) ? estados.join(',') : estados.toString();
    return this._httpClient.get<OrdenTrabajoDetallePorClienteEstadoResult[]>(
      `${this.baseUrl}ordenes-por-cliente-estado?idcliente=${idcliente}&estados=${estadosParam}`,
      httpOptions
    );
  }

  // Lead Times - Mock hasta que exista backend
  private _leadTimesMock = new BehaviorSubject<LeadTime[]>([
    { id: 1, idCliente: 1, cliente: 'EDICIONES COREFO S.A.C.', idOrigenDepartamento: 15, idOrigenProvincia: 1, origenProvincia: 'Lima', idDestinoDepartamento: 15, idDestinoProvincia: 2, destinoProvincia: 'Huacho', horas: 8 },
    { id: 2, idCliente: 1, cliente: 'EDICIONES COREFO S.A.C.', idOrigenDepartamento: 15, idOrigenProvincia: 1, origenProvincia: 'Lima', idDestinoDepartamento: 20, idDestinoProvincia: 3, destinoProvincia: 'Trujillo', horas: 16 },
    { id: 3, idCliente: 1, cliente: 'EDICIONES COREFO S.A.C.', idOrigenDepartamento: 15, idOrigenProvincia: 1, origenProvincia: 'Lima', idDestinoDepartamento: 4, idDestinoProvincia: 4, destinoProvincia: 'Arequipa', horas: 18 },
  ]);

  getLeadTimes(filtros?: { idCliente?: number; idOrigenProvincia?: number; idDestinoProvincia?: number }): Observable<LeadTime[]> {
    let list = [...this._leadTimesMock.value];
    if (filtros?.idCliente) list = list.filter((l) => l.idCliente === filtros.idCliente);
    if (filtros?.idOrigenProvincia) list = list.filter((l) => l.idOrigenProvincia === filtros.idOrigenProvincia);
    if (filtros?.idDestinoProvincia) list = list.filter((l) => l.idDestinoProvincia === filtros.idDestinoProvincia);
    return of(list);
  }

  guardarLeadTime(model: LeadTime): Observable<LeadTime> {
    const list = [...this._leadTimesMock.value];
    if (model.id) {
      const idx = list.findIndex((l) => l.id === model.id);
      if (idx >= 0) list[idx] = { ...model };
    } else {
      const newId = Math.max(0, ...list.map((l) => l.id ?? 0)) + 1;
      list.push({ ...model, id: newId });
    }
    this._leadTimesMock.next(list);
    return of(model);
  }

  eliminarLeadTime(id: number): Observable<void> {
    const list = this._leadTimesMock.value.filter((l) => l.id !== id);
    this._leadTimesMock.next(list);
    return of(void 0);
  }

  getLeadTimesList(): LeadTime[] {
    return this._leadTimesMock.value;
  }

  getOTsCitasPendientesPorCliente(idcliente: number): Observable<any[]> {
    return this._httpClient.get<any[]>(
      `${this.baseUrl}ots-citas-pendientes?idcliente=${idcliente}`,
      httpOptions
    );
  }

  getOTsObservadasPorCliente(idcliente: number): Observable<any[]> {
    return this._httpClient.get<any[]>(
      `${this.baseUrl}ots-observadas?idcliente=${idcliente}`,
      httpOptions
    );
  }

  buscarOTPorNumcp(numcp: string): Observable<any> {
    const baseUrlOrden = environment.baseUrl + '/api/Orden/';
    return this._httpClient.get<any>(`${baseUrlOrden}GetOrdenTransporteByNumero?numcp=${numcp}`, httpOptions);
  }

  guardarCita(payload: {
    idOrdenTrabajo: number;
    idCliente: number;
    fechaCita: string;
    horaCita: string;
    idUsuarioRegistro: number;
    observaciones?: string;
  }): Observable<any> {
    const baseUrlRecojo = environment.baseUrl + '/api/recojo/';
    return this._httpClient.post<any>(`${baseUrlRecojo}guardar-cita`, payload, httpOptions);
  }
}
