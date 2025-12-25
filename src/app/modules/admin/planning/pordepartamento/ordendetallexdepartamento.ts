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
    styleUrls: ['./ordendetallexdepartamento.component.css'],
    template: `
        <div class="p-2">

            <!-- Filtros y Botón -->
            <div class="flex flex-row items-end gap-4 mb-4">
                <!-- Dropdown para seleccionar agencia -->
                <div class="flex flex-col flex-1">
                    <label for="agencia" class="text-gray-700 font-semibold mb-1 text-sm">Seleccionar Agencia:</label>
                    <p-dropdown 
                        id="agencia"
                        [options]="agencias"
                        [(ngModel)]="selectedAgencia"
                        placeholder="Seleccione una agencia"
                        [style]="{'width': '100%', 'font-size': '0.875rem'}"
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
                    [style]="{'font-size': '0.875rem'}">
                </p-button>
            </div>

            <!-- Tabla de órdenes -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
                <!-- <div class="bg-gray-800 text-white px-6 py-4 border-b border-gray-700">
                    <h3 class="text-lg font-semibold text-gray-100">Órdenes de Transporte</h3>
                    <p class="text-sm text-amber-300 mt-1.5">Seleccione las órdenes para asignar a una agencia</p>
                </div> -->
                <div class="p-2">
                    <p-table [columns]="cols"
                             [value]="ordenes2"
                             [tableStyle]="{'table-layout': 'fixed'}"
                             dataKey="idordentrabajo"
                             [rowsPerPageOptions]="[20,40,60,120]"
                             [paginator]="true"
                             [(selection)]="selectedOrdenes"
                             selectionMode="multiple"
                             [rows]="20"
                             [scrollable]="true"
                             scrollDirection="horizontal"
                             [styleClass]="'custom-table compact-table'">
                    
                        <ng-template pTemplate="colgroup" let-columns>
                            <colgroup>
                                <col style="width: 30px">
                                <col *ngFor="let col of columns" [ngStyle]="{'width': col.width}">
                            </colgroup>
                        </ng-template>

                        <ng-template pTemplate="header" let-columns>
                            <tr class="bg-gray-100 border-b border-gray-200">
                                <th style="width: 30px" class="px-1 py-1">
                                    <p-tableHeaderCheckbox></p-tableHeaderCheckbox>
                                </th>
                                <th *ngFor="let col of columns" [pSortableColumn]="col.field" pResizableColumn class="text-center px-2 py-1.5 text-xs font-semibold text-gray-700">
                                    {{ col.header }}
                                </th>
                            </tr>
                        </ng-template>

                        <ng-template pTemplate="body" let-rowData>
                            <tr [pSelectableRow]="rowData" class="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                                <td class="px-1 py-1">
                                    <p-tableCheckbox [value]="rowData"></p-tableCheckbox>
                                </td>
                                <td class="text-center px-2 py-1.5 text-gray-700 text-xs">{{ rowData.provincia }}</td>
                                <td class="text-center px-2 py-1.5">
                                    <span class="inline-flex items-center justify-center px-1.5 py-0.5 rounded bg-gray-700 text-white text-xs font-semibold">
                                        {{ rowData.numcp }}
                                    </span>
                                </td>
                                <td class="text-left px-2 py-1.5 text-gray-700 text-xs truncate" [title]="rowData.remitente">{{ rowData.remitente }}</td>
                                <td class="text-center px-2 py-1.5 text-amber-700 text-xs font-medium">{{ rowData.fecharecojo | date:'dd/MM/yyyy' }}</td>
                                <td class="text-left px-2 py-1.5 text-gray-700 text-xs truncate" [title]="rowData.destinatario">{{ rowData.destinatario }}</td>
                                <td class="text-center px-2 py-1.5">
                                    <span class="text-amber-700 text-xs font-semibold">S/. {{ rowData.subtotal | number:'1.0-2' }}</span>
                                </td>
                                <td class="text-center px-2 py-1.5">
                                    <span class="text-amber-700 text-xs font-semibold">{{ rowData.peso | number:'1.0-2' }}</span>
                                    <span class="text-gray-500 text-xs ml-0.5">kg</span>
                                </td>
                                <td class="text-center px-2 py-1.5 text-gray-700 text-xs font-medium">{{ rowData.bulto | number:'1.0-0' }}</td>
                            </tr>
                        </ng-template>

                        <ng-template pTemplate="footer">
                            <tr class="bg-gray-50 border-t border-gray-200">
                                <td colspan="6" class="text-right px-2 py-1.5 text-gray-700 text-xs font-semibold">Totales</td>
                                <td class="text-center px-2 py-1.5">
                                    <span class="text-amber-700 text-xs font-bold">S/. {{ subtotalTotal | number:'1.0-2' }}</span>
                                </td>
                                <td class="text-center px-2 py-1.5 text-gray-700 text-xs font-semibold">
                                    <span>{{ pesoTotal | number:'1.0-2' }}</span>
                                    <span class="text-gray-500 text-xs ml-0.5">kg</span>
                                </td>
                                <td class="text-center px-2 py-1.5 text-gray-700 text-xs font-semibold">{{ bultosTotal | number:'1.0-0' }}</td>
                            </tr>
                        </ng-template>

                    </p-table>
                </div>
            </div>

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
    subtotalTotal: number = 0;
    pesoTotal: number = 0;
    bultosTotal: number = 0;

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
            { header: 'PROVINCIA', field: 'provincia', width: '60px' },
            { header: 'N° OT', field: 'idordentrabajo', width: '55px' },
            { header: 'REMITENTE', field: 'remitente', width: '90px' },
            { header: 'FEC. RECOJO', field: 'fecharecojo', width: '70px' },
            { header: 'DESTINATARIO', field: 'destinatario', width: '90px' },
            { header: 'SUBTOTAL', field: 'subtotal', width: '40px' },
            { header: 'PESO', field: 'peso', width: '40px' },
            { header: 'BULTO', field: 'bulto', width: '40px' }
        ];

        

        // Cargar órdenes
        this.ordenService.GetAllOrdersDetailDeparment(this.idestacionorigen, this.iddepartamento)
            .subscribe(list => {
                this.ordenes2 = list;

                // Calcular totales
                this.subtotalTotal = 0;
                this.pesoTotal = 0;
                this.bultosTotal = 0;

                this.ordenes2.forEach(obj => {
                    this.subtotalTotal = this.subtotalTotal + (obj.subtotal || 0);
                    this.pesoTotal = this.pesoTotal + (obj.peso || 0);
                    this.bultosTotal = this.bultosTotal + (obj.bulto || 0);
                });

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
            idagencia: this.selectedAgencia,
            idusuariocreacion: JSON.parse(localStorage.getItem('user')).id
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
