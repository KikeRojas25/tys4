import {Component, OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from 'app/core/user/user.types';
import { SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { OrdenTransporteService } from '../../recepcion/ordentransporte/ordentransporte.service';
import { PlanningService } from '../planning.service';
import { MantenimientoService } from '../../mantenimiento/mantenimiento.service';
import { CommonModule } from '@angular/common';



@Component({
    template: `

      <div class="col-12 mt-5">



                  <h6>Seleccionar tipo de operación  Etapa 1 :</h6>

                  <p-dropdown name="tiposunidad"
                    [options]="tiposunidad" [(ngModel)]="model.idtipooperacion"
                    scrollHeight="20vh" 
                    appendTo="body"
                    [baseZIndex]="100000"
                    [style]="{'width':'100%'}" [resetFilterOnHide]="false"
                      placeholder="seleccione un tipo de operacion"
                    [hideTransitionOptions]="'0ms'"
                    [showTransitionOptions]="'0ms'"
                    filter="false">
                        <ng-template let-item pTemplate="selectedItem">
                            <span style="vertical-align:left;">{{item.label}}</span>
                        </ng-template>
                  </p-dropdown>


                  <div class="mt-4" *ngIf="model.idtipooperacion === 123">


                  <h6>Seleccionar la agencia :</h6>

                  <p-dropdown name="agencias"
                    [options]="agencias" [(ngModel)]="model.idagencia"
                    scrollHeight="20vh" 
                    appendTo="body"
                    [baseZIndex]="100000"
                    [virtualScroll]="true" itemSize="4"
                    [style]="{'width':'100%'}" [resetFilterOnHide]="false"
                    [hideTransitionOptions]="'0ms'"
                    [showTransitionOptions]="'0ms'"
                    placeholder="seleccione una agencia"
                    filter="false">
                        <ng-template let-item pTemplate="selectedItem">
                            <span style="vertical-align:left;">{{item.label}}</span>
                        </ng-template>
                  </p-dropdown>

                  </div>

                  <div class="mt-4" *ngIf="model.idtipooperacion === 124">


                    <h6>Seleccionar la estación :</h6>

                    <p-dropdown name="estaciones"
                      [options]="estaciones" [(ngModel)]="model.idestacion"
                      scrollHeight="20vh"  class="input-form-field"
                      appendTo="body"
                      [baseZIndex]="100000"
                      [virtualScroll]="true" itemSize="4"
                      [style]="{'width':'100%'}" [resetFilterOnHide]="false"
                      [hideTransitionOptions]="'0ms'"
                      [showTransitionOptions]="'0ms'"
                      placeholder="seleccione una estación"
                      filter="false">
                          <ng-template let-item pTemplate="selectedItem">
                              <span style="vertical-align:left;">{{item.label}}</span>
                          </ng-template>
                    </p-dropdown>

                    </div>


                  <div class="mt-4" *ngIf="model.idtipooperacion === 18139">


                      <h6>Seleccionar el repartidor :</h6>

                      <p-dropdown name="repartidores"     id="repartidores"
                        [options]="repartidores" [(ngModel)]="model.idrepartidor"
                        scrollHeight="20vh"  

                        appendTo="body"
                        [baseZIndex]="100000"
                        (onChange)="mostrarDireccion()"
                        [virtualScroll]="true" itemSize="14"
                        [style]="{'width':'100%'}" [resetFilterOnHide]="false"
                        [hideTransitionOptions]="'0ms'"
                        [showTransitionOptions]="'0ms'"
                        placeholder="seleccione un repartidor"
                        [filter]="true">
                            <ng-template let-item pTemplate="selectedItem">
                                <span style="vertical-align:left;">{{item.label}}</span>
                            </ng-template>
                      </p-dropdown>

                      </div>
                      <div class="titulo mt-4" *ngIf="model.idtipooperacion === 18139">
                        Distrito vinculado al repartidor :  {{ distrito }}
                      </div>

              </div>

              <!-- <div *ngIf="model.idtipooperacion !== 124" class="col-12 mt-5">

              <h6>Seleccionar tipo de operación  Etapa 2 :</h6>

              <p-dropdown name="tiposunidad2"
                    [options]="tiposunidad" [(ngModel)]="model.idtipooperacion2"
                    scrollHeight="20vh"  class="input-form-field"
                    appendTo="body"
                    [baseZIndex]="100000"
                    [virtualScroll]="true" itemSize="4"
                    [style]="{'width':'100%'}" [resetFilterOnHide]="false"
                    [hideTransitionOptions]="'0ms'"
                    [showTransitionOptions]="'0ms'"
                    filter="false">
                        <ng-template let-item pTemplate="selectedItem">
                            <span style="vertical-align:left;">{{item.label}}</span>
                        </ng-template>
                  </p-dropdown>

              </div> -->




              <div class="col-md-4 mt-4 offset-6">
                      <button   class='btn-danger btn btn-xs' pButton iconPos="left" label="Guardar" icon="fa fa-save"   (click)="guardar()"  type="button"></button>
                      <button   class='btn-primary btn btn-xs' pButton  label="Cancelar"   (click)="cancelar()"  type="button"></button>
              </div>
    `
     ,standalone : true,
     imports: [
       DropdownModule,
       FormsModule,
       ButtonModule,
       CommonModule
     ]
})
export class ModalAsignarTipoOperacionComponent  implements OnInit {

    cars: any[];
    model: any = {};
    tiposunidad: SelectItem[] = [];
    estaciones: SelectItem[] = [];
    agencias: SelectItem[] = [];
    repartidores: SelectItem[] = [];
    user: User ;
    distrito: string;

    constructor(private ordenService: OrdenTransporteService,
                private planningService: PlanningService,
                private mantenimientoService: MantenimientoService,
                public ref: DynamicDialogRef,
                public config: DynamicDialogConfig) {
         }

    ngOnInit() {



      this.user = JSON.parse(localStorage.getItem('user'));
      this.model.idusuariocreacion = this.user.id;

      this.ordenService.getValorTabla(23).subscribe(resp => {
        resp.forEach(element => {
          this.tiposunidad.push({ value: element.idValorTabla ,  label : element.valor});
        });
      });


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

        console.log('repartidor', resp);

        resp.forEach(element => {
          this.repartidores.push({ value: element.idProveedor ,  label : element.razonSocial  +   ' - '   +    element.ruc});
        });
      });



    }
    cancelar() {
      this.ref.close();
    }
    mostrarDireccion() {
        // this.ordenService.getProveedor(this.model.idrepartidor).subscribe(x=> {

        //   console.log(x, 'res');

        //   this.distrito = x.distrito;

        // });
    }
    guardar() {

        this.model.ids =  this.config.data.ids;

        if(this.model.idtipooperacion === undefined)
        {
           
            return;
        }


      if(this.model.idtipooperacion=== 18139) {
        if(this.model.idrepartidor === undefined)   {
        
            return;
        }
      }



      if(this.model.idtipooperacion=== 123) {
        if(this.model.idagencia === undefined)   {
         
            return;
        }
      }





        this.planningService.asignarTipoOperacion(this.model ).subscribe( x=> {

          if(x.error)
          {
            
            return ;

          }
          else {

           
          }


          this.ref.close();

        })
    }
}

