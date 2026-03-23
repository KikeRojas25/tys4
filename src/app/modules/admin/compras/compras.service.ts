import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import {
  DetalleLiquidadoResult,
  LiquidacionCajaDetalleDto,
  LiquidacionCajaDto,
  LiquidacionCajaForCreateDto,
  LiquidacionCajaForUpdateDto,
  MasterLiquidacionResult,
  OrdenTransporteLite,
} from './compras.types';

export interface LiquidarLiquidacionesRequest {
  Ids: number[];
  Liquidado: boolean;
  IdTipoLiquidacion: number;
  IdLiquidador: number;
}

export interface LiquidarLiquidacionesResponse {
  mensaje: string;
  cantidad: number;
}

@Injectable({
  providedIn: 'root',
})
export class ComprasService {
  private _httpClient = inject(HttpClient);
  private baseUrl = environment.baseUrl + '/api/Compras/';
  private baseOrdenUrl = environment.baseUrl + '/api/Orden/';
  private baseTraficoUrl = environment.baseUrl + '/api/Trafico/';

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + (localStorage.getItem('token') ?? ''),
        'Content-Type': 'application/json',
      }),
    };
  }

  getAllLiquidaciones(
    fechaInicio?: Date | string | null,
    fechaFin?: Date | string | null,
    idtipoliquidacion?: number | null
  ): Observable<LiquidacionCajaDto[]> {
    let params = new HttpParams();

    if (fechaInicio) {
      params = params.set('fechaInicio', this.toQueryDate(fechaInicio));
    }
    if (fechaFin) {
      params = params.set('fechaFin', this.toQueryDate(fechaFin));
    }
    if (idtipoliquidacion != null) {
      const n = Number(idtipoliquidacion);
      if (Number.isFinite(n) && n > 0) params = params.set('idtipoliquidacion', String(n));
    }

    return this._httpClient.get<LiquidacionCajaDto[]>(`${this.baseUrl}liquidaciones`, {
      ...this.getHttpOptions(),
      params,
    });
  }

  getMasterLiquidaciones(
    idTipoLiquidacion?: number | null,
    fechaInicio?: Date | string | null,
    fechaFin?: Date | string | null
  ): Observable<MasterLiquidacionResult[]> {
    let params = new HttpParams();

    if (idTipoLiquidacion != null) {
      const n = Number(idTipoLiquidacion);
      if (Number.isFinite(n) && n > 0) params = params.set('idTipoLiquidacion', String(n));
    }
    if (fechaInicio) {
      params = params.set('fechaInicio', this.toQueryDate(fechaInicio));
    }
    if (fechaFin) {
      params = params.set('fechaFin', this.toQueryDate(fechaFin));
    }

    return this._httpClient.get<MasterLiquidacionResult[]>(
      `${this.baseUrl}master-liquidaciones`,
      {
        ...this.getHttpOptions(),
        params,
      }
    );
  }

  getLiquidacionById(id: number): Observable<LiquidacionCajaDto> {
    return this._httpClient.get<LiquidacionCajaDto>(
      `${this.baseUrl}liquidaciones/${id}`,
      this.getHttpOptions()
    );
  }

  getDetallesLiquidados(
    fechaInicio?: Date | string | null,
    fechaFin?: Date | string | null
  ): Observable<DetalleLiquidadoResult[]> {
    let params = new HttpParams();

    if (fechaInicio) {
      params = params.set('fechaInicio', this.toQueryDate(fechaInicio));
    }
    if (fechaFin) {
      params = params.set('fechaFin', this.toQueryDate(fechaFin));
    }

    return this._httpClient.get<DetalleLiquidadoResult[]>(
      `${this.baseUrl}liquidaciones/detalles-liquidados`,
      {
        ...this.getHttpOptions(),
        params,
      }
    );
  }

  getDetallesByLiquidacionId(id: number): Observable<LiquidacionCajaDetalleDto[]> {
    return this._httpClient.get<LiquidacionCajaDetalleDto[]>(
      `${this.baseUrl}liquidaciones/${id}/detalles`,
      this.getHttpOptions()
    );
  }

  createLiquidacion(dto: LiquidacionCajaForCreateDto): Observable<LiquidacionCajaDto> {
    return this._httpClient.post<LiquidacionCajaDto>(
      `${this.baseUrl}liquidaciones`,
      dto,
      this.getHttpOptions()
    );
  }

  updateLiquidacion(id: number, dto: LiquidacionCajaForUpdateDto): Observable<LiquidacionCajaDto> {
    return this._httpClient.put<LiquidacionCajaDto>(
      `${this.baseUrl}liquidaciones/${id}`,
      dto,
      this.getHttpOptions()
    );
  }

  deleteLiquidacion(id: number): Observable<void> {
    return this._httpClient.delete<void>(
      `${this.baseUrl}liquidaciones/${id}`,
      this.getHttpOptions()
    );
  }

  liquidarLiquidaciones(
    request: LiquidarLiquidacionesRequest
  ): Observable<LiquidarLiquidacionesResponse> {
    return this._httpClient.post<LiquidarLiquidacionesResponse>(
      `${this.baseUrl}liquidaciones/liquidar`,
      request,
      this.getHttpOptions()
    );
  }

  private toQueryDate(value: Date | string): string {
    // Enviamos solo fecha para evitar problemas de TZ (backend recibe DateTime?)
    // Formato: YYYY-MM-DD
    if (typeof value === 'string') return value;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 10);
  }

  // -----------------------------------------------------------------------------------
  // Búsqueda Manifiesto/OT (para Liquidación Caja Chica)
  // -----------------------------------------------------------------------------------

  buscarManifiestoBot(criterio: string): Observable<any> {
    return this._httpClient.get<any>(
      `${this.baseOrdenUrl}BuscarManifiestoBot?criterio=${encodeURIComponent(criterio ?? '')}`,
      this.getHttpOptions()
    );
  }

  getAllOrdersForManifest(idmanifiesto: number): Observable<any[]> {
    return this._httpClient.get<any[]>(
      `${this.baseTraficoUrl}getAllOrdersForManifest?idmanifiesto=${idmanifiesto}`,
      this.getHttpOptions()
    );
  }

  buscarOTBot(criterio: string): Observable<any> {
    return this._httpClient.get<any>(
      `${this.baseOrdenUrl}BuscarOTBot?criterio=${encodeURIComponent(criterio ?? '')}`,
      this.getHttpOptions()
    );
  }

  getOrdenById(idordentrabajo: number): Observable<any> {
    return this._httpClient.get<any>(
      `${this.baseOrdenUrl}GetOrden?id=${idordentrabajo}`,
      this.getHttpOptions()
    );
  }

  // Helpers de mapeo (tolerantes a nombres camel/pascal)
  mapOrdenLite(raw: any): OrdenTransporteLite | null {
    if (!raw) return null;
    const id = Number(raw.idordentrabajo ?? raw.idOrdenTrabajo ?? raw.idordentransporte ?? raw.idorden ?? raw.id);
    const numcp = String(raw.numcp ?? raw.numCp ?? raw.NumCp ?? raw.NumCP ?? '');
    const peso = Number(raw.peso ?? raw.Peso ?? raw.pesoReal ?? raw.PesoReal ?? 0);
    if (!id || !numcp) return null;
    return { idordentrabajo: id, numcp, peso: Number.isFinite(peso) ? peso : 0 };
  }
}

