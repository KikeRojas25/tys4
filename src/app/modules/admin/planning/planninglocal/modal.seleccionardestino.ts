import { Component, OnInit } from '@angular/core';

import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { PlanningService } from '../planning.service';
import { User } from 'app/core/user/user.types';
import { OrdenTransporteService } from '../../recepcion/ordentransporte/ordentransporte.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';

@Component({
    template: `
    <div class="p-fluid p-grid">
        <div class="col-md-8 mt-2 offset-2">
        <label for="dni">Destino: </label>

              <p-dropdown name="vehiculos"
                          [virtualScroll]="true" itemSize="30"
                            [options]="vehiculos" [(ngModel)]="model.idvehiculo"
                            [showClear]="true" class="input-form-field"
                              placeholder="Seleccione un destino"
                            [style]="{'width':'100%'}" [resetFilterOnHide]="false"
                            [hideTransitionOptions]="'0ms'" required
                            [showTransitionOptions]="'0ms'"
                            filter="false">
                                <ng-template let-item pTemplate="selectedItem">
                                    <span style="vertical-align:left;">{{item.label}}</span>
                                </ng-template>
                          </p-dropdown>

               </div>




        <div class="col-md-8 mt-5  offset-2">

            <label for="dni">Fecha y Hora de Salida: </label>
            <p-calendar appendTo="body" [showTime]="true" [(ngModel)]="model.fechahorasalidaplanning"  [showSeconds]="false"></p-calendar>
        </div>

        <div class="col-md-8 mt-5  offset-2">
          <button   class='btn-primary btn btn-block' pButton iconPos="left" label="Guardar" icon="fa fa-check"   (click)="agregar()"  type="button"></button>
        </div>
    </div>

    <p-confirmDialog  header="Confirmación" icon="pi pi-exclamation-triangle"></p-confirmDialog>


    `,
      standalone: true,
      imports: [
         CommonModule,
         FormsModule,
         DropdownModule,
         ButtonModule,
         ToastModule,
         CalendarModule,
         ConfirmDialogModule
       ],
       providers: [
         ConfirmationService,
         DialogService,
         MessageService
       ]
})
export class SeleccionarDestinoModalComponent implements OnInit {

    model: any = {};
    vehiculos : SelectItem[] = [];
    rutas : SelectItem[] = [];
    user: User ;
    loading = false;

    constructor(private planninService: PlanningService,
                public ref: DynamicDialogRef,
                private confirmationService: ConfirmationService,
                public messageService: MessageService,
                private ordenTransporteService: OrdenTransporteService,
                public config: DynamicDialogConfig) {
                    this.model.idcarga = config.data.idcarga;

                    console.log(this.model.idcarga, 'carga');

                }

    ngOnInit(): void {

      this.user = JSON.parse(localStorage.getItem('user'));
      this.model.idplanificador = this.user.usr_int_id;



     this.vehiculos.push({ value: 0 , label: 'ACH'   });
     this.vehiculos.push({ value: 0 , label: 'Agencia'   });
    //  this.vehiculos.push({ value: 0 , label: 'Agencia'   });


      //  this.generalService.getRutas().subscribe(list => {
      //   list.forEach(x => {
      //    this.rutas.push({ value: x.idruta , label: x.nombre   });
      //   })
      // });



    }
    agregar() {

      this.loading = true;

      this.confirmationService.confirm({
        message: '¿Esta seguro que desea confirmar el despacho?',
        accept: () => {

          this.ordenTransporteService.confirmarDespacho(this.model).subscribe(resp => {
           // this.toastr.success( "Se ha confirmado el despacho con éxito." , 'Planning', { closeButton: true });

            this.ref.close();
            this.loading = false;

          } , (error)=> {
                   // this.toastr.error( error.error , 'Planning', { closeButton: true });
          });




        },
        reject: () => {
            this.ref.close();
        }

     });

    }

}
