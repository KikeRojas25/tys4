import {Component, OnInit} from '@angular/core';
import { SelectItem } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { OrdenTransporteService } from '../../recepcion/ordentransporte/ordentransporte.service';
import { PlanningService } from '../planning.service';
import { FormsModule } from '@angular/forms';
import { User } from 'app/core/user/user.types';
import { ButtonModule } from 'primeng/button';



@Component({
    template: `

                  <label>Tipo de unidad :</label>

                  <p-dropdown name="tiposunidad"
                    [options]="tiposunidad" [(ngModel)]="model.idtipounidad"
                    scrollHeight="30vh"  class="input-form-field"
                    appendTo="body"
                    [baseZIndex]="100000"
                    required
                    placeholder="Seleccione un tipo de unidad"
                    [style]="{'width':'100%'}" [resetFilterOnHide]="false"
                    [hideTransitionOptions]="'0ms'"
                    [showTransitionOptions]="'0ms'"
                    filter="false">
                        <ng-template let-item pTemplate="selectedItem">
                            <span style="vertical-align:left;">{{item.label}}</span>
                        </ng-template>
                  </p-dropdown>


              <div class="col-md-6 mt-5 offset-6">
                      <p-button  iconPos="left" label="Guardar"  icon="fa fa-save" severity="secondary"  (click)="guardar()"></p-button>
                      <p-button  iconPos="left" label="Cancelar" icon="fa fa-times"   (click)="cancelar()"></p-button>
              </div>
             




    `
    ,standalone : true,
    imports: [
      DropdownModule,
      FormsModule,
      ButtonModule
    ]

})
export class ModalTipoUnidadComponent  implements OnInit {

    loading = false;
    cars: any[];
    model: any = {};
    tiposunidad: SelectItem[] = [];
    user: User ;


    constructor(private ordenService: PlanningService
                ,public ref: DynamicDialogRef
                ,private generalService: OrdenTransporteService
                ,public config: DynamicDialogConfig) {

                this.model.tipooperacioncarga = config.data.tipoperacioncarga ;
                console.log(this.model);

         }

    ngOnInit() {

      this.user = JSON.parse(localStorage.getItem('user'));
      console.log(this.user);


      this.generalService.getValorTabla(8).subscribe(resp => {
          resp.forEach(element => {
            this.tiposunidad.push({ value: element.idValorTabla ,  label : element.valor});
          });
      });

    }l
    cancelar() {
      this.loading = false;
      this.ref.close();
    }
    guardar() {


      if(this.model.idtipounidad === undefined) {
        return;
       }

        this.ordenService.CrearCarga(this.user.id
          , this.model.idtipounidad
          , this.model.tipooperacioncarga 
          , this.user.idestacionorigen ).subscribe( x=> {

          this.loading = false;
          this.ref.close();

        })

    }
}
