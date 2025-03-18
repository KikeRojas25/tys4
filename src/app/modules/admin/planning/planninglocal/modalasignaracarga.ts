import { CommonModule } from '@angular/common';
import {Component, OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from 'app/core/user/user.types';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogRef, DynamicDialogConfig, DialogService } from 'primeng/dynamicdialog';
import { ToastModule } from 'primeng/toast';
import { OrdenTransporteService } from '../../recepcion/ordentransporte/ordentransporte.service';
import { PlanningService } from '../planning.service';



@Component({
    template: `




                  <h6>Seleccionar cargas disponibles :</h6>

                  <p-dropdown name="tiposunidad"
                    [options]="tiposunidad" [(ngModel)]="model.idtipounidad"
                    scrollHeight="30vh"  class="input-form-field"
                    appendTo="body"
                    [baseZIndex]="100000"
                    [virtualScroll]="true" itemSize="30"
                    [style]="{'width':'100%'}" [resetFilterOnHide]="false"
                    [hideTransitionOptions]="'0ms'"
                    [showTransitionOptions]="'0ms'"
                    filter="false">
                        <ng-template let-item pTemplate="selectedItem">
                            <span style="vertical-align:left;">{{item.label}}</span>
                        </ng-template>
                  </p-dropdown>


                  <div class="col-md-6 mt-5 offset-6">
                      <button  ng-disabled="loading"  class='btn-primary btn btn-xs' pButton iconPos="left" label="Guardar" icon="fa fa-save"   (click)="guardar()"  type="button"></button>
                      <button  class='btn-danger btn btn-xs' pButton iconPos="left" label="Cancelar" icon="fa fa-times"   (click)="cancelar()"  type="button"></button>
              </div>



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
export class ModalAsignaraCargaLocalComponent  implements OnInit {

    loading = false;
    cars: any[];
    model: any = {};
    tiposunidad: SelectItem[] = [];
    user: User ;
    ids: any;

    constructor(private ordenService: OrdenTransporteService
                ,public planningService: PlanningService
                ,public ref: DynamicDialogRef
                ,public config: DynamicDialogConfig) {

                  this.ids = '';

                  this.config.data.ids.forEach(element => {
                    this.ids = this.ids + ',' + element.idordentrabajo;
                  });
         }

    ngOnInit() {

      this.user = JSON.parse(localStorage.getItem('user'));

      this.ordenService.GetAllCargasTemporal(2).subscribe(resp => {

        resp.forEach(element => {
          this.tiposunidad.push({ value: element.idcarga ,  label : element.numcarga});
        });


    });

    

    }
    cancelar() {
      this.loading = false;
      this.ref.close();
    }
    guardar() {


      this.model.idprovincia  = '';
      this.loading = true;

      if(this.model.idtipounidad === undefined)   {
       return;
      }

        this.model.idprovincia = this.ids;

        this.ordenService.AsignarOtsCarga(this.model.idprovincia,this.model.idtipounidad ).subscribe( x=> {
          this.ref.close();
          this.loading = false;

        })


    }
}
