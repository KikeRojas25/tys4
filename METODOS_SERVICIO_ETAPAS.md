# Métodos del Servicio para Gestión de Etapas

## Ejemplo de implementación en PlanningService

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { 
  EtapaDespachoDTO, 
  EtapaDespachoResponse, 
  EtapaDespachoApiResponse,
  EliminarEtapaRequest 
} from './despachos-generados/etapa.types';

const httpOptions = {
  headers: new HttpHeaders({
    Authorization: 'Bearer ' + localStorage.getItem('token'),
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class PlanningService {
  private _httpClient = inject(HttpClient);
  private baseUrl = environment.baseUrl + '/api/Planning/';

  /**
   * Crear una nueva etapa de despacho
   */
  crearEtapaDespacho(etapa: EtapaDespachoDTO): Observable<EtapaDespachoApiResponse> {
    return this._httpClient.post<EtapaDespachoApiResponse>(
      `${this.baseUrl}CrearEtapaDespacho`,
      etapa,
      httpOptions
    );
  }

  /**
   * Actualizar una etapa existente
   */
  actualizarEtapaDespacho(idEtapaDespacho: number, etapa: EtapaDespachoDTO): Observable<EtapaDespachoApiResponse> {
    return this._httpClient.put<EtapaDespachoApiResponse>(
      `${this.baseUrl}ActualizarEtapaDespacho/${idEtapaDespacho}`,
      etapa,
      httpOptions
    );
  }

  /**
   * Obtener todas las etapas de un despacho
   */
  getEtapasDespacho(idCarga: number): Observable<EtapaDespachoResponse[]> {
    return this._httpClient.get<EtapaDespachoResponse[]>(
      `${this.baseUrl}GetEtapasDespacho?idCarga=${idCarga}`,
      httpOptions
    );
  }

  /**
   * Obtener una etapa específica con sus OTs
   */
  getEtapaDespachoConOTs(idEtapaDespacho: number): Observable<EtapaDespachoResponse> {
    return this._httpClient.get<EtapaDespachoResponse>(
      `${this.baseUrl}GetEtapaDespachoConOTs/${idEtapaDespacho}`,
      httpOptions
    );
  }

  /**
   * Eliminar una etapa (soft delete)
   */
  eliminarEtapaDespacho(request: EliminarEtapaRequest): Observable<EtapaDespachoApiResponse> {
    return this._httpClient.post<EtapaDespachoApiResponse>(
      `${this.baseUrl}EliminarEtapaDespacho`,
      request,
      httpOptions
    );
  }
}
```

## Ejemplo de uso en el componente

```typescript
import { EtapaDespachoDTO, EtapaDespachoResponse } from './etapa.types';

// Guardar una nueva etapa
guardarEtapa() {
  if (!this.despachoSeleccionado || !this.nuevaEtapa.nombre || !this.nuevaEtapa.tipoOperacion) {
    return;
  }

  const etapaDTO: EtapaDespachoDTO = {
    idCarga: this.idcargaEspecifico || this.despachoSeleccionado.idCarga,
    nombre: this.nuevaEtapa.nombre,
    descripcion: this.nuevaEtapa.descripcion,
    orden: this.nuevaEtapa.orden,
    idTipoOperacion: this.nuevaEtapa.tipoOperacion,
    idUsuarioCreacion: this.user.usr_int_id,
    idRemitente: this.nuevaEtapa.idRemitente,
    idDestinatario: this.nuevaEtapa.idDestinatario,
    idDireccion: this.nuevaEtapa.idDireccion,
    pesoAgencia: this.nuevaEtapa.pesoAgencia,
    bultoAgencia: this.nuevaEtapa.bultoAgencia,
    nroFactura: this.nuevaEtapa.nroFactura,
    consignadoAgencia: this.nuevaEtapa.consignadoAgencia,
    claveAgencia: this.nuevaEtapa.claveAgencia,
    nroRemito: this.nuevaEtapa.nroRemito,
    costoEnvio: this.nuevaEtapa.costoEnvio,
    idAgencia: this.nuevaEtapa.idAgencia,
    // IDs de las OTs seleccionadas
    idOrdenesTrabajo: this.nuevaEtapa.otsSeleccionadas?.map(ot => ot.idordentrabajo) || []
  };

  this.planningService.crearEtapaDespacho(etapaDTO).subscribe({
    next: (response) => {
      if (response.success) {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Etapa creada correctamente'
        });
        this.cargarEtapasDelDespacho();
        this.cancelarAgregarEtapa();
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: response.message || 'Error al crear la etapa'
        });
      }
    },
    error: (error) => {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al comunicarse con el servidor'
      });
    }
  });
}

// Cargar etapas desde el backend
cargarEtapasDelDespacho() {
  if (!this.despachoSeleccionado) return;
  
  const idCarga = this.idcargaEspecifico || this.despachoSeleccionado.idCarga;
  
  this.planningService.getEtapasDespacho(idCarga).subscribe({
    next: (etapas: EtapaDespachoResponse[]) => {
      // Convertir las etapas del backend al formato del componente
      this.todasLasEtapas = etapas.map(etapa => ({
        id: etapa.idEtapaDespacho,
        idDespacho: etapa.numCarga,
        nombre: etapa.nombre,
        descripcion: etapa.descripcion,
        orden: etapa.orden,
        tipoOperacion: etapa.idTipoOperacion,
        tipoOperacionLabel: etapa.tipoOperacionLabel,
        otsSeleccionadas: etapa.ordenesTrabajo?.map(ot => ({
          idordentrabajo: ot.idOrdenTrabajo,
          numordentrabajo: ot.numcp,
          razonsocial: ot.razonsocial,
          destino: ot.destino,
          peso: ot.peso,
          bultos: ot.bulto,
          subtotal: ot.subtotal,
          tipooperacion: ot.tipooperacion,
          proveedor: ot.proveedor
        })) || [],
        idRemitente: etapa.idRemitente,
        remitenteLabel: etapa.remitenteLabel,
        idDestinatario: etapa.idDestinatario,
        destinatarioLabel: etapa.destinatarioLabel,
        idDireccion: etapa.idDireccion,
        direccionLabel: etapa.direccionLabel,
        pesoAgencia: etapa.pesoAgencia,
        bultoAgencia: etapa.bultoAgencia,
        nroFactura: etapa.nroFactura,
        consignadoAgencia: etapa.consignadoAgencia,
        claveAgencia: etapa.claveAgencia,
        nroRemito: etapa.nroRemito,
        costoEnvio: etapa.costoEnvio,
        idAgencia: etapa.idAgencia,
        agenciaLabel: etapa.agenciaLabel
      }));
      
      this.filtrarEtapasPorDespacho(this.despachoSeleccionado.numDespacho);
    },
    error: (error) => {
      console.error('Error al cargar etapas:', error);
    }
  });
}
```

