import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { PlanningService } from '../planning.service';
import { OrdenTransporte } from '../../recepcion/ordentransporte/ordentransporte.types';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TraficoService } from '../../trafico/trafico.service';

@Component({
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        DropdownModule,
        ButtonModule,
        ToastModule
    ],
    providers: [MessageService],
    template: `
        <div class="p-6">

            <!-- Filtros y Botón -->
            <div class="flex flex-row items-center justify-between mb-4">
                <!-- Dropdown para seleccionar agencia -->
                <div class="flex flex-col">
                    <label for="agencia" class="text-gray-700 font-semibold mb-1">Seleccionar Agencia:</label>
                    <p-dropdown 
                        id="agencia"
                        [options]="agencias"
                        [(ngModel)]="selectedAgencia"
                        placeholder="Seleccione una agencia"
                        class="w-64"
                        filter="true">
                        <ng-template let-item pTemplate="selectedItem">
                              <span style="vertical-align:left;">{{item.label}}</span>
                          </ng-template>
                    </p-dropdown>
                </div>

                <!-- Botón para enviar selección -->
                <p-button 
                    label="Enviar Selección" 
                    icon="pi pi-check"
                    (click)="enviarSeleccion()" 
                    severity="success"
                    class="mt-5">
                </p-button>
            </div>

            <!-- Tabla de órdenes -->
            <p-table [columns]="cols"
                     [value]="ordenes2"
                     [style]="{width:'100%'}"
                     dataKey="idordentrabajo"
                     [rowsPerPageOptions]="[20,40,60,120]"
                     [paginator]="true"
                     [(selection)]="selectedOrdenes"
                     selectionMode="multiple"
                     [rows]="10"
                     [resizableColumns]="true"
                     [responsive]="true">
            
                <ng-template pTemplate="colgroup" let-columns>
                    <colgroup>
                        <col *ngFor="let col of columns" [ngStyle]="{'width': col.width}">
                    </colgroup>
                </ng-template>

                <ng-template pTemplate="header" let-columns>
                    <tr>
                        <th style="width: 3rem">
                            <p-tableHeaderCheckbox></p-tableHeaderCheckbox>
                        </th>
                        <th *ngFor="let col of columns" [pSortableColumn]="col.field">
                            {{ col.header }}
                        </th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-rowData>
                    <tr [pSelectableRow]="rowData">
                        <td>
                            <p-tableCheckbox [value]="rowData"></p-tableCheckbox>
                        </td>
                        <td class="text-center"> {{ rowData.numcp }} </td>
                        <td class="text-left"> {{ rowData.remitente }} </td>
                        <td class="text-center"> {{ rowData.fecharecojo | date:'dd/MM/yyyy' }} </td>
                        <td class="text-left"> {{ rowData.destinatario }} </td>
                        <td class="text-left"> S/. {{ rowData.subtotal }} </td>
                        <td class="text-left"> {{ rowData.peso }} </td>
                        <td class="text-left"> {{ rowData.bulto }} </td>
                    </tr>
                </ng-template>

            </p-table>

        </div>

      
    `
})
export class VerDetalleOrdenxDepartamentoModalComponent implements OnInit {

    model: any = {};
    ordenes2: OrdenTransporte[] = [];
    iddepartamento: number;
    idestacionorigen: number;
    cols: any[];
    agencias: any[] = [];
    selectedAgencia: any;
    selectedOrdenes: OrdenTransporte[] = [];

    constructor(
        private ordenService: PlanningService,
        public ref: DynamicDialogRef,
        public config: DynamicDialogConfig,
        private traficoService: TraficoService,
        private messageService: MessageService
    ) {
        this.iddepartamento = config.data.iddepartamento;
        this.idestacionorigen = config.data.idestacionorigen;
    }

    ngOnInit() {
        this.cols = [
            { header: 'N° OT', field: 'idordentrabajo', width: '105px' },
            { header: 'REMITENTE', field: 'remitente', width: '180px' },
            { header: 'FEC. RECOJO', field: 'fecharecojo', width: '100px' },
            { header: 'DESTINATARIO', field: 'destinatario', width: '180px' },
            { header: 'SUBTOTAL', field: 'subtotal', width: '60px' },
            { header: 'PESO', field: 'peso', width: '60px' },
            { header: 'BULTO', field: 'bulto', width: '60px' }
        ];

        // Cargar órdenes
        this.ordenService.GetAllOrdersDetailDeparment(this.idestacionorigen, this.iddepartamento)
            .subscribe(list => {
                this.ordenes2 = list;
                console.log('Órdenes cargadas:', this.ordenes2);
            });

        // Simulación de agencias (esto debería venir de un servicio)
        this.traficoService.getProveedores("", 24669).subscribe(resp => {
            resp.forEach(element => {
              this.agencias.push({ value: element.idProveedor ,  label : element.razonSocial.toUpperCase() });
            });
          });
    }

    enviarSeleccion() {
        if (!this.selectedAgencia) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Debe seleccionar una agencia antes de enviar.' });
            return;
        }
    
        if (this.selectedOrdenes.length === 0) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Debe seleccionar al menos una orden.' });
            return;
        }
    
        // Concatenar los idordentrabajo en una cadena separada por comas
        const idsConcatenados = this.selectedOrdenes.map(orden => orden.idordentrabajo).join(',');
    
        // Crear objeto para enviar
        const payload = {
            ids: ',' + idsConcatenados, // Se agrega la coma inicial para cumplir con el formato esperado
            idagencia: this.selectedAgencia
        };
    
        console.log("Payload a enviar:", payload);
    
        // Llamar al servicio con el objeto formateado
        this.ordenService.AsignarOtsaLocal(payload).subscribe(
            resp => {
                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Órdenes enviadas correctamente.' });
                this.ref.close();
            },
            error => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Hubo un problema al enviar las órdenes.' });
            }
        );
    }
    
}
