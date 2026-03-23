import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TraficoService } from '../trafico.service';

interface OrdenTrabajoDetalle {
    idordentrabajo: number;
    numcp: string;
    idestado: number;
    peso: number;
    bulto: number;
    fecharegistro: string;
    idestacion: number;
    estacion: string;
    idmanifiesto: number;
    idtipooperacion: number;
    observada: number;
    destino_distrito: string;
    destino_provincia: string;
    destino_departamento: string;
    estado?: string;
}

@Component({
    template: `
        <div class="w-full p-4">
            <h3 class="text-lg font-semibold mb-4">Órdenes de Trabajo - {{ titulo }}</h3>
            
            <!-- Buscador y Botón Excel -->
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
                #dt
                [value]="ordenesFiltradas" 
                [columns]="cols"
                [paginator]="true" 
                [rows]="20"
                [rowsPerPageOptions]="[20, 40, 60, 120]"
                [responsive]="true"
                [scrollable]="true"
                scrollHeight="500px"
                styleClass="p-datatable-sm">
                
                <ng-template pTemplate="header" let-columns>
                    <tr>
                        <th *ngFor="let col of columns" [pSortableColumn]="col.field" class="text-center">
                            {{ col.header }}
                        </th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-rowData>
                    <tr>
                        <td class="text-center">{{ rowData.numcp }}</td>
                       
                        <td class="text-left">{{ rowData.destino_provincia }}</td>
                        <td class="text-left">{{ rowData.cliente }}</td>
                        
                        <td class="text-center">{{ rowData.peso | number:'1.0-2' }}</td>
                        <td class="text-center">{{ rowData.bulto }}</td>
                        <td class="text-center">{{ formatFecha(rowData.fecharegistro) }}</td>
                        <td class="text-center">{{ rowData.estacion }}</td>
                        <td class="text-center">{{ rowData.idmanifiesto || '-' }}</td>
                        <td class="text-center">{{ rowData.estado }}</td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <tr>
                        <td [attr.colspan]="cols.length" class="text-center">
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
export class ModalOtEstacionComponent implements OnInit {
    ordenes: OrdenTrabajoDetalle[] = [];
    ordenesFiltradas: OrdenTrabajoDetalle[] = [];
    cols: any[] = [];
    titulo: string = '';
    busquedaNumero: string = '';

    constructor(
        private traficoService: TraficoService,
        public ref: DynamicDialogRef,
        public config: DynamicDialogConfig
    ) {
        this.titulo = config.data?.titulo || 'Detalle de Órdenes';
    }

    ngOnInit() {
        this.cols = [
            { field: 'numcp', header: 'Número OT', width: '120px' },
            { field: 'destino_provincia', header: 'Destino - Provincia', width: '150px' },
            { field: 'cliente', header: 'Cliente', width: '150px' },
            { field: 'peso', header: 'Peso', width: '100px' },
            { field: 'bulto', header: 'Bultos', width: '100px' },
            { field: 'fecharegistro', header: 'Fecha Registro', width: '150px' },
            { field: 'estacion', header: 'Estación', width: '150px' },
            { field: 'idmanifiesto', header: 'Manifiesto', width: '100px' },
            { field: 'estado', header: 'estado', width: '100px' }
        ];

        const idestacion = this.config.data?.idestacion;
        const estados = this.config.data?.estados;

        if (idestacion && estados) {
            this.traficoService.ObtenerOrdenTrabajoDetallePorEstacionEstado(idestacion, estados)
                .subscribe({
                    next: (data) => {
                        this.ordenes = data;
                        this.ordenesFiltradas = data;
                    },
                    error: (error) => {
                        console.error('Error al cargar las órdenes:', error);
                        this.ordenes = [];
                        this.ordenesFiltradas = [];
                    }
                });
        }
    }

    filtrarOrdenes() {
        if (!this.busquedaNumero || this.busquedaNumero.trim() === '') {
            this.ordenesFiltradas = this.ordenes;
            return;
        }

        const busqueda = this.busquedaNumero.trim().toLowerCase();
        this.ordenesFiltradas = this.ordenes.filter(ot => 
            (ot.numcp && ot.numcp.toLowerCase().includes(busqueda)) ||
            (ot.destino_provincia && ot.destino_provincia.toLowerCase().includes(busqueda))
        );
    }

    exportarExcel(): void {
        if (!this.ordenesFiltradas || this.ordenesFiltradas.length === 0) {
            return;
        }

        import('xlsx').then((xlsx: any) => {
            const XLSX: any = xlsx?.default ?? xlsx;
            const exportData = this.ordenesFiltradas.map(ot => ({
                'Número OT': ot.numcp,
                'Destino - Departamento': ot.destino_departamento || '-',
                'Destino - Provincia': ot.destino_provincia || '-',
                'Destino - Distrito': ot.destino_distrito || '-',
                'Peso': ot.peso || 0,
                'Bultos': ot.bulto || 0,
                'Fecha Registro': this.formatFecha(ot.fecharegistro),
                'Estación': ot.estacion || '-',
                'Manifiesto': ot.idmanifiesto || '-',
                'Estado': ot.estado || '-'
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

    formatFecha(fecha: string | Date): string {
        if (!fecha) return '-';
        const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
        if (isNaN(date.getTime())) return fecha.toString();
        return date.toLocaleString('es-PE', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

