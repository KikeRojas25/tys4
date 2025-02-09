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

@Component({
    template: `
        <div class="mb-3 col-md-12">
            <!-- Botón de Confirmación -->
            <div class="row col-md-12 mb-2">
                <div class="col-md-2">
                    <button type="button" pButton class="p-button-rounded p-button-text btn-primary" 
                        title="Confirmar" icon="fa fa-check" label="Confirmar" (click)="confirmar()">
                    </button>
                </div>
            </div>

            <!-- Tabla -->
            <p-table 
                #dt 
                [value]="ordenes2" 
                [columns]="cols" 
                [style]="{width: '100%'}"
                editMode="row"
                dataKey="idordentrabajo"
                selectionMode="multiple"
                [(selection)]="selectedOTs"
                [paginator]="true" 
                [rows]="10"
                [rowsPerPageOptions]="[20,40,60,120]"
                [resizableColumns]="true" 
                [responsive]="true">

                <!-- Definición de columnas -->
                <ng-template pTemplate="colgroup" let-cols>
                    <colgroup>
                        <col *ngFor="let col of cols" [ngStyle]="{'width': col.width}">
                    </colgroup>
                </ng-template>

                <!-- Cabecera -->
                <ng-template pTemplate="header" let-cols>
                    <tr>
                        <th style="text-align:center;width: 4rem">
                            <p-tableHeaderCheckbox></p-tableHeaderCheckbox>
                        </th>
                        <th *ngFor="let col of cols" [ngStyle]="{'width': col.width}" pResizableColumn>
                            {{ col.header }}
                        </th>
                    </tr>
                    <tr>
                        <th colspan="4">
                            <input pInputText type="text" (input)="dt.filter($event.target.value, 'numcp', 'contains')" 
                                placeholder="Número de OT" class="p-column-filter">
                        </th>
                    </tr>
                </ng-template>

                <!-- Cuerpo de la tabla -->
                <ng-template pTemplate="body" let-rowData>
                    <tr>
                        <td class="ui-resizable-column" style="text-align:center;">
                            <p-tableCheckbox [value]="rowData"></p-tableCheckbox>
                        </td>
                        <td class="ui-resizable-column" style="text-align:center;">{{ rowData.nummanifiesto }}</td>
                        <td class="ui-resizable-column" style="text-align:center;">{{ rowData.numcp }}</td>
                        <td class="ui-resizable-column" style="text-align:left;">{{ rowData.provinciaDestino }}</td>
                        <td class="ui-resizable-column" style="text-align:left;">{{ rowData.remitente }}</td>
                        <td class="ui-resizable-column" style="text-align:center;">{{ rowData.tipooperacion }}</td>
                        <td class="ui-resizable-column" style="text-align:left;">{{ rowData.destinatario }}</td>
                        <td class="ui-resizable-column" style="text-align:left;">{{ rowData.peso }}</td>
                        <td class="ui-resizable-column" style="text-align:left;">{{ rowData.bulto }}</td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <!-- Mensajes Toast -->
        <p-toast></p-toast>
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

        this.ordenService.getAllOrdersForDespachoAll(this.numhojaruta).subscribe(list => {
            this.ordenes2 = list.filter(x => x.valija === false || x.valija === null);

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

        this.ordenService.confirmarValijaxOTs(this.selectedOTs).subscribe(x => {
            if (x.terminado) {
                this.messageService.add({ severity: 'success', summary: 'Confirmar Estiba', detail: 'Se ha culminado con la carga del camión, ya puede imprimir los MANIFIESTOS' });
            }

            this.ordenService.getAllOrdersForDespacho(this.numhojaruta).subscribe(list => {
                this.ordenes2 = list;
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
