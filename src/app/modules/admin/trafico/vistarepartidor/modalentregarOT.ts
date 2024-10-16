import { CommonModule } from '@angular/common';
import {Component, OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig, DialogService } from 'primeng/dynamicdialog';
import { User } from '../trafico.types';
import { OrdenTransporteService } from '../../recepcion/ordentransporte/ordentransporte.service';
import { DropdownModule } from 'primeng/dropdown';
import { PlanningService } from '../../planning/planning.service';
import { MantenimientoComponent } from '../../mantenimiento/mantenimiento.component';
import { MantenimientoService } from '../../mantenimiento/mantenimiento.service';



@Component({
    template: `

<div class="col-md-12">

                <div class="row">
                <div class="col-md-12">
                    <label>Tipo Entrega :</label>
                          <p-dropdown [options]="statuses" name="tipoentrega"    id="tipoentrega"
                          scrollHeight="40vh"
                          placeholder="seleccione un tipo de entrega"
                          [style]="{'width':'100%'}"  [resetFilterOnHide]="true"
                          [hideTransitionOptions]="'0ms'"
                          [showTransitionOptions]="'0ms'"
                          [(ngModel)]="model.tipoentrega"></p-dropdown>
                    </div>
                </div>

                <div class="row">
                <div class="col-md-6">
                      <label>Fecha Entrega  :</label>
                      <p-calendar [(ngModel)]="model.fechaentrega"  appendTo="body"  [style]="{'width':'100%'}"  baseZIndex="100"   name="fechaentrega"   dateFormat="dd/mm/yy"></p-calendar>
                    </div>
                    <div class="col-md-6">
                    <label>Hora de Entrega :</label>
                    <input  type="text" class="form-control" [(ngModel)]="model.horaentrega" >
                    </div>

                </div>

                <div class="row">
                    <div class="col-md-6">
                    <label>DNI Entrega :</label>
                    <input  type="text" class="form-control" [(ngModel)]="model.dnientrega" >

                    </div>
                    <div class="col-md-6">
                    <label>Persona Entrega :</label>
                    <input  type="text" class="form-control"  [(ngModel)]="model.personaentrega">

                    </div>
                </div>
                <div class="row mt-3">
                    <div class="col-md-6 ">
                    <label>Cargo Pendiente :</label>
                       <p-checkbox [(ngModel)]="model.cargopendiente"  name="cargopendiente"  value="1" id="cargapendiente"></p-checkbox>
                    </div>
                </div>

                <div class="col-6">
                <h6>Observación:</h6>
                <textarea [(ngModel)]="model.observacion_enreparto" rows="5" cols="30"  class="form-control"   type="text" textarea ></textarea>
              </div>

                <div class="row  mt-3">
                <div class="col-md-6">
                    <button   class='btn-danger btn ' pButton iconPos="left" label="Confirmar Entrega"   (click)="entregarOT()"  type="button"></button>
                    </div>
                </div>


</div>
    `,
    standalone:true,
    imports: [
      FormsModule,
      CommonModule,
      DropdownModule

    ],
      providers: [ConfirmationService, DialogService, MessageService]
})
export class EntregarOtModalComponent  implements OnInit {

    cars: any[];
    model: any = {};
    estadosnext: SelectItem[] = [];
    estaciones: SelectItem[] = [];
    agencias: SelectItem[] = [];
    repartidores: SelectItem[] = [];
    user: User ;
    dateInicio: Date = new Date(Date.now()) ;
    es: any;
    statuses: SelectItem[];
    idordentrabajo : any;


    constructor(private ordenService: OrdenTransporteService
                ,public ref: DynamicDialogRef
                ,public planningService: PlanningService
                ,private confirmationService: ConfirmationService
                ,private messageService: MessageService
                ,private mantenimientoService: MantenimientoService
                ,public config: DynamicDialogConfig) {

                 this.idordentrabajo =  this.config.data.idorden
         }

    ngOnInit() {

      this.statuses = [

        {label: 'Entrega Conforme', value: 5},
        {label: 'Rechazo Parcial', value: 11},
        {label: 'Rechazo Total', value: 12},
       ];


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
      this.model.idusuariocreacion = this.user.usr_int_id;


      this.estadosnext.push({ value: 10 ,  label : 'En Base (Con Precinto)'});
      this.estadosnext.push({ value: 11 ,  label : 'En Ruta'});
      this.estadosnext.push({ value: 25 ,  label : 'En Zona'});
      this.estadosnext.push({ value: 13 ,  label : 'En Reparto '});



      this.planningService.GetAllEstaciones().subscribe(resp => {
        resp.forEach(element => {
          this.estaciones.push({ value: element.idEstacion ,  label : element.estacionOrigen});
        });
      });


      this.ordenService.getValorTabla(24).subscribe(resp => {
        resp.forEach(element => {
          this.agencias.push({ value: element.idValorTabla ,  label : element.valor});
        });
      });


      this.mantenimientoService.getProveedores("", 21514).subscribe(resp => {
        resp.forEach(element => {
          this.repartidores.push({ value: element.idProveedor ,  label : element.razonSocial  +   '-'   +    element.ruc});
        });
      });



    }
    cancelar() {
      this.ref.close();
    }


    entregarOT(){




      if(this.model.tipoentrega === undefined)
      {
        this.messageService.add({severity:'warm', detail:"Debe seleccionar un tipo de entrega" ,  summary:'Monitoreo' });

        return ;
      }
      if(this.model.fechaentrega === undefined)
      {
        this.messageService.add({severity:'warm', detail:"Debe seleccionar una fecha de entrega" ,  summary:'Monitoreo' });

        return ;
      }
      if(this.model.horaentrega === undefined)
      {
        this.messageService.add({severity:'warm', detail:"Debe seleccionar una hora de entrega" ,  summary:'Monitoreo' });

        return ;
      }


      console.log(this.model.tipoentrega, 'tipoentrega');

      console.log(this.model.fechaentrega, 'fechaentrega');


      this.model.fechaetapa = this.model.fechaentrega;
      this.model.idusuarioentrega  = 2;
      this.model.idtipoentrega = this.model.tipoentrega ;
      this.model.idordentrabajo = this.idordentrabajo;


      if(this.model.cargopendiente === undefined)
      {
            this.model.cargopendiente = false;
      }
      else
      {
         this.model.cargopendiente = Boolean(this.model.cargopendiente[0]);
      } 



          this.ordenService.confirmar_entrega(this.model).subscribe(resp => {
            this.messageService.add( { detail: "Se ha confirmado el entrega con éxito." , summary: 'Tráfico', severity:'success' });


              this.ref.close();

     });
    }
}

