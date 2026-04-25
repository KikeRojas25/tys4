import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ComercialService } from '../../comercial/comercial.service';
import { SemaforoIntegradoDetalleResult } from '../recojo.types';

@Component({
  template: `
    <div class="w-full p-4">
      <p class="text-sm text-gray-600 mb-4">{{ subtitulo }}</p>

      <div class="flex flex-wrap gap-2 mb-4 items-end">
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">Buscar por N° OT o provincia:</label>
          <input pInputText type="text" [(ngModel)]="busqueda" (input)="filtrar()"
                 placeholder="Ej: OR-000123 o AREQUIPA" class="w-full" />
        </div>
        <div>
          <button pButton label="Exportar Excel" icon="pi pi-file-excel"
                  class="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-500 rounded-md"
                  [disabled]="filtradas.length === 0"
                  (click)="exportarExcel()">
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="flex justify-center py-12">
        <p-progressSpinner strokeWidth="4" styleClass="w-12 h-12"></p-progressSpinner>
      </div>

      <!-- Tabla -->
      <p-table *ngIf="!loading"
        [value]="filtradas"
        [paginator]="true"
        [rows]="20"
        [rowsPerPageOptions]="[20, 40, 60, 120]"
        [scrollable]="true"
        scrollHeight="460px"
        styleClass="p-datatable-sm p-datatable-striped">

        <ng-template pTemplate="header">
          <tr class="bg-blue-700 text-white">
            <th class="text-center px-3 py-2">N° OT</th>
            <th class="text-left   px-3 py-2">Destino / Provincia</th>
            <th class="text-center px-3 py-2">Peso</th>
            <th class="text-center px-3 py-2">Bultos</th>
            <th class="text-center px-3 py-2">Fecha Recojo</th>
            <th class="text-left   px-3 py-2">Estación Destino</th>
            <th class="text-center px-3 py-2">Manifiesto</th>
            <th class="text-center px-3 py-2">Estado</th>
            <th class="text-center px-3 py-2">Días Comprometidos</th>
            <th class="text-center px-3 py-2">Días Operativos</th>
            <th class="text-center px-3 py-2">Días Transcurridos</th>
            <th class="text-center px-3 py-2">Días Restantes</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-row>
          <tr>
            <td class="text-center font-medium text-sm">{{ row.numcp }}</td>
            <td class="text-left text-sm">{{ row.destino_provincia }}</td>
            <td class="text-center text-sm">{{ row.peso | number:'1.0-2' }}</td>
            <td class="text-center text-sm">{{ row.bulto }}</td>
            <td class="text-center text-sm">{{ row.fecharecojo | date:'dd/MM/yyyy' }}</td>
            <td class="text-left text-sm">{{ row.estacion || '—' }}</td>
            <td class="text-center text-sm">{{ row.idmanifiesto || '—' }}</td>
            <td class="text-center text-sm">{{ row.estado || row.idestado }}</td>
            <td class="text-center text-sm font-semibold">{{ row.dias_comprometidos }}</td>
            <td class="text-center text-sm">{{ row.dias_operativos }}</td>
            <td class="text-center text-sm">{{ row.dias_transcurridos }}</td>
            <td class="text-center text-sm"
                [class.text-red-600]="row.dias_restantes < 0"
                [class.font-bold]="row.dias_restantes < 0">
              {{ row.dias_restantes }}
            </td>
          </tr>
        </ng-template>

        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="12" class="text-center py-8 text-gray-500">
              No se encontraron órdenes.
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    ProgressSpinnerModule,
  ]
})
export class ModalSemaforoDetalleComponent implements OnInit {
  ordenes:  SemaforoIntegradoDetalleResult[] = [];
  filtradas: SemaforoIntegradoDetalleResult[] = [];
  busqueda = '';
  loading  = false;
  titulo   = '';
  subtitulo = '';

  private idcliente!: number;
  private tipo!: 'atiempo' | 'fueratiempo';

  constructor(
    public  ref:    DynamicDialogRef,
    public  config: DynamicDialogConfig,
    private comercialService: ComercialService
  ) {
    this.titulo    = config.data?.titulo    || 'Detalle de Órdenes';
    this.subtitulo = config.data?.titulo    || 'Detalle';
    this.idcliente = config.data?.idcliente;
    this.tipo      = config.data?.tipo;     // 'atiempo' | 'fueratiempo'
  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    if (!this.idcliente || !this.tipo) return;
    this.loading = true;
    this.comercialService.getSemaforoIntegradoDetalle(this.idcliente, this.tipo).subscribe({
      next: (data) => {
        this.ordenes   = data ?? [];
        this.filtradas = [...this.ordenes];
        this.loading   = false;
      },
      error: () => {
        this.ordenes   = [];
        this.filtradas = [];
        this.loading   = false;
      }
    });
  }

  filtrar(): void {
    const q = this.busqueda.trim().toLowerCase();
    if (!q) { this.filtradas = [...this.ordenes]; return; }
    this.filtradas = this.ordenes.filter(r =>
      (r.numcp             ?? '').toLowerCase().includes(q) ||
      (r.destino_provincia ?? '').toLowerCase().includes(q)
    );
  }

  exportarExcel(): void {
    if (!this.filtradas.length) return;
    import('xlsx').then((xlsx: any) => {
      const XLSX = xlsx?.default ?? xlsx;
      const data = this.filtradas.map(r => ({
        'N° OT':               r.numcp,
        'Destino / Provincia': r.destino_provincia,
        'Peso':                r.peso,
        'Bultos':              r.bulto,
        'Fecha Recojo':        r.fecharecojo,
        'Estación Destino':    r.estacion,
        'Manifiesto':          r.idmanifiesto,
        'Estado':              r.estado ?? r.idestado,
        'Días Comprometidos':  r.dias_comprometidos,
        'Días Operativos':     r.dias_operativos,
        'Días Transcurridos':  r.dias_transcurridos,
        'Días Restantes':      r.dias_restantes,
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
      const buf: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      import('file-saver').then(fs => {
        const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
        (fs.default ?? fs).saveAs(blob, `Semaforo_${this.tipo}_${Date.now()}.xlsx`);
      });
    });
  }
}
