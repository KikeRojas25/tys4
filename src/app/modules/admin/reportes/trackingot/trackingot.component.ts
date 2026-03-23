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
import { forkJoin } from 'rxjs';
import { OrdenTrabajoTrackingResult } from './trackingot.types';

interface EventItem {
  status?: string;
  dateRegister?: string;
  dateEvent?: string;
  user?: string;
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
  ],
  providers: [MessageService],
})
export class TrackingotComponent {
  numcp = '';
  loading = false;
  ordenes: OrdenTrabajoTrackingResult[] = [];
  ordenesConEventos: OrdenConEventos[] = [];

  constructor(
    private ordenService: OrdenTransporteService,
    private messageService: MessageService
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
                user: (e.usuario === 'ADMIN ADMIN' ? 'CHATBOT' : e.usuario) ?? e.user
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
}
