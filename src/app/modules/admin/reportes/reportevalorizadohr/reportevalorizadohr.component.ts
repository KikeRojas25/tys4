import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-reportevalorizadohr',
  standalone: true,
  templateUrl: './reportevalorizadohr.component.html',
  styleUrls: ['./reportevalorizadohr.component.css'],
  imports: [CommonModule, FormsModule, CalendarModule, ButtonModule, ToastModule, MatIcon],
  providers: [MessageService],
})
export class ReportevalorizadohrComponent {
  loading = false;

  filtros = {
    fechaInicio: null as Date | null,
    fechaFin: null as Date | null,
  };

  private readonly reporteUrlBase = 'http://104.36.166.65/webreports/reportevalorizadohr.aspx';

  constructor(private messageService: MessageService) {}

  buscar(): void {
    if (this.loading) return;
    const fi = this.filtros.fechaInicio ? new Date(this.filtros.fechaInicio) : null;
    const ff = this.filtros.fechaFin ? new Date(this.filtros.fechaFin) : null;

    if (!fi || !ff) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Filtros',
        detail: 'Seleccione fecha inicio y fecha fin.',
      });
      return;
    }
    if (fi.getTime() > ff.getTime()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Filtros',
        detail: 'La fecha inicio no puede ser mayor que la fecha fin.',
      });
      return;
    }

    const url = this.buildUrl(fi, ff);
    // Abrimos en una nueva pestaña para no sacar al usuario del sistema
    window.open(url, '_blank');
  }

  limpiar(): void {
    this.filtros.fechaInicio = null;
    this.filtros.fechaFin = null;
  }

  private buildUrl(fi: Date, ff: Date): string {
    const fecinicio = this.formatDMy(fi);
    const fecfin = this.formatDMy(ff);
    return `${this.reporteUrlBase}?fecinicio=${encodeURIComponent(fecinicio)}&fecfin=${encodeURIComponent(fecfin)}`;
  }

  private formatDMy(d: Date): string {
    // Backend/Reporte espera "d/M/yyyy" (ejemplo: 10/2/2026)
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
}

