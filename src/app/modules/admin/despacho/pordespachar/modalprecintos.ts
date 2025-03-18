import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { OrdenTransporteService } from '../../recepcion/ordentransporte/ordentransporte.service';
import { User } from 'app/core/user/user.types';
import { ToastModule } from 'primeng/toast';
import { CalendarModule } from 'primeng/calendar';
import { PickListModule } from 'primeng/picklist';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DespachoService } from '../despacho.service';

@Component({
    template: `
        <div class="flex flex-col items-center p-6 space-y-6">

            <!-- Fecha y Hora programada de Salida -->
            <div class="w-full md:w-full flex flex-row items-center gap-3">
                <div class="flex-1">
                    <label for="fechaSalida" class="text-gray-700 font-semibold block mb-1">
                        Fecha y Hora programada de Salida:
                    </label>
                    <p-calendar 
                        id="fechaSalida"
                        [(ngModel)]="model.fechahorasalida" 
                        [showTime]="true"
                        [showSeconds]="false"
                        appendTo="body"
                        [baseZIndex]="10000" 
                    ></p-calendar>
                </div>

                <p-button 
                    severity="success" 
                    iconPos="left" 
                    label="Guardar" 
                    icon="pi pi-check" 
                    (click)="guardar()" 
                    type="button"
                    class="h-10 mt-6">
                </p-button>
            </div>

            <!-- PickList -->
            <div class="w-full md:w-full flex flex-col space-y-4">
                <p-pickList 
                    [source]="source" 
                    [target]="target" 
                    [(ngModel)]="target"
                    sourceHeader="Disponibles" 
                    targetHeader="Asignados" 
                    [responsive]="true"
                    [dragdrop]="true" 
                    filterBy="precinto" 
                    breakpoint="1400px"
                    [sourceStyle]="{ height: '12rem', width: '100%' }">
                    
                    <ng-template let-item pTemplate="item">
                        <div class="flex items-center justify-between p-2 bg-gray-100 rounded-md shadow-sm text-xs">
                            <span class="text-gray-800 font-medium">{{ item.precinto }}</span>
                        </div>
                    </ng-template>

                </p-pickList>
            </div>

        </div>
    `,
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ToastModule,
        CalendarModule,
        PickListModule,
        ButtonModule,
        InputTextModule
    ]
})
export class PrecintosModalComponent implements OnInit {
    model: any = {};
    source: any[] = [];
    target: any[] = [];
    numhojaruta: string;
    todo: any = [];
    user: User;

    constructor(
        private ordenService: OrdenTransporteService,
        public messageService: MessageService,
        private despachoService: DespachoService,
        public ref: DynamicDialogRef,
        public config: DynamicDialogConfig
    ) {
        this.numhojaruta = config.data.hojaruta;
        this.todo = config.data.todo;

        this.user = JSON.parse(localStorage.getItem('user') || '{}');
        this.model.idusuariocreacion = this.user?.id || null;
    }

    ngOnInit() {
        this.model.idestado = 1;
        this.despachoService.getAllPrecintosLibres().subscribe(list => {
            this.source = list || [];
        });
    }

    guardar() {
        if (!this.model.fechahorasalida) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Debe seleccionar una fecha de salida programada.' });
            return;
        }

        if (this.target.length === 0) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Debe asignar al menos un precinto.' });
            return;
        }

        this.model.numhojaruta = this.numhojaruta;

        this.despachoService.asignarPrecintos(this.numhojaruta, this.target).subscribe({
            next: (response: any) => {
                if (response.error) {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: response.mensaje });
                    return;
                }
                this.despachoService.confirmarSalida(this.model).subscribe({
                    next: (resp: any) => {
                        if (resp.error) {
                            this.messageService.add({ severity: 'error', summary: 'Error', detail: resp.mensaje });
                            return;
                        }
                        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Precintos asignados correctamente.' });
                        this.ref.close();
                    },
                    error: (err) => this.handleHttpError(err, 'Error al confirmar salida')
                });
            },
            error: (err) => this.handleHttpError(err, 'Error al asignar precintos')
        });
    }

    private handleHttpError(error: any, contexto: string) {
        const detalle = error?.error?.mensaje || error.mensaje || 'Ocurrió un error inesperado';
        this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: `${contexto}: ${detalle}`
        });
    }
}
