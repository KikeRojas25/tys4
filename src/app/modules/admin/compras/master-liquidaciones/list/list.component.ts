import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ComprasService } from '../../compras.service';
import { MasterLiquidacionResult } from '../../compras.types';
import { User } from 'app/core/user/user.types';

@Component({
  selector: 'app-master-liquidaciones-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, CalendarModule, TableModule, ButtonModule, ToastModule],
  providers: [MessageService],
})
export class MasterLiquidacionesListComponent implements OnInit {
  loading = false;
  rows: MasterLiquidacionResult[] = [];
  user: User | null = null;

  filtros = {
    fechaInicio: null as Date | null,
    fechaFin: null as Date | null,
  };

  constructor(private comprasService: ComprasService, private messageService: MessageService) {}

  ngOnInit(): void {
    this.user = this.safeParse<User>('user');
    this.setDefaultFechas();
    this.load();
  }

  private safeParse<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  private getIdTipoLiquidacion(): number {
    const esTrafico = !!this.user?.estrafico;
    const esAlmacen = !!this.user?.esalmacen;
    return esTrafico ? 1 : esAlmacen ? 2 : 1;
  }

  private setDefaultFechas(): void {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const inicio = new Date(hoy);
    inicio.setDate(hoy.getDate() - 30);
    this.filtros.fechaInicio = inicio;
    this.filtros.fechaFin = hoy;
  }

  get totalRegistros(): number {
    return (this.rows ?? []).length;
  }

  get totalMonto(): number {
    return (this.rows ?? []).reduce((acc, x) => acc + (Number((x as any)?.TotalMonto) || 0), 0);
  }

  load(): void {
    this.loading = true;
    const idTipo = this.getIdTipoLiquidacion();
    this.comprasService.getMasterLiquidaciones(idTipo, this.filtros.fechaInicio, this.filtros.fechaFin).subscribe({
      next: (resp) => {

        console.log('resp',resp);
        this.rows = (resp ?? []) as MasterLiquidacionResult[];
      },
      error: (err) => {
        console.error('Error cargando master liquidaciones:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Compras',
          detail: 'No se pudo cargar el master de liquidaciones. Intente nuevamente.',
        });
      },
      complete: () => (this.loading = false),
    });
  }

  buscar(): void {
    const fi = this.filtros.fechaInicio ? new Date(this.filtros.fechaInicio) : null;
    const ff = this.filtros.fechaFin ? new Date(this.filtros.fechaFin) : null;
    if (fi && ff && fi.getTime() > ff.getTime()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Filtros',
        detail: 'La fecha inicio no puede ser mayor que la fecha fin.',
      });
      return;
    }
    this.load();
  }

  limpiar(): void {
    this.setDefaultFechas();
    this.load();
  }

  reimprimir(row: MasterLiquidacionResult): void {
    void row;
    this.messageService.add({
      severity: 'info',
      summary: 'Reimprimir',
      detail: 'Pendiente de implementar.',
    });
  }
}

