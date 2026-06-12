import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import * as XLSX from 'xlsx';
import { LiquidacionService } from '../liquidacion.service';

interface PlacaProgramada {
  idmanifiesto?: number;
  idvehiculo?: number;
  idordentrabajo?: number;
  numhojaruta?: string;
  nummanifiesto?: string;
  placa?: string;
  chofer?: string;
  proveedor?: string;
  ruc?: string;
  estado?: string;
  cliente?: string;
  destino?: string;
  fechaprogramacion?: string | Date;
  tieneGuiasAsignadas?: boolean;
  cantGuiasAsignadas?: number;
}

@Component({
  selector: 'app-listadoplacasprogramadas',
  templateUrl: './listadoplacasprogramadas.component.html',
  styleUrls: ['./listadoplacasprogramadas.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatIcon,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    ToastModule,
    TooltipModule,
  ],
  providers: [MessageService],
})
export class ListadoplacasprogramadasComponent implements OnInit {
  ordenes: PlacaProgramada[] = [];
  cols: any[] = [];
  loading = false;
  model: any = { ruc: '', placa: '' };

  selected: PlacaProgramada | null = null;

  constructor(
    private liquidacionService: LiquidacionService,
    private router: Router,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.cols = [
      { header: 'ACC', field: 'acc', width: '80px', sortable: false },
      { header: 'HOJA DE RUTA', field: 'numhojaruta', width: '140px', sortable: true },
      { header: 'PLACA', field: 'placa', width: '120px', sortable: true },
      { header: 'CHOFER', field: 'chofer', width: '200px', sortable: true },
      { header: 'PROVEEDOR', field: 'proveedor', width: '220px', sortable: true },
      { header: 'RUC', field: 'ruc', width: '140px', sortable: true },
      { header: 'ESTADO', field: 'estado', width: '130px', sortable: true },
      { header: 'GUÍAS ASIGNADAS', field: 'tieneGuiasAsignadas', width: '160px', sortable: true },
    ];

    this.buscar();
  }

  buscar(): void {
    this.loading = true;
    this.liquidacionService.getAllPlacasProgramadas(this.model.ruc ?? '', this.model.placa ?? '').subscribe({
      next: (list: PlacaProgramada[]) => {
        this.ordenes = list ?? [];
      },
      error: (err) => {
        console.error('Error al listar placas programadas:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Placas',
          detail: err?.error?.message ?? 'No se pudo cargar el listado.',
        });
      },
      complete: () => (this.loading = false),
    });
  }

  ver(idmanifiesto?: number): void {
    if (!idmanifiesto) return;
    // TODO: pantalla destino pendiente de migrar
    this.router.navigate(['/seguimiento/programacionplaca', idmanifiesto]);
  }

  asignarGuiasBlanco(): void {
    if (!this.selected) {
      this.messageService.add({
        severity: 'info',
        summary: 'Selección requerida',
        detail: 'Debes seleccionar una placa.',
      });
      return;
    }
    this.router.navigate([
      '/seguimiento/asignarguias',
      this.selected.idmanifiesto,
      this.selected.idvehiculo,
    ]);
  }

  exportExcel(): void {
    if (!this.ordenes.length) {
      this.messageService.add({
        severity: 'info',
        summary: 'Exportar',
        detail: 'No hay datos para exportar.',
      });
      return;
    }

    const rows = this.ordenes.map((r) => ({
      'Hoja de Ruta': r.numhojaruta ?? '',
      'Placa': r.placa ?? '',
      'Chofer': r.chofer ?? '',
      'Proveedor': r.proveedor ?? '',
      'RUC': r.ruc ?? '',
      'Fecha de programación': r.fechaprogramacion ?? '',
      'Estado': r.estado ?? '',
      'Cliente': r.cliente ?? '',
      'Destino': r.destino ?? '',
      'Guías asignadas': r.tieneGuiasAsignadas ? 'Sí' : 'No',
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Placas Programadas');
    const ts = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `placas-programadas-${ts}.xlsx`);
  }

  estadoClass(estado?: string): string {
    if (!estado) return 'badge-gris';
    const e = estado.toLowerCase();
    if (e.includes('registrado')) return 'badge-rojo';
    if (e.includes('programado')) return 'badge-amarillo';
    if (e.includes('liquidad') || e.includes('completad')) return 'badge-verde';
    return 'badge-gris';
  }
}
