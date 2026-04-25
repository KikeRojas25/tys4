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
            <div class="flex flex-wrap gap-2 mb-4 items-end">
                <div class="flex-1 min-w-[200px]">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Buscar por Número OT, Distrito o Estado:</label>
                    <input
                        pInputText
                        type="text"
                        [(ngModel)]="busqueda"
                        (input)="filtrar()"
                        placeholder="Ej: 100-866388 o LIMA"
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
                        <th class="text-center">Número OT</th>
                        <th class="text-center">F. Registro</th>
                        <th class="text-left">Provincia</th>
                        <th class="text-left">Distrito</th>
                        <th class="text-center">Peso</th>
                        <th class="text-center">Bultos</th>
                        <th class="text-center">Peso Vol.</th>
                        <th class="text-center">Estado</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-row>
                    <tr>
                        <td class="text-center">{{ row.numcp }}</td>
                        <td class="text-center">{{ formatFecha(row.fecharegistro) }}</td>
                        <td class="text-left">{{ row.provincia || '-' }}</td>
                        <td class="text-left">{{ row.distrito || '-' }}</td>
                        <td class="text-center">{{ row.peso | number:'1.0-2' }}</td>
                        <td class="text-center">{{ row.bulto }}</td>
                        <td class="text-center">{{ row.pesovol | number:'1.0-2' }}</td>
                        <td class="text-center">{{ row.estado }}</td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <tr>
                        <td colspan="8" class="text-center">No se encontraron registros</td>
                    </tr>
                </ng-template>
            </p-table>
        </div>
    `,
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, InputTextModule]
})
export class ModalEntregaLocalEstacionComponent implements OnInit {

    registros: any[] = [];
    registrosFiltrados: any[] = [];
    titulo: string = '';
    busqueda: string = '';

    constructor(
        private traficoService: TraficoService,
        public ref: DynamicDialogRef,
        public config: DynamicDialogConfig
    ) {
        this.titulo = config.data?.titulo || 'Detalle de Entrega Local';
    }

    ngOnInit() {
        const idProvincia = this.config.data?.idProvincia;
        this.traficoService.GetDetalleOrdenesxEntregaLocal(idProvincia).subscribe({
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
            (r.numcp    && r.numcp.toLowerCase().includes(b))    ||
            (r.distrito && r.distrito.toLowerCase().includes(b)) ||
            (r.estado   && r.estado.toLowerCase().includes(b))
        );
    }

    exportarExcel(): void {
        if (!this.registrosFiltrados.length) return;

        import('xlsx').then((xlsx: any) => {
            const XLSX: any = xlsx?.default ?? xlsx;
            const exportData = this.registrosFiltrados.map(r => ({
                'Número OT':  r.numcp,
                'F. Registro': this.formatFecha(r.fecharegistro),
                'Provincia':  r.provincia  || '-',
                'Distrito':   r.distrito   || '-',
                'Peso':       r.peso       ?? 0,
                'Bultos':     r.bulto      ?? 0,
                'Peso Vol.':  r.pesovol    ?? 0,
                'Estado':     r.estado,
            }));
            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
            const buf: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            import('file-saver').then((FileSaver) => {
                const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
                FileSaver.default.saveAs(blob, `EntregaLocal_${new Date().getTime()}.xlsx`);
            });
        });
    }

    formatFecha(fecha: string | Date): string {
        if (!fecha) return '-';
        const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
        if (isNaN(date.getTime())) return fecha.toString();
        return date.toLocaleString('es-PE', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    }
}
