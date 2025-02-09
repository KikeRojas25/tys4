import {Component, OnInit} from '@angular/core';
import { MessageService, SelectItem } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { OrdenTransporteService } from '../../recepcion/ordentransporte/ordentransporte.service';
import { User } from 'app/core/user/user.types';
import { ToastModule } from 'primeng/toast';
import { CalendarModule } from 'primeng/calendar';
import { PickListModule } from 'primeng/picklist';
import { FormsModule } from '@angular/forms';


@Component({
    template: `
<div class="flex flex-col items-center p-6 space-y-6">

    
    <!-- Fecha y Hora programada de Salida -->
    <div class="w-full md:w-1/2 flex flex-col gap-2">
        <label for="dni" class="text-gray-700 font-semibold">Fecha y Hora programada de Salida:</label>
        <p-calendar 
            [showTime]="true" 
            [(ngModel)]="model.fechahorasalida" 
            [showSeconds]="false" 
            class="w-full border border-gray-300 p-2 rounded-md shadow-sm">
        </p-calendar>
    </div>
    
    <!-- PickList -->
    <div class="flex flex-col items-center w-full md:w-3/5 space-y-4">
        <p-pickList 
            [source]="source" 
            [target]="target" 
            sourceHeader="Disponibles" 
            targetHeader="Asignados" 
            [responsive]="true"
            [showSourceControls]="false" 
            [showTargetControls]="false"
            [dragdrop]="true" 
            [responsive]="true"
            [sourceStyle]="{ height: '8rem', width: '12rem' }" 
            [targetStyle]="{ height: '8rem', width: '12rem' }" 
            breakpoint="1400px"
            class="border border-gray-300 rounded-lg shadow-md text-sm p-2 w-auto">
            <ng-template let-product pTemplate="item">
                <div class="flex items-center justify-between p-2 bg-gray-100 rounded-md shadow-sm text-xs">
                    <span class="text-gray-800 font-medium">{{ product.precinto }}</span>
                </div>
            </ng-template>
        </p-pickList>
    </div>
    
    <!-- Botón de Guardar -->
    <div class="w-full md:w-1/2 flex justify-center">
        <p-button 
            severity="success" iconPos="left" label="Guardar" icon="fa fa-plus" 
            (click)="guardar()" type="button">
            
        </p-button>
    </div>
</div>



            <p-toast></p-toast>

    `,
    standalone: true,
    imports: [
      ToastModule
      ,CalendarModule
      ,PickListModule 
      , FormsModule
    ]
})
export class PrecintosModalComponent  implements OnInit {

    cars: any[];
    model : any = {};
    source: any[] = [];
    target: any[] = [];
    numhojaruta : string ;
    todo: any = [];
    user: User ;

    constructor(private ordenService: OrdenTransporteService
            , public messageService: MessageService
        ,       public ref: DynamicDialogRef, public config: DynamicDialogConfig) {

               this.numhojaruta =   config.data.hojaruta;
               this.todo = config.data.todo;

              this.user = JSON.parse(localStorage.getItem('user'));
              this.model.idusuariocreacion = this.user.usr_int_id;

         }

    ngOnInit() {

      this.model.idestado = 1;
      this.ordenService.getAllPrecintosLibres().subscribe(list =>  {

           this.source =   list;

        });
    }


    cargarDestinatarios(hojaruta: any) {


    }
    guardar() {


      this.model.numhojaruta = this.numhojaruta;

      // this.ordenService.asignarPrecintos(this.numhojaruta,this.target).subscribe(resp => {

      //    this.ordenService.confirmarSalida(this.model).subscribe(resp => {


      //   });


      //   this.ref.close();

      // });



    }
    imprimirManifiesto () {

  //     if(this.model.fechahorasalida === undefined)
  //     {
  //       this.messageService.add({severity:'error', summary:'Confirmar Estiba', detail:'Debe seleccionar una fecha de salida programada.'});
  //       return ;
  //     }

  //     var url = "http://104.36.166.65/webreports/hojaruta.aspx?iddespacho=" + String(this.todo[0].iddespacho);
  //     window.open(url);

  // }

    }


}
