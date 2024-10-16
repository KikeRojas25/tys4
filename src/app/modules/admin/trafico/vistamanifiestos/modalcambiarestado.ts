import { CommonModule } from '@angular/common';
import {Component, OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService, SelectItem } from 'primeng/api';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { OrdenTransporteService } from '../../recepcion/ordentransporte/ordentransporte.service';
import { User } from '../trafico.types';
import { PlanningService } from '../../planning/planning.service';
import { TraficoService } from '../trafico.service';
import { ToastModule } from 'primeng/toast';


@Component({
    template: `

<div class="col-12 row">
      <div class="col-6">
                  <h6>Estado  :</h6>
                  <p-dropdown name="estadosnext"
                    [options]="estadosnext" [(ngModel)]="model.idestado"
                     class="input-form-field"
                    appendTo="body"
                     placeholder="Selecciona un estado"
                    [baseZIndex]="100000"
                    [style]="{'width':'70%'}"
                    [hideTransitionOptions]="'0ms'"
                    [showTransitionOptions]="'0ms'"
                    filter="false">
                        <ng-template let-item pTemplate="selectedItem">
                            <span style="vertical-align:left;">{{item.label}}</span>
                        </ng-template>
                  </p-dropdown>
              </div>
              <div class="col-6">
                <h6>Fecha de Estado:</h6>
                <p-calendar [(ngModel)]="dateInicio"    appendTo="body"   [showTime]="true"  baseZIndex="10000" [locale]="es" dateFormat="dd/mm/yy"></p-calendar>
              </div>
              <div class="col-6">
                <h6>Observación:</h6>
                <textarea [(ngModel)]="model.observacion" rows="5" cols="30"  class="form-control"   type="text" textarea ></textarea>
              </div>

              <div class="col-md-4 mt-4 offset-3">
                      <button   class='btn-danger btn btn-xs' pButton iconPos="left" label="Guardar" icon="fa fa-save"   (click)="guardar()"  type="button"></button>
                      <button   class='btn-primary btn btn-xs' pButton  label="Cancelar"   (click)="cancelar()"  type="button"></button>
              </div>
</div>
    `,
    standalone: true,
    imports: [
      CommonModule,
      FormsModule,
      DropdownModule,
      CalendarModule,
      ToastModule 
    ]
})
export class CambiarEstadoModalComponent  implements OnInit {

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
                ,public ref: DynamicDialogRef
                ,private planningService: PlanningService
                ,private traficoService: TraficoService
                ,private messageService: MessageService
                ,public config: DynamicDialogConfig) {



         }

    ngOnInit() {



      this.es = {
        firstDayOfWeek: 1,
        dayNames: [ 'domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado' ],
        dayNamesShort: [ 'dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb' ],
        dayNamesMin: [ 'D', 'L', 'M', 'X', 'J', 'V', 'S' ],
        monthNames: [ 'enero', 'febrero', 'marzo', 'abril',
        'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre' ],
        monthNamesShort: [ 'ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic' ],
        today: 'Hoy',
        clear: 'Borrar'
    };


      this.user = JSON.parse(localStorage.getItem('user'));
      this.model.idusuariocreacion = this.user.id;


      console.log( 'modal popup:' , this.model);


      this.estadosnext.push({ value: 10 ,  label : 'En Base (Con Precinto)'});
      this.estadosnext.push({ value: 11 ,  label : 'En Ruta'});
      this.estadosnext.push({ value: 25 ,  label : 'En Zona'});
      this.estadosnext.push({ value: 13 ,  label : 'En Reparto '});



      // this.planningService.GetAllEstaciones().subscribe(resp => {
      //   resp.forEach(element => {
      //     this.estaciones.push({ value: element.idEstacion ,  label : element.estacionOrigen});
      //   });
      // });


      // this.ordenService.getValorTabla(24).subscribe(resp => {
      //   resp.forEach(element => {
      //     this.agencias.push({ value: element.idValorTabla ,  label : element.valor});
      //   });
      // });


      // this.traficoService.getProveedores("", 21514).subscribe(resp => {
      //   resp.forEach(element => {
      //     this.repartidores.push({ value: element.idProveedor ,  label : element.razonSocial  +   '-'   +    element.ruc});
      //   });
      // });



    }
    cancelar() {
      this.ref.close();
    }


    guardar() {



      if(this.model.idestado  === undefined )
        {
          // this.toastr.error('Debe seleccionar una o más OTs'
          // , 'Planning', {
          //   closeButton: true
          // });
  
          this.messageService.add({ severity:'warn', summary:'Tráfico', detail:'Debe seleccionar un estado'  })
          return ;
        }



        this.model.ids =  this.config.data.ids;
        this.model.fechaestado =  new Date(this.dateInicio); // moment(this.dateInicio).format("DD/MM/YYYY HH:mm:ss"); //this.dateInicio.toLocaleDateString('en-GB');


        console.log(this.model.fechaestado, 'fecha');

        this.traficoService.cambiarEstadoOT(this.model ).subscribe( x=> {

          this.messageService.add({ severity: 'success', summary: 'Tráfico', detail: 'Se ha realizado el cambio de estado, de manera correcta' });
          this.ref.close();

        });
    }
}

