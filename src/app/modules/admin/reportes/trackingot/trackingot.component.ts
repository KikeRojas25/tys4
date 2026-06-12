import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { OrdenTransporteService } from '../../recepcion/ordentransporte/ordentransporte.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { CarouselModule } from 'primeng/carousel';
import { DialogService } from 'primeng/dynamicdialog';
import { forkJoin } from 'rxjs';
import { OrdenTrabajoTrackingResult } from './trackingot.types';
import { FileModalComponent } from '../../recepcion/ordentransporte/seguimientoot/modalfiles';

interface EventItem {
  status?: string;
  dateRegister?: string;
  dateEvent?: string;
  user?: string;
  station?: string;
  idmaestroevento?: number;
  recursotroncal?: string;
  repartidor?: string;
}

interface OrdenConEventos {
  orden: OrdenTrabajoTrackingResult;
  events: EventItem[];
  ordenTransporte: any;
  guias: any[];
}

@Component({
  selector: 'app-trackingot',
  templateUrl: './trackingot.component.html',
  styleUrls: ['./trackingot.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    MatIcon,
    ToastModule,
    TableModule,
    DialogModule,
    CarouselModule,
  ],
  providers: [MessageService, DialogService],
})
export class TrackingotComponent {
  numcp = '';
  loading = false;
  ordenes: OrdenTrabajoTrackingResult[] = [];
  ordenesConEventos: OrdenConEventos[] = [];

  despachoLinksVisible = false;
  despachoLinks: { iddespacho?: number; idmanifiesto?: number } = {};

  repartoFotosVisible = false;
  repartoFotos: any[] = [];

  constructor(
    private ordenService: OrdenTransporteService,
    private messageService: MessageService,
    public dialogService: DialogService
  ) {}

  buscar(): void {
    const criterio = (this.numcp || '').trim();
    if (!criterio) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Búsqueda',
        detail: 'Ingrese el número de orden (CP) para buscar.',
      });
      return;
    }

    this.loading = true;
    this.ordenes = [];

    this.ordenService.obtenerOrdenTrabajoTracking(criterio).subscribe({
      next: (resp) => {
        this.ordenes = Array.isArray(resp) ? resp : [];
        this.ordenesConEventos = [];
        if (this.ordenes.length === 0) {
          this.loading = false;
          this.messageService.add({
            severity: 'info',
            summary: 'Sin resultados',
            detail: `No se encontraron órdenes para "${criterio}".`,
          });
          return;
        }
        const idOrdenes = this.ordenes
          .map(o => o.idordentrabajo ?? (o as any).idOrdenTrabajo)
          .filter(id => id != null && Number.isFinite(Number(id)));
        if (idOrdenes.length === 0) {
          this.ordenesConEventos = this.ordenes.map(o => ({ orden: o, events: [], ordenTransporte: null, guias: [] }));
          this.loading = false;
          return;
        }
        const requests = idOrdenes.map(id =>
          forkJoin({
            eventos: this.ordenService.getEventos(Number(id)),
            detalle: this.ordenService.getOrden(id)
          })
        );
        forkJoin(requests).subscribe({
          next: (results) => {
            this.ordenesConEventos = this.ordenes.map((o, i) => {
              const id = o.idordentrabajo ?? (o as any).idOrdenTrabajo;
              const idx = idOrdenes.indexOf(id);
              const res = idx >= 0 ? results[idx] : null;
              const eventos = (res?.eventos ?? []).map((e: any) => ({
                status: e.evento ?? e.status,
                dateRegister: e.fechaRegistro ?? e.dateRegister,
                dateEvent: e.fechaEvento ?? e.dateEvent,
                user: (e.usuario === 'ADMIN ADMIN' ? 'CHATBOT' : e.usuario) ?? e.user,
                station: e.estacionUsuario ?? e.EstacionUsuario ?? null,
                idmaestroevento: e.idMaestroEvento ?? e.idmaestroevento ?? null,
                recursotroncal: e.recursotroncal ?? e.Recursotroncal ?? null,
                repartidor: e.repartidor ?? e.Repartidor ?? null,
              }));
              const ot = res?.detalle?.ordenTransporte ?? res?.detalle ?? null;
              const guias = res?.detalle?.guias ?? [];
              return { orden: o, events: eventos, ordenTransporte: ot, guias };
            });
            this.loading = false;
          },
          error: () => {
            this.ordenesConEventos = this.ordenes.map(o => ({ orden: o, events: [], ordenTransporte: null, guias: [] }));
            this.loading = false;
          }
        });
      },
      error: (err) => {
        this.loading = false;
        const msg = err?.error?.message || err?.message || 'Error al obtener el tracking.';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: msg,
        });
      },
    });
  }

  formatDate(val: string | Date | null | undefined): string {
    if (!val) return '-';
    const d = typeof val === 'string' ? new Date(val) : val;
    return isNaN(d.getTime()) ? String(val) : d.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatNumber(val: number | null | undefined): string {
    if (val == null || val === undefined) return '-';
    return Number(val).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  getEstadoClass(estado: string | null | undefined): string {
    if (!estado) return 'estado-sin-estado';
    const s = estado.toLowerCase().replace(/\s/g, '-');
    return 'estado-' + s;
  }

  /** Normaliza el texto del evento a un código de tipo para rutear acciones. */
  private tipoEvento(status?: string): string {
    const txt = (status || '').toLowerCase();
    if (txt.includes('ot creada') || (txt.includes('registr') && txt.includes('orden de transporte'))) return 'ot-creada';
    if (txt.includes('planificada')) return 'ot-planificada';
    if (txt.includes('manifiesto') || txt.includes('hoja ruta') || txt.includes('hr generado')) return 'manifiesto-hr';
    if (txt.includes('despachada') || txt.includes('despachó') || txt.includes('despacho')) return 'ot-despachada';
    if (txt.includes('en zona')) return 'en-zona';
    if (txt.includes('proveedor de reparto')) return 'entregada-reparto';
    if (txt.includes('en reparto')) return 'en-reparto';
    if (txt.includes('entrega') && (txt.includes('conforme') || txt.includes('(ok)'))) return 'entrega-ok';
    return 'none';
  }

  /**
   * Abre el visor de adjuntos / link contextual del evento.
   * El comportamiento por tipo se irá conectando gradualmente.
   */
  verAdjuntosEvento(event: EventItem, item: OrdenConEventos): void {
    const type = this.tipoEvento(event.status);

    switch (type) {
      // "Se registró la orden de transporte" → reporte de OT en webreports
      case 'ot-creada': {
        const idOrden = item?.orden?.idordentrabajo ?? (item?.ordenTransporte?.idordentrabajo);
        if (!idOrden) {
          this.messageService.add({ severity: 'warn', summary: 'Adjuntos', detail: 'No se encontró el ID de la orden.' });
          return;
        }
        window.open(`http://104.36.166.65/webreports/ot.aspx?idorden=${idOrden}`, '_blank');
        return;
      }

      // "Se despachó la orden" → hoja de ruta + manifiesto
      case 'ot-despachada': {
        const ot = item?.ordenTransporte ?? {};
        const iddespacho = ot.idDespacho ?? ot.iddespacho ?? (item?.orden as any)?.iddespacho;
        const idmanifiesto = ot.idManifiesto ?? ot.idmanifiesto ?? item?.orden?.idmanifiesto;
        if (!iddespacho && !idmanifiesto) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Adjuntos',
            detail: 'No se encontró el despacho o manifiesto vinculado a la orden.'
          });
          return;
        }
        this.despachoLinks = { iddespacho, idmanifiesto };
        this.despachoLinksVisible = true;
        return;
      }

      // "La orden fue entregada al proveedor de reparto" → carrusel (placeholder por ahora)
      case 'entregada-reparto': {
        this.repartoFotos = [];
        this.repartoFotosVisible = true;
        return;
      }

      // "Entrega: Conforme (OK)" → visor de fotos de evidencia
      case 'entrega-ok': {
        const idOrden = item?.orden?.idordentrabajo ?? (item?.ordenTransporte?.idordentrabajo);
        if (!idOrden) {
          this.messageService.add({ severity: 'warn', summary: 'Adjuntos', detail: 'No se encontró el ID de la orden.' });
          return;
        }
        this.dialogService.open(FileModalComponent, {
          header: 'Visor Fotos',
          width: '30%',
          data: { id: idOrden }
        });
        return;
      }

      // TODO: agregar el resto de tipos a medida que se vayan definiendo
      default:
        this.messageService.add({
          severity: 'info', summary: 'Adjuntos',
          detail: 'Este evento aún no tiene visor configurado.'
        });
        console.log('[adjuntos] tipo evento sin handler:', type, '| event:', event, '| item:', item);
    }
  }

  abrirHojaRuta(): void {
    const id = this.despachoLinks.iddespacho;
    if (!id) return;
    window.open(`http://104.36.166.65/webreports/hojaruta.aspx?iddespacho=${id}`, '_blank');
  }

  abrirManifiesto(): void {
    const id = this.despachoLinks.idmanifiesto;
    if (!id) return;
    window.open(`http://104.36.166.65/webreports/manifiesto.aspx?idmanifiesto=${id}`, '_blank');
  }
}
