import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { Cliente, OrdenTransporte, Ubigeo } from '../recepcion/ordentransporte/ordentransporte.types';
import { GuiaRemisionBlanco } from './liquidacion.types';

const httpOptions = {
  headers: new HttpHeaders({
    Authorization: 'Bearer ' + localStorage.getItem('token'),
    'Content-Type': 'application/json',
  }),
};

@Injectable({ providedIn: 'root' })
export class LiquidacionService {
  private _httpClient = inject(HttpClient);
  private baseUrl = environment.baseUrl + '/api/liquidacion/';

  // ── Pendientes de liquidación (HR) ───────────────────────────────────────
  getAllLiquidacionPendiente(model: any): Observable<OrdenTransporte[]> {
    const param =
      '?dni=' + (model.dni ?? '') +
      '&fec_ini=' + model.fec_ini.toLocaleDateString() +
      '&fec_fin=' + model.fec_fin.toLocaleDateString();
    return this._httpClient.get<OrdenTransporte[]>(
      this.baseUrl + 'GetAllPendienteLiquidacionxDNI' + param,
      httpOptions,
    );
  }

  getAllLiquidacionRepartidorPendiente(model: any): Observable<OrdenTransporte[]> {
    const param =
      '?dni=' + (model.dni ?? '') +
      '&fec_ini=' + model.fec_ini.toLocaleDateString() +
      '&fec_fin=' + model.fec_fin.toLocaleDateString();
    return this._httpClient.get<OrdenTransporte[]>(
      this.baseUrl + 'GetAllPendienteLiquidacionRepartidoresxDNI' + param,
      httpOptions,
    );
  }

  getAllPendienteFacturacion(numhojaruta: string): Observable<OrdenTransporte[]> {
    const param = '?numhojaruta=' + (numhojaruta ?? '');
    return this._httpClient.get<OrdenTransporte[]>(
      this.baseUrl + 'getListarPendientesFacturacionOS' + param,
      httpOptions,
    );
  }

  // ── Manifiestos ─────────────────────────────────────────────────────────
  getAllManifiestoPendientes(numhojaruta: string): Observable<OrdenTransporte[]> {
    return this._httpClient.get<OrdenTransporte[]>(
      this.baseUrl + 'getAllManifiestoPendientes?numhojaruta=' + numhojaruta,
      httpOptions,
    );
  }

  getAllLiquidacionPendientexManifiesto(idmanifiesto: number): Observable<OrdenTransporte[]> {
    return this._httpClient.get<OrdenTransporte[]>(
      this.baseUrl + 'GetAllPendienteLiquidacionxManifiesto?idmanifiesto=' + idmanifiesto,
      httpOptions,
    );
  }

  getAllOrdersxManifiesto(idmanifiesto: number): Observable<OrdenTransporte[]> {
    return this._httpClient.get<OrdenTransporte[]>(
      this.baseUrl + 'getAllOrdersxManifiesto?idmanifiesto=' + idmanifiesto,
      httpOptions,
    );
  }

  // ── Guías de remisión en blanco (GRT) ────────────────────────────────────
  getAllGuiasAsignadasBlanco(idmanifiesto: number, idordentrabajo: number): Observable<GuiaRemisionBlanco[]> {
    return this._httpClient.get<GuiaRemisionBlanco[]>(
      this.baseUrl + 'GetGuiaRemisionBlancoPorVehiculo?idmanifiesto=' + idmanifiesto + '&idordentrabajo=' + idordentrabajo,
      httpOptions,
    );
  }

  asignarGuiasBlanco(guiaId: number, idordentrabajo: number): Observable<GuiaRemisionBlanco[]> {
    return this._httpClient.post<GuiaRemisionBlanco[]>(
      this.baseUrl + 'asignarGuiasBlanco?id=' + idordentrabajo + '&guia=' + guiaId,
      {},
      httpOptions,
    );
  }

  asignarGuiasBlancoExtraviado(guiaId: number, idordentrabajo: number): Observable<GuiaRemisionBlanco[]> {
    return this._httpClient.post<GuiaRemisionBlanco[]>(
      this.baseUrl + 'asignarGuiasBlancoExtraviado?id=' + idordentrabajo + '&guia=' + guiaId,
      {},
      httpOptions,
    );
  }

  desvincularGuiasBlanco(guiaId: number, idordentrabajo: number): Observable<GuiaRemisionBlanco[]> {
    return this._httpClient.post<GuiaRemisionBlanco[]>(
      this.baseUrl + 'desvincularGuiasBlanco?id=' + idordentrabajo + '&guia=' + guiaId,
      {},
      httpOptions,
    );
  }

  // ── Liquidación ──────────────────────────────────────────────────────────
  liquidarManifiesto(idmanifiesto: number, idmaestroincidencia: number, observacion: string): Observable<any> {
    const param =
      '?idmanifiesto=' + idmanifiesto +
      '&idmaestroincidencia=' + idmaestroincidencia +
      '&observacion=' + observacion;
    return this._httpClient.post<any>(this.baseUrl + 'liquidarManifiesto' + param, {}, httpOptions);
  }

  liquidarOT(idordentrabajo: number, idmaestroincidencia: number, observacion: string): Observable<any> {
    const param =
      '?idordentrabajo=' + idordentrabajo +
      '&idmaestroincidencia=' + idmaestroincidencia +
      '&observacion=' + observacion;
    return this._httpClient.post<any>(this.baseUrl + 'liquidarOT' + param, {}, httpOptions);
  }

  // ── Vincular factura ────────────────────────────────────────────────────
  vincularFactura(numhojaruta: string, numero: string): Observable<any> {
    const param = '?numhojaruta=' + numhojaruta + '&numero=' + numero;
    return this._httpClient.post<any>(this.baseUrl + 'VincularOS' + param, {}, httpOptions);
  }

  // ── Catálogos ────────────────────────────────────────────────────────────
  getClientes(idclientes: string): Observable<Cliente[]> {
    return this._httpClient.get<Cliente[]>(
      this.baseUrl + 'GetAllClients?idscliente=' + (idclientes ?? ''),
      httpOptions,
    );
  }

  getUbigeo(criterio: string): Observable<Ubigeo[]> {
    return this._httpClient.get<Ubigeo[]>(
      this.baseUrl + 'GetListUbigeo?criterio=' + (criterio ?? ''),
      httpOptions,
    );
  }

  getAllDocumentos(id: number): Observable<any[]> {
    return this._httpClient.get<any[]>(this.baseUrl + 'GetAllDocumentos?Id=' + id, httpOptions);
  }

  // ── Placas programadas ──────────────────────────────────────────────────
  getAllPlacasProgramadas(ruc: string, placa: string): Observable<any[]> {
    const params = '?ruc=' + encodeURIComponent(ruc ?? '') + '&placa=' + encodeURIComponent(placa ?? '');
    return this._httpClient.get<any[]>(this.baseUrl + 'GetAllPlacasProgramadas' + params, httpOptions);
  }

  // ── Asignar guías en blanco (GRT) ───────────────────────────────────────
  getManifiestoInfo(idmanifiesto: number): Observable<any> {
    return this._httpClient.get<any>(this.baseUrl + 'GetManifiestoInfo?idmanifiesto=' + idmanifiesto, httpOptions);
  }

  getGuiasPorManifiesto(idmanifiesto: number): Observable<any[]> {
    return this._httpClient.get<any[]>(this.baseUrl + 'GetGuiasPorManifiesto?idmanifiesto=' + idmanifiesto, httpOptions);
  }

  registrarGuiaRemisionBlanco(model: any): Observable<any> {
    return this._httpClient.post<any>(this.baseUrl + 'RegistroGuiaRemisionBlanco', model, httpOptions);
  }

  eliminarGuiaRemisionBlanco(id: number): Observable<any> {
    return this._httpClient.delete<any>(this.baseUrl + 'EliminarGuiaRemisionBlanco/' + id, httpOptions);
  }

  downloadDocumento(id: number): Observable<Blob> {
    return this._httpClient.get(this.baseUrl + 'DownloadArchivo?documentoId=' + id, {
      headers: new HttpHeaders({ Authorization: 'Bearer ' + localStorage.getItem('token') }),
      responseType: 'blob',
    });
  }
}
