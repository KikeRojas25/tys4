import { CommonModule } from '@angular/common';
import {Component, OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService, SelectItem } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { OrdenTransporteService } from '../../recepcion/ordentransporte/ordentransporte.service';
import { DespachoService } from '../despacho.service';
import { User } from 'app/core/user/user.types';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';



@Component({
    template: `
<div class="p-4 space-y-6">
  <!-- Tabla de datos -->
  <div class="rounded-lg shadow-lg bg-white p-4 border">
    <h6 class="text-lg font-bold text-gray-700 mb-4">Datos Actuales</h6>
    <table class="w-full border-collapse border border-gray-300">
      <thead class="bg-gray-100">
        <tr>
          <th class="text-left text-sm font-semibold text-gray-600 px-4 py-2 border-b">Peso</th>
          <th class="text-left text-sm font-semibold text-gray-600 px-4 py-2 border-b">Bultos</th>
          <th class="text-left text-sm font-semibold text-gray-600 px-4 py-2 border-b">Volumen</th>
        </tr>
      </thead>
      <tbody>
        <tr class="hover:bg-gray-50">
          <td class="text-sm text-gray-800 px-4 py-2 border-b">{{ model.peso }}</td>
          <td class="text-sm text-gray-800 px-4 py-2 border-b">{{ model.bulto }}</td>
          <td class="text-sm text-gray-800 px-4 py-2 border-b">{{ model.volumen }}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Formulario de actualización -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    <!-- Peso -->
    <div>
      <h6 class="text-sm font-medium text-gray-600 mb-1">Peso</h6>
      <p-inputNumber
        [(ngModel)]="model.pesonuevo"
        inputId="pesonuevo"
        mode="decimal"
      ></p-inputNumber>
    </div>
    <!-- Bultos -->
    <div>
      <h6 class="text-sm font-medium text-gray-600 mb-1">Bultos</h6>
      <p-inputNumber
        [(ngModel)]="model.bultonuevo"
        inputId="bultonuevo"
        mode="decimal"
      ></p-inputNumber>
    </div>
    <!-- Volumen -->
    <div>
      <h6 class="text-sm font-medium text-gray-600 mb-1">Volumen</h6>
      <p-inputNumber
        [(ngModel)]="model.volumennuevo"
        inputId="volumennuevo"
        mode="decimal"
      ></p-inputNumber>
    </div>
  </div>

  <!-- Botones de acción -->
  <div class="flex justify-center space-x-4 mt-4">
    <p-button
      label="Verificar"
      icon="pi pi-check"
      class="p-button-danger"
      (click)="guardar()"
    ></p-button>
    <p-button
      label="Cancelar"
      icon="pi pi-times"
      class="p-button-primary"
      (click)="cancelar()"
    ></p-button>
  </div>
</div>

    `,
    standalone: true,
    imports:[
      CommonModule,
      FormsModule,
      ButtonModule,
      InputNumberModule
    ]
})
export class RecepcioanrOTRModalComponent  implements OnInit {

    cars: any[];
    model: any = {};
    estadosnext: SelectItem[] = [];
    estaciones: SelectItem[] = [];
    agencias: SelectItem[] = [];
    repartidores: SelectItem[] = [];
    user: User ;
    dateInicio: Date = new Date(Date.now()) ;
    es: any;


    constructor(private ordenService: OrdenTransporteService
                ,public generalService: DespachoService
                ,public ref: DynamicDialogRef
                ,private messageService: MessageService
                ,public config: DynamicDialogConfig) {

           this.model.idordentrabajo = config.data.id;

         }

    ngOnInit() {



      this.user = JSON.parse(localStorage.getItem('user'));
      this.model.idusuariocreacion = this.user.usr_int_id;


      this.ordenService.getOrden( this.model.idordentrabajo).subscribe( resp => {
            this.model = resp.ordenTransporte;
            console.log(this.model,'popup');
      });


    }
    cancelar() {
      this.ref.close();
    }


    guardar() {


      this.ordenService.recepcionarOT(this.model).subscribe(resp => {
        this.messageService.add({severity: 'success', detail: "Se ha confirmado la recepción con éxito." , summary: 'Almacén'});

        this.ref.close();


      } , (error)=> {
                this.messageService.add({severity: 'danger', detail: "Ocurrió un error, vuelva a intentarlo." , summary: 'Almacén'});
      });


    }
}

