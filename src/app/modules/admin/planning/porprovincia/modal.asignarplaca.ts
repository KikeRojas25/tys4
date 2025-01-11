import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from 'app/core/user/user.types';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { OrdenTransporte } from '../../trafico/trafico.types';
import { OrdenTransporteService } from '../../recepcion/ordentransporte/ordentransporte.service';
import { CalendarModule } from 'primeng/calendar';
import { TraficoService } from '../../trafico/trafico.service';
import { PlanningService } from '../planning.service';


@Component({
    template: `
    <div class="p-fluid p-grid">
        <div class="col-md-8 mt-2 offset-2">
        <label for="dni">Vehículo: </label>

              <p-dropdown name="vehiculos"
                          [virtualScroll]="true" itemSize="30"
                            [options]="vehiculos" [(ngModel)]="model.idvehiculo"
                            [showClear]="true" class="input-form-field"
                              placeholder="Seleccione un vehículo"
                            [style]="{'width':'100%'}" [resetFilterOnHide]="false"
                            [hideTransitionOptions]="'0ms'" required
                            [showTransitionOptions]="'0ms'"
                            [filter]="true">
                                <ng-template let-item pTemplate="selectedItem">
                                    <span style="vertical-align:left;">{{item.label}}</span>
                                </ng-template>
                          </p-dropdown>

        </div>

        <div class="col-md-8 mt-2 offset-2">
        <label for="dni">Conductor: </label>

              <p-dropdown name="rutas"
                          [virtualScroll]="true" itemSize="30"
                            [options]="conductores" [(ngModel)]="model.idchofer"
                            [showClear]="true" class="input-form-field"
                              placeholder="Seleccione un conductor"
                            [style]="{'width':'100%'}" [resetFilterOnHide]="false"
                            [hideTransitionOptions]="'0ms'" required
                            [showTransitionOptions]="'0ms'"
                            [filter]="true">
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
          <button   class='btn-primary btn btn-block' pButton iconPos="left" label="Confirmar" icon="fa fa-check"   (click)="agregar()"  type="button"></button>
        </div>
    </div>

    <!-- <p-confirmDialog  header="Confirmación" icon="pi pi-exclamation-triangle"></p-confirmDialog> -->


    `
     ,standalone : true,
     imports: [
       DropdownModule,
       FormsModule,
       CalendarModule

     ]
})
export class AsignarPlacaComponent implements OnInit {

    model: any = {};
    vehiculos : SelectItem[] = [];
    conductores: SelectItem[] = [];
    rutas : SelectItem[] = [];
    user: User ;
    loading = false;

    constructor(private ordenTransporteService: OrdenTransporteService,
                public ref: DynamicDialogRef,
                private confirmationService: ConfirmationService,
                public messageService: MessageService,
                private planningService: PlanningService,
                public config: DynamicDialogConfig) {
                    this.model.idcarga = config.data.idcarga;

                    console.log(this.model.idcarga, 'carga');

                }

    ngOnInit(): void {

      this.user = JSON.parse(localStorage.getItem('user'));
      this.model.idplanificador = this.user.id;
      this.model.idestacionorigen = this.user.idestacionorigen;

      this.ordenTransporteService.getVehiculos('').subscribe({
        next: resp => {
          resp.forEach(element => {
            this.vehiculos.push({ value: element.idVehiculo ,  label : element.placa});
          });
  
  
        }
      });
  
  
      this.ordenTransporteService.getChoferes('').subscribe({
        next: resp => {
          resp.forEach(element => {
            this.conductores.push({ value: element.idChofer ,  label : `DNI: ${element.dni} NOMBRE: ${element.nombreChofer} ${element.apellidoChofer}` });
          });
  
  
        }
      });
  

      // this.generalService.getVehiculosxEstado('2').subscribe(list => {
      //    list.forEach(x => {
      //     this.vehiculos.push({ value: x.idvehiculo , label: x.placa   });
      //    })
      //  });

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

          this.planningService.confirmarDespacho(this.model).subscribe(resp => {

            this.ref.close();
            this.loading = false;

          } , (error)=> {



          });




        },
        reject: () => {
            this.ref.close();
        }

     });

    }

}
