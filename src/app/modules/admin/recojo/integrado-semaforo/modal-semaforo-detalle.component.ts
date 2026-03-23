import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

interface OtDetalleMock {
  numcp: string;
  destino_provincia: string;
  cliente: string;
  peso: number;
  bulto: number;
  fecharegistro: string;
  estacion: string;
  idmanifiesto: number;
  estado: string;
}

@Component({
  template: `
    <div class="w-full p-4">
      <h3 class="text-lg font-semibold mb-2">{{ titulo }}</h3>
      <p class="text-sm text-gray-600 mb-4">Órdenes de Trabajo - {{ subtitulo }}</p>

      <div class="flex flex-wrap gap-2 mb-4 items-end">
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">Buscar por Número de Orden o Provincia:</label>
          <input
            pInputText
            type="text"
            [(ngModel)]="busquedaNumero"
            (input)="filtrarOrdenes()"
            placeholder="Ej: 100-866388 o LIMA"
            class="w-full">
        </div>
        <div>
          <button
            pButton
            label="Exportar Excel"
            icon="pi pi-file-excel"
            iconPos="left"
            class="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-500 rounded-md"
            [disabled]="ordenesFiltradas.length === 0"
            (click)="exportarExcel()">
          </button>
        </div>
      </div>

      <p-table
        [value]="ordenesFiltradas"
        [columns]="cols"
        [paginator]="true"
        [rows]="20"
        [rowsPerPageOptions]="[20, 40, 60, 120]"
        [responsive]="true"
        [scrollable]="true"
        scrollHeight="500px"
        styleClass="p-datatable-sm p-datatable-striped">

        <ng-template pTemplate="header" let-columns>
          <tr class="bg-blue-700 text-white">
            <th *ngFor="let col of columns" [pSortableColumn]="col.field" class="text-center px-4 py-2">
              {{ col.header }}
            </th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-rowData>
          <tr>
            <td class="text-center">{{ rowData.numcp }}</td>
            <td class="text-left">{{ rowData.destino_provincia }}</td>
            <td class="text-left">{{ rowData.cliente }}</td>
            <td class="text-center">{{ rowData.peso | number:'1.0-0' }}</td>
            <td class="text-center">{{ rowData.bulto }}</td>
            <td class="text-center">{{ rowData.fecharegistro }}</td>
            <td class="text-center">{{ rowData.estacion }}</td>
            <td class="text-center">{{ rowData.idmanifiesto }}</td>
            <td class="text-center">{{ rowData.estado }}</td>
          </tr>
        </ng-template>

        <ng-template pTemplate="emptymessage">
          <tr>
            <td [attr.colspan]="cols.length" class="text-center py-8">
              No se encontraron órdenes de trabajo
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
    InputTextModule
  ]
})
export class ModalSemaforoDetalleComponent implements OnInit {
  ordenes: OtDetalleMock[] = [];
  ordenesFiltradas: OtDetalleMock[] = [];
  cols: { field: string; header: string }[] = [];
  titulo = '';
  subtitulo = '';
  busquedaNumero = '';

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {
    this.titulo = config.data?.titulo || 'Detalle de Órdenes';
    this.subtitulo = config.data?.titulo || 'Detalle';
  }

  ngOnInit(): void {
    this.cols = [
      { field: 'numcp', header: 'Número OT' },
      { field: 'destino_provincia', header: 'Destino - Provincia' },
      { field: 'cliente', header: 'Cliente' },
      { field: 'peso', header: 'Peso' },
      { field: 'bulto', header: 'Bultos' },
      { field: 'fecharegistro', header: 'Fecha Registro' },
      { field: 'estacion', header: 'Estación' },
      { field: 'idmanifiesto', header: 'Manifiesto' },
      { field: 'estado', header: 'Estado' }
    ];

    const cliente = this.config.data?.cliente || 'Cliente';
    const tipo = this.config.data?.tipo || 'atiempo';
    const cantidad = this.config.data?.cantidad || 5;

    this.ordenes = this.generarDatosFicticios(cliente, tipo, cantidad);
    this.ordenesFiltradas = [...this.ordenes];
  }

  private generarDatosFicticios(cliente: string, tipo: string, cantidad: number): OtDetalleMock[] {
    const provincias = ['LIMA', 'AREQUIPA', 'CALLAO', 'SAN ROMAN', 'MARISCAL NIETO', 'CUSCO', 'TRUJILLO'];
    const estados: Record<string, string> = {
      atiempo: 'Entregado',
      porvencer: 'En Ruta',
      fueratiempo: 'Fuera de Tiempo',
      observadas: 'Observada'
    };
    const estado = estados[tipo] || 'En Ruta';

    const base = 375900 + Math.floor(Math.random() * 1000);
    const result: OtDetalleMock[] = [];
    for (let i = 0; i < cantidad; i++) {
      result.push({
        numcp: `100-${891800 + i}`,
        destino_provincia: provincias[i % provincias.length],
        cliente,
        peso: Math.floor(Math.random() * 250) + 1,
        bulto: Math.floor(Math.random() * 6) + 1,
        fecharegistro: this.formatFecha(new Date(Date.now() - (i + 1) * 86400000)),
        estacion: String(base + i),
        idmanifiesto: base + i,
        estado
      });
    }
    return result;
  }

  filtrarOrdenes(): void {
    if (!this.busquedaNumero || this.busquedaNumero.trim() === '') {
      this.ordenesFiltradas = [...this.ordenes];
      return;
    }
    const busqueda = this.busquedaNumero.trim().toLowerCase();
    this.ordenesFiltradas = this.ordenes.filter(ot =>
      (ot.numcp && ot.numcp.toLowerCase().includes(busqueda)) ||
      (ot.destino_provincia && ot.destino_provincia.toLowerCase().includes(busqueda))
    );
  }

  exportarExcel(): void {
    if (!this.ordenesFiltradas || this.ordenesFiltradas.length === 0) return;
    import('xlsx').then((xlsx: any) => {
      const XLSX: any = xlsx?.default ?? xlsx;
      const exportData = this.ordenesFiltradas.map(ot => ({
        'Número OT': ot.numcp,
        'Destino - Provincia': ot.destino_provincia,
        'Cliente': ot.cliente,
        'Peso': ot.peso,
        'Bultos': ot.bulto,
        'Fecha Registro': ot.fecharegistro,
        'Estación': ot.estacion,
        'Manifiesto': ot.idmanifiesto,
        'Estado': ot.estado
      }));
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, 'OrdenesTrabajo');
    });
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    import('file-saver').then((FileSaver) => {
      const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
      const EXCEL_EXTENSION = '.xlsx';
      const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
      FileSaver.default.saveAs(data, `${fileName}_${new Date().getTime()}${EXCEL_EXTENSION}`);
    });
  }

  private formatFecha(date: Date): string {
    return date.toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
