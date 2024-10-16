import {Component, OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { SelectItem } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { OrdenTransporteService } from '../../recepcion/ordentransporte/ordentransporte.service';
import { User } from 'app/core/user/user.types';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
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
                      <p-button  ng-disabled="loading"  class='btn-primary btn btn-xs'  iconPos="left" label="Guardar" icon="fa fa-save"   (click)="guardar()"  type="button"></p-button>
                      <p-button  class='btn-danger btn btn-xs'  iconPos="left" label="Cancelar" icon="fa fa-times"   (click)="cancelar()"  type="button"></p-button>
              </div>



    `
     ,standalone : true,
     imports: [
       DropdownModule,
       FormsModule,
       CommonModule,
       ButtonModule
     ]
})
export class ModalAsignaraCargaComponent  implements OnInit {

    loading = false;
    cars: any[];
    model: any = {};
    tiposunidad: SelectItem[] = [];
    user: User ;
    ids: any;

    constructor(private ordenService: OrdenTransporteService
                ,public ref: DynamicDialogRef
                ,private planningService: PlanningService
                ,public config: DynamicDialogConfig) {
                  this.ids = '';

                  this.config.data.ids.forEach(element => {
                    this.ids = this.ids + ',' + element.idprovincia;
                  });
         }

    ngOnInit() {

      this.user = JSON.parse(localStorage.getItem('user'));


      this.ordenService.GetAllCargasTemporal(1).subscribe(resp => {

        console.log( resp, 'aca' );
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
      if(this.model.idtipounidad === undefined) {
         return;
      }
        this.model.idprovincia = this.ids;

        this.planningService.AsignarProvinciaCarga(this.model.idprovincia,this.model.idtipounidad, this.user.idestacionorigen ).subscribe( x=> {
          this.ref.close();
          this.loading = false;

        })


    }
}
