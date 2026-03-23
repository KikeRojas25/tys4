import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ReporteService } from '../reporte.service';

@Component({
  selector: 'app-incidenciassinseguimiento',
  standalone: true,
  templateUrl: './incidenciassinseguimiento.component.html',
  styleUrls: ['./incidenciassinseguimiento.component.css'],
  imports: [CommonModule, ButtonModule, ToastModule, MatIcon],
  providers: [MessageService],
})
export class IncidenciassinseguimientoComponent {
  loading = false;

  constructor(
    private reporteService: ReporteService,
    private messageService: MessageService
  ) {}

  descargarExcel(): void {
    if (this.loading) return;
    this.loading = true;

    this.reporteService.getReporteOTsObservadasSinSeguimiento('excel').subscribe({
      next: (blob: Blob) => {
        try {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `OTsObservadas_SinSeguimiento_${this.formatTimestamp()}.xlsx`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          this.messageService.add({
            severity: 'success',
            summary: 'Reporte',
            detail: 'Excel descargado correctamente.',
          });
        } finally {
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error al descargar el Excel:', err);
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Reporte',
          detail: err?.error?.message ?? err?.error ?? 'No se pudo descargar el Excel. Intente nuevamente.',
        });
      },
    });
  }

  private formatTimestamp(): string {
    const d = new Date();
    const yyyy = d.getFullYear();
    const MM = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const HH = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${yyyy}${MM}${dd}_${HH}${mm}${ss}`;
  }
}

