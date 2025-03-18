import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { OrdenTransporte } from '../../recepcion/ordentransporte/ordentransporte.types';
import { OrdenTransporteService } from '../../recepcion/ordentransporte/ordentransporte.service';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DespachoService } from '../despacho.service';

@Component({
    template: `
            <div class="w-full p-4 bg-white shadow-lg rounded-2xl">
            <!-- Botón de Confirmación -->
            <div class="flex justify-start mb-4">
            <p-button severity="primary"
                title="Confirmar" 
                icon="pi pi-check" 
                label="Confirmar" 
                (click)="confirmar()">
            </p-button>
            </div>

            <!-- Tabla -->
            <p-table 
            #dt 
            [value]="ordenes2" 
            [columns]="cols"
            class="rounded-lg overflow-hidden shadow-md"
            editMode="row"
            dataKey="idordentrabajo"
            selectionMode="multiple"
            [(selection)]="selectedOTs"
            [paginator]="true" 
            [rows]="10"
            [rowsPerPageOptions]="[20,40,60,120]"
            [resizableColumns]="true" 
            [responsive]="true"
            paginatorPosition="bottom"
            tableStyle="min-width: 100%">

            <!-- Definición de columnas -->
            <ng-template pTemplate="colgroup" let-cols>
                <colgroup>
                    <col *ngFor="let col of cols" [ngStyle]="{'width': col.width}">
                </colgroup>
            </ng-template>

            <!-- Cabecera -->
            <ng-template pTemplate="header" let-cols>
                <tr class="bg-gray-100 text-gray-700">
                    <th class="p-2 text-center">
                        <p-tableHeaderCheckbox></p-tableHeaderCheckbox>
                    </th>
                    <th *ngFor="let col of cols" class="p-2 text-center">
                        {{ col.header }}
                    </th>
                </tr>
                <tr>
                    <th colspan="4" class="p-2">
                        <input pInputText 
                            type="text" 
                            (input)="dt.filter($event.target.value, 'numcp', 'contains')" 
                            placeholder="Buscar Número de OT" 
                            class="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300">
                    </th>
                </tr>
            </ng-template>

            <!-- Cuerpo de la tabla -->
            <ng-template pTemplate="body" let-rowData>
                <tr class="border-b hover:bg-gray-100 transition-all">
                    <td class="p-2 text-center">
                        <p-tableCheckbox [value]="rowData"></p-tableCheckbox>
                    </td>
                    <td class="p-2 text-center font-semibold">{{ rowData.nummanifiesto }}</td>
                    <td class="p-2 text-center">{{ rowData.numcp }}</td>
                    <td class="p-2 text-left">{{ rowData.provinciaDestino }}</td>
                    <td class="p-2 text-left">{{ rowData.remitente }}</td>
                    <td class="p-2 text-center">{{ rowData.tipooperacion }}</td>
                    <td class="p-2 text-left">{{ rowData.destinatario }}</td>
                    <td class="p-2 text-left">{{ rowData.peso }}</td>
                    <td class="p-2 text-left">{{ rowData.bulto }}</td>
                </tr>
            </ng-template>
            </p-table>
            </div>

   
    `,
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ToastModule,
        TableModule,
        ButtonModule,
        InputTextModule
    ]
})
export class ArmadoValijaModalComponent implements OnInit {
    model: any = {};
    ordenes2: OrdenTransporte[] = [];
    mani: any = [];
    numhojaruta: string;
    cols: any[];
    selectedOTs: OrdenTransporte[] = [];
    manifiestos: boolean;

    constructor(
        private ordenService: OrdenTransporteService,
        private DespachoService: DespachoService,
        public messageService: MessageService,
        public ref: DynamicDialogRef,
        public config: DynamicDialogConfig
    ) {
        this.numhojaruta = config.data?.hojaruta || '';
        this.mani = config.data?.manifiestos || [];
    }

    ngOnInit() {
        this.cols = [
            { header: 'MANIFIESTO', field: 'nummanifiesto', width: '105px' },
            { header: 'N° OT', field: 'numcp', width: '105px' },
            { header: 'PROVINCIA', field: 'provinciaDestino', width: '180px' },
            { header: 'REMITENTE', field: 'remitente', width: '180px' },
            { header: 'TIPO DE OPERACIÓN', field: 'tipooperacion', width: '100px' },
            { header: 'DESTINATARIO', field: 'destinatario', width: '180px' },
            { header: 'PESO', field: 'peso', width: '180px' },
            { header: 'BULTO', field: 'bulto', width: '180px' }
        ];

        this.ordenService.getAllOrdersForDespachoAll(this.numhojaruta, 2).subscribe(list => {
            this.ordenes2 = list ;  //.filter(x => x.valija === false || x.valija === null);

            if (this.ordenes2.length === 0) {
                this.manifiestos = true;
            }
        });
    }

    confirmar() {
        if (this.selectedOTs.length === 0) {
            this.messageService.add({ severity: 'error', summary: 'Confirmar Estiba', detail: 'Debe seleccionar al menos una OT.' });
            return;
        }

        this.DespachoService.confirmarValijaxOTs(this.selectedOTs).subscribe(x => {
            if (x.terminado) {
                this.messageService.add({ severity: 'success', summary: 'Confirmar Estiba', detail: 'Se ha culminado con la carga del camión, ya puede imprimir los MANIFIESTOS' });
            }

            this.ordenService.getAllOrdersForDespachoAll(this.numhojaruta, 2).subscribe(list => {
                this.ordenes2 = list ;  //.filter(x => x.valija === false || x.valija === null);
    
                if (this.ordenes2.length === 0) {
                    this.manifiestos = true;
                }
            });
        });
    }

    imprimirManifiesto() {
        this.mani.forEach(list => {
            const url = `http://104.36.166.65/webreports/manifiesto.aspx?idmanifiesto=${list.idmanifiesto}`;
            window.open(url);
        });
    }
}
