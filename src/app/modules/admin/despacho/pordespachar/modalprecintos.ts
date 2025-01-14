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

<div class="col-md-4 mt-2 mb-4">

<label for="dni">Fecha y Hora programada de Salida: </label>
  <p-calendar  [showTime]="true" [(ngModel)]="model.fechahorasalida"  [showSeconds]="false"></p-calendar>
</div>

<div class=" mb-3 col-md-12">

<p-pickList [source]="source" [target]="target" sourceHeader="Disponibles" targetHeader="Asignados" [dragdrop]="true" [responsive]="true"
    [sourceStyle]="{ height: '30rem' }" [targetStyle]="{ height: '30rem' }" breakpoint="1400px">
    <ng-template let-product pTemplate="item">
        <div class="flex flex-wrap p-2 align-items-center gap-3">
                    <span> {{ product.precinto }} </span>
        </div>
    </ng-template>
</p-pickList>


</div>

     <div class="row mb-3 col-md-12">
     <div class=" mb-3 col-md-4">
          <button  class='btn-primary btn-block btn' pButton iconPos="left" label="Guardar" icon="fa fa-plus"  (click)="guardar()"  type="button"></button>
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
      // this.ordenService.getAllPrecintosLibres().subscribe(list =>  {

      //      this.source =   list;

      //   });
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
