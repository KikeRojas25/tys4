import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { IntegradoComercialPorClienteResult, IntegradoSemaforoPorClienteResult } from '../recojo/recojo.types';
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

  /** Integrado semáforo por cliente - Mock con datos ficticios */
  getIntegradoSemaforoPorCliente(idusuario: number, idequipo?: number | null): Observable<IntegradoSemaforoPorClienteResult[]> {
    const mock: IntegradoSemaforoPorClienteResult[] = [
      { idcliente: 1, cliente: 'EDICIONES COREFO S.A.C.', cantidad_atiempo: 12, cantidad_porvencer: 3, cantidad_fueratiempo: 1, cantidad_observadas: 2 },
      { idcliente: 2, cliente: 'DISTRIBUIDORA SANTA ROSA S.A.', cantidad_atiempo: 8, cantidad_porvencer: 5, cantidad_fueratiempo: 0, cantidad_observadas: 1 },
      { idcliente: 3, cliente: 'LIBRERÍA CULTURAL PERUANA', cantidad_atiempo: 15, cantidad_porvencer: 2, cantidad_fueratiempo: 2, cantidad_observadas: 4 },
      { idcliente: 4, cliente: 'EDITORIAL NORMA S.A.C.', cantidad_atiempo: 22, cantidad_porvencer: 1, cantidad_fueratiempo: 0, cantidad_observadas: 0 },
      { idcliente: 5, cliente: 'GRUPO EDITORIAL MACRO E.I.R.L.', cantidad_atiempo: 5, cantidad_porvencer: 7, cantidad_fueratiempo: 3, cantidad_observadas: 2 },
    ];
    return of(mock);
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

  /** OTs pendientes por cliente - Mock para registro de citas */
  getOTsPendientesPorCliente(idcliente: number): Observable<{ numcp: string; destino: string; peso: number; bulto: number; estado: string }[]> {
    const mock = [
      { numcp: '100-891825', destino: 'AREQUIPA', peso: 3, bulto: 1, estado: 'En Ruta' },
      { numcp: '100-891824', destino: 'MARISCAL NIETO', peso: 251, bulto: 6, estado: 'En Ruta' },
      { numcp: '100-891823', destino: 'SAN ROMAN', peso: 220, bulto: 3, estado: 'Pendiente' },
      { numcp: '100-891822', destino: 'CALLAO', peso: 1, bulto: 2, estado: 'En Ruta' },
      { numcp: '100-891821', destino: 'LIMA', peso: 9, bulto: 1, estado: 'Pendiente' },
    ];
    return of(mock);
  }
}
