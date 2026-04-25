import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TraficoService } from '../trafico.service';

@Component({
    template: `
        <div class="w-full p-4">
            <h3 class="text-lg font-semibold mb-4">Manifiestos en Recepción - {{ titulo }}</h3>

            <div class="flex flex-wrap gap-2 mb-4 items-end">
                <div class="flex-1 min-w-[200px]">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Buscar por Manifiesto, Hoja de Ruta o Placa:</label>
                    <input
                        pInputText
                        type="text"
                        [(ngModel)]="busqueda"
                        (input)="filtrar()"
                        placeholder="Ej: MAN-001 o ABC-123"
                        class="w-full">
                </div>
                <div>
                    <button
                        pButton
                        label="Exportar Excel"
                        icon="pi pi-file-excel"
                        class="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-500 rounded-md"
                        [disabled]="registrosFiltrados.length === 0"
                        (click)="exportarExcel()">
                    </button>
                </div>
            </div>

            <p-table
                [value]="registrosFiltrados"
                [paginator]="true"
                [rows]="20"
                [rowsPerPageOptions]="[20, 40, 60, 120]"
                [scrollable]="true"
                scrollHeight="500px"
                styleClass="p-datatable-sm">

                <ng-template pTemplate="header">
                    <tr>
                        <th class="text-center">Manifiesto</th>
                        <th class="text-center">Hoja de Ruta</th>
                        <th class="text-center">F. Despacho</th>
                        <th class="text-center">Placa</th>
                        <th class="text-left">Origen</th>
                        <th class="text-left">Destino</th>
                        <th class="text-center">#OTs</th>
                        <th class="text-center">Peso Total</th>
                        <th class="text-center">Bultos</th>
                        <th class="text-center">Peso Vol.</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-row>
                    <tr>
                        <td class="text-center">{{ row.nummanifiesto  }}</td>
                        <td class="text-center">{{ row.numhojaruta  }}</td>
                        <td class="text-center">{{ row.fechaDespacho | date:'dd/MM/yyyy HH:mm' }}</td>
                        <td class="text-center">{{ row.placa  }}</td>
                        <td class="text-left">{{ row.origen  }}</td>
                        <td class="text-left">{{ row.destino  }}</td>
                        <td class="text-center">{{ row.cantidadOTs }}</td>
                        <td class="text-center">{{ row.pesoTotal | number:'1.0-2' }}</td>
                        <td class="text-center">{{ row.bultoTotal }}</td>
                        <td class="text-center">{{ row.pesoVolTotal | number:'1.0-2' }}</td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="footer">
                    <tr *ngIf="registrosFiltrados.length > 0">
                        <td colspan="5" class="text-right font-semibold">Totales:</td>
                        <td class="text-center font-semibold">{{ totalOTs }}</td>
                        <td class="text-center font-semibold">{{ totalPeso | number:'1.0-2' }}</td>
                        <td class="text-center font-semibold">{{ totalBultos }}</td>
                        <td class="text-center font-semibold">{{ totalPesoVol | number:'1.0-2' }}</td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <tr>
                        <td colspan="9" class="text-center">No se encontraron registros</td>
                    </tr>
                </ng-template>
            </p-table>
        </div>
    `,
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, InputTextModule]
})
export class ModalManifiestoEstacionComponent implements OnInit {

    registros: any[] = [];
    registrosFiltrados: any[] = [];
    titulo: string = '';
    busqueda: string = '';

    get totalOTs(): number { return this.registrosFiltrados.reduce((s, r) => s + (r.cantidadOTs ?? 0), 0); }
    get totalPeso(): number { return this.registrosFiltrados.reduce((s, r) => s + (r.pesoTotal ?? 0), 0); }
    get totalBultos(): number { return this.registrosFiltrados.reduce((s, r) => s + (r.bultoTotal ?? 0), 0); }
    get totalPesoVol(): number { return this.registrosFiltrados.reduce((s, r) => s + (r.pesoVolTotal ?? 0), 0); }

    constructor(
        private traficoService: TraficoService,
        public ref: DynamicDialogRef,
        public config: DynamicDialogConfig
    ) {
        this.titulo = config.data?.titulo || 'Manifiestos en Recepción';
    }

    ngOnInit() {
        const idProvincia = this.config.data?.idProvincia;
        this.traficoService.GetResumenOrdenesxManifiestoEstacion(idProvincia).subscribe({
            next: (data) => {
                this.registros = data;
                this.registrosFiltrados = data;
            },
            error: () => {
                this.registros = [];
                this.registrosFiltrados = [];
            }
        });
    }

    filtrar() {
        if (!this.busqueda.trim()) {
            this.registrosFiltrados = this.registros;
            return;
        }
        const b = this.busqueda.trim().toLowerCase();
        this.registrosFiltrados = this.registros.filter(r =>
            (r.nummanifiesto && r.nummanifiesto.toLowerCase().includes(b)) ||
            (r.numhojaruta   && r.numhojaruta.toLowerCase().includes(b))   ||
            (r.placa         && r.placa.toLowerCase().includes(b))
        );
    }

    exportarExcel(): void {
        if (!this.registrosFiltrados.length) return;

        import('xlsx').then((xlsx: any) => {
            const XLSX: any = xlsx?.default ?? xlsx;
            const exportData = this.registrosFiltrados.map(r => ({
                'Manifiesto':   r.nummanifiesto  || '-',
                'Hoja de Ruta': r.numhojaruta    || '-',
                'Placa':        r.placa          || '-',
                'Origen':    r.origen      || '-',
                'Destino':     r.destino       || '-',
                '#OTs':         r.cantidadOTs    ?? 0,
                'Peso Total':   r.pesoTotal      ?? 0,
                'Bultos':       r.bultoTotal     ?? 0,
                'Peso Vol.':    r.pesoVolTotal   ?? 0,
            }));
            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
            const buf: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            import('file-saver').then((FileSaver) => {
                const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
                FileSaver.default.saveAs(blob, `ManifiestosRecepcion_${new Date().getTime()}.xlsx`);
            });
        });
    }
}
