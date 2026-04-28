import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { MessageService, SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MantenimientoService } from '../../../mantenimiento/mantenimiento.service';
import { LeadTimeRow } from '../leadtimes.types';
import { LeadTimeService } from '../leadtime.service';

export type LeadTimeMode = 'comercial' | 'operativo';

@Component({
  selector: 'app-leadtimes-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TableModule,
    ToastModule,
    DropdownModule,
    ButtonModule,
    MatIconModule,
  ],
  providers: [MessageService],
})
export class ListComponent implements OnInit {
  @Input() mode: LeadTimeMode = 'comercial';

  clientes: SelectItem[] = [];
  idClienteSeleccionado: number | null = null;
  rows: LeadTimeRow[] = [];
  loading = false;
  saving = false;

  readonly dias = Array.from({ length: 30 }, (_, i) => i + 1);
  filtro: string = '';
  soloVacios: boolean = false;

  /** Filas agrupadas para rowspan, filtradas por búsqueda y/o sin días */
  get tableRows(): TableRow[] {
    const term = this.filtro.trim().toLowerCase();
    const filtradas = this.rows.filter(r => {
      const matchTexto = term
        ? r.departamento.toLowerCase().includes(term) || r.provincia.toLowerCase().includes(term)
        : true;
      const matchVacio = this.soloVacios ? r.dias === null : true;
      return matchTexto && matchVacio;
    });

    const grupos = this.groupByDepartamento(filtradas);
    return grupos.flatMap((g) =>
      g.rows.map((r, i) => ({
        row: r,
        isFirstInGroup: i === 0,
        rowspan: g.rows.length,
      }))
    );
  }

  get totalFiltradas(): number {
    return this.tableRows.length;
  }

  get isComercial(): boolean {
    return this.mode === 'comercial';
  }

  get seccion(): string {
    return this.isComercial ? 'Comercial' : 'Despacho';
  }

  get titulo(): string {
    return this.isComercial
      ? 'Lead Times Comerciales'
      : 'Lead Times Operativos';
  }

  get subtitulo(): string {
    return this.isComercial
      ? 'Tiempos de entrega en días por cliente y provincia destino'
      : 'Tiempos de entrega en días por provincia destino (estándar operativo)';
  }

  constructor(
    private mantenimientoService: MantenimientoService,
    private leadTimeService: LeadTimeService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    // El mode puede venir del Input (cuando se usa como child component)
    // o del route data (cuando se navega directamente a la ruta)
    const routeMode = this.route.snapshot.data?.['mode'] as LeadTimeMode | undefined;
    if (routeMode) {
      this.mode = routeMode;
    }

    if (this.isComercial) {
      this.cargarClientes();
    } else {
      this.cargarOperativo();
    }
  }

  cargarClientes(): void {
    this.mantenimientoService.getAllClientes('', 2, true).subscribe({
      next: (clientes) => {
        this.clientes = clientes.map((c) => ({
          value: c.idCliente,
          label: c.razonSocial ?? '',
        }));
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los clientes',
        });
      },
    });
  }

  onClienteChange(idCliente: number | null): void {
    this.idClienteSeleccionado = idCliente;
    this.rows = [];
    if (!idCliente) return;

    this.loading = true;
    this.leadTimeService.getComercial(idCliente).subscribe({
      next: (data) => {
        this.rows = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los lead times del cliente',
        });
      },
    });
  }

  cargarOperativo(): void {
    this.loading = true;
    this.leadTimeService.getOperativo().subscribe({
      next: (data) => {
        this.rows = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los lead times operativos',
        });
      },
    });
  }

  seleccionarDia(row: LeadTimeRow, dia: number): void {
    row.dias = row.dias === dia ? null : dia;
  }

  highlight(texto: string): SafeHtml {
    const term = this.filtro.trim();
    if (!term) return texto;
    const re = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const html = texto.replace(re, '<mark>$1</mark>');
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  guardar(): void {
    if (this.isComercial && !this.idClienteSeleccionado) return;

    this.saving = true;
    const obs = this.isComercial
      ? this.leadTimeService.saveComercial(
          this.rows.map(r => ({ ...r, idcliente: this.idClienteSeleccionado! }))
        )
      : this.leadTimeService.saveOperativo(this.rows);

    obs.subscribe({
      next: (res) => {
        this.saving = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Guardado',
          detail: `Lead times guardados correctamente (${res.afectados} registros)`,
        });
      },
      error: () => {
        this.saving = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron guardar los lead times',
        });
      },
    });
  }

  private groupByDepartamento(rows: LeadTimeRow[]): Array<{
    departamento: string;
    iddepartamento: number;
    rows: LeadTimeRow[];
  }> {
    const map = new Map<number, { departamento: string; iddepartamento: number; rows: LeadTimeRow[] }>();
    for (const r of rows) {
      if (!map.has(r.iddepartamento)) {
        map.set(r.iddepartamento, {
          departamento: r.departamento,
          iddepartamento: r.iddepartamento,
          rows: [],
        });
      }
      map.get(r.iddepartamento)!.rows.push(r);
    }
    return Array.from(map.values());
  }
}

interface TableRow {
  row: LeadTimeRow;
  isFirstInGroup: boolean;
  rowspan: number;
}
