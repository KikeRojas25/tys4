import {Component, OnInit} from '@angular/core';
import { MessageService, SelectItem } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { OrdenTransporte } from '../../recepcion/ordentransporte/ordentransporte.types';
import { DespachoService } from '../despacho.service';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { PickListModule } from 'primeng/picklist';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { OrdenTransporteService } from '../../recepcion/ordentransporte/ordentransporte.service';



@Component({
    template: `

<div class=" mb-3 col-md-12">

     <p-dropdown name="hojasruta"
                      [options]="hojasruta" [(ngModel)]="model.idmanifiesto"
                      scrollHeight="30vh"  class="input-form-field"
                      [virtualScroll]="true" itemSize="30"  (onChange)="cargarManifiestos($event)"
                      [style]="{'width':'100%'}" [resetFilterOnHide]="false"
                      [hideTransitionOptions]="'0ms'"
                      [showTransitionOptions]="'0ms'"
                      filter="true">
                          <ng-template let-item pTemplate="selectedItem">
                              <span style="vertical-align:left;">{{item.label}}</span>
                          </ng-template>
     </p-dropdown>

</div>
<div class=" mb-3 col-md-12">

  

      <h6>Seleccionar tipo de operación :</h6>

      <p-dropdown name="tiposunidad"
        [options]="tiposunidad" [(ngModel)]="model.idtipooperacion"
        scrollHeight="20vh"  class="input-form-field"
        appendTo="body"
         itemSize="20"
        [style]="{'width':'100%'}" [resetFilterOnHide]="false"
        [hideTransitionOptions]="'0ms'"
        [showTransitionOptions]="'0ms'"
        placeholder="seleccione un tipo de operación"
        filter="false">
            <ng-template let-item pTemplate="selectedItem">
                <span style="vertical-align:left;">{{item.label}}</span>
            </ng-template>
      </p-dropdown>

     </div>


        <div class="mt-4" *ngIf="model.idtipooperacion === 123">


        <h6>Seleccionar la agencia :</h6>

        <p-dropdown name="agencias"
          [options]="agencias" [(ngModel)]="model.idagencia"
          scrollHeight="20vh"  class="input-form-field"
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

            <p-dropdown name="repartidores"
              [options]="repartidores" [(ngModel)]="model.idrepartidor"
              scrollHeight="20vh"  class="input-form-field"
              appendTo="body"
              [baseZIndex]="100000"
             
              [style]="{'width':'100%'}" [resetFilterOnHide]="false"
              [hideTransitionOptions]="'0ms'"
              [showTransitionOptions]="'0ms'"
              placeholder="seleccione un repartidor"
              filter="false">
                  <ng-template let-item pTemplate="selectedItem">
                      <span style="vertical-align:left;">{{item.label}}</span>
                  </ng-template>
            </p-dropdown>

            </div>


        <!-- <div class=" mb-3 col-md-12">
              <h6>N° OT :</h6>
              <input type="text" name="numcp" autocomplete="off" class="form-control"   [(ngModel)]="model.numcp"   placeholder="Número de OT"   pInputText />
     </div> -->
     <div class=" mb-3 col-md-12">
              <button  class='btn-primary btn-block btn' pButton iconPos="left" label="Agregar OT" icon="fa fa-plus"  (click)="agregar()"  type="button"></button>
     </div>

     <p-table   #dt2 [columns]="cols2" dataKey="idordentrabajo"
                [style]="{width:'500px%'}"
                [rowsPerPageOptions]="[20,40,80,160]"
                paginator="true"
                [value]="ordenes11"   selectionMode="multiple"
                [(selection)]="selectedOTs" responsive="true"
                [globalFilterFields]="['destino', 'numcp']"
                [rows]="20"  >

                <ng-template pTemplate="caption">
                <div  class="row flex">

                    <span class="p-input-icon-left ml-auto">
                        <input pInputText type="text" (input)="dt2.filterGlobal($event.target.value, 'contains')" />
                    </span>

                </div>

                </ng-template>

                  <ng-template pTemplate="colgroup" let-columns>
                    <colgroup>
                        <col *ngFor="let col of columns"   [ngStyle]="{'width': col.width}" >
                    </colgroup>
                  </ng-template>

                  <ng-template pTemplate="header" let-columns>
                    <tr>
                      <th [ngStyle]="{'width': '10'}"   style="text-align:center;" >
                        <p-tableHeaderCheckbox></p-tableHeaderCheckbox>
                      </th>
                        <th  [ngStyle]="{'width': col.width}" *ngFor="let col of columns" pResizableColumn [pSortableColumn]="col.field">
                            {{col.header}}
                        </th>
                    </tr>
                </ng-template>



                <ng-template pTemplate="body" let-rowData    let-columns="columns">
                <tr [pSelectableRow]="rowData">
                    <td class="ui-resizable-column" style="text-align:center;" >
                    <p-tableCheckbox [value]="rowData"></p-tableCheckbox>
                  </td>
                  <td class="ui-resizable-column" style="text-align:center;" > {{ rowData.numcp    }}   </td>
                  <td class="ui-resizable-column" style="text-align:center;"> {{rowData.bulto }} </td>
                  <td class="ui-resizable-column" style="text-align:center;"> {{rowData.fecharegistro | date: 'dd/MM/yyy'}}</td>
                  <td class="ui-resizable-column" style="text-align:center;"> {{rowData.peso |  number:'1.0-2'}}</td>

                  <td class="ui-resizable-column" style="text-align:center;">{{rowData.subtotal |  number:'1.0-2'}}</td>
                  <td class="ui-resizable-column" style="text-align:center;"> {{rowData.destino }}</td>
                  <td class="ui-resizable-column" style="text-align:center;"> {{rowData.razonsocial }}</td>


                </tr>
                </ng-template>


                </p-table>


    `,
     standalone: true,
        imports: [
          CommonModule
          , FormsModule
          , InputTextModule
          , ToastModule
          ,CalendarModule
          ,PickListModule 
          , TableModule
          , FormsModule
          , DropdownModule
        ]

})
export class AgregarOThrModalComponent  implements OnInit {

    cars: any[];
    model : any = {};
    hojasruta: SelectItem[] = [];
    manifiestos: SelectItem[] = [];
    tiposunidad: SelectItem[] = [];
    estaciones: SelectItem[] = [];
    agencias: SelectItem[] = [];
    repartidores: SelectItem[] = [];
    cols2: any[];
    ordenes11: OrdenTransporte[] = [];
    selectedOTs: OrdenTransporte[]= [];

    constructor(private despachoService: DespachoService
             ,  private ordenTransporteService:  OrdenTransporteService
            ,    public messageService: MessageService
            ,    public ref: DynamicDialogRef, public config: DynamicDialogConfig) {


         }

    ngOnInit() {

      this.cols2 = [
        { field: 'numcp', header: 'N° OT',  width: '20px'},
        {header: 'BULTOS', field: 'bulto'  , width: '60px'   },
        {header: 'FECHA', field: 'fecharegistro'  , width: '60px'   },
        {header: 'PESO', field: 'peso'  ,  width: '30px'  },
        {header: 'SUBTOTAL', field: 'subtotal'  ,  width: '30px'  },
        {header: 'DESTINO', field: 'destino'  ,  width: '30px'  },
        {header: 'CLIENTE', field: 'razonsocial'  ,  width: '100px'  },

      ];

      this.despachoService.getAllOrderTransportPending(this.model).subscribe(resp => {
         this.ordenes11 = resp;

         console.log('pdneitnes:',this.ordenes11);

      });

      // this.model.idestado = 1;
      this.despachoService.getAllPreHojaRuta(this.model).subscribe(list =>  {

        console.log(list, 'traje');

            list.forEach(x => {
              this.hojasruta.push({ value: x.numHojaRuta , label: 'HR: '+  x.numHojaRuta + ' Placa: ' + x.placa + ' Ruta: ' + x.ruta });
            })

        });


        this.ordenTransporteService.getValorTabla(23).subscribe(resp => {
          resp.forEach(element => {
            this.tiposunidad.push({ value: element.idValorTabla ,  label : element.valor});
          });
        });


        // this.generalService.GetAllEstaciones().subscribe(resp => {
        //   resp.forEach(element => {
        //     this.estaciones.push({ value: element.idestacion ,  label : element.estacionorigen});
        //   });
        // });


        // this.generalService.getValorTabla(24).subscribe(resp => {
        //   resp.forEach(element => {
        //     this.agencias.push({ value: element.idvalortabla ,  label : element.valor});
        //   });
        // });


        // this.generalService.getProveedores("", 21514).subscribe(resp => {
        //   resp.forEach(element => {
        //     this.repartidores.push({ value: element.idproveedor ,  label : element.razonSocial  +   '-'   +    element.ruc});
        //   });
        // });




    }


    cargarManifiestos(hojaruta: any) {

      this.manifiestos = [];

      this.model.numhojaruta = hojaruta.value;
      this.despachoService.getAllPreManifiestos(this.model).subscribe(list =>  {

        this.manifiestos.push({ value: 0 , label: 'Nuevo Manifiesto'});
      list.forEach(x => {
          this.manifiestos.push({ value: x.idmanifiesto , label: x.nummanifiesto});
        });

    });
    }
    agregar() {
      this.model.ids = '';


      if(this.selectedOTs.length === 0){


        this.messageService.add({severity:'error', summary:'Agregar OTs', detail:'Debe seleccionar al menos una OT'});
        return;
      }

      if(this.model.idtipooperacion=== 18139) {
        if(this.model.idrepartidor === undefined)   {
          this.messageService.add({severity:'error', summary:'Agregar OTs', detail:'Debe seleccionar un repartidor'});
            return;
        }
      }



      if(this.model.idtipooperacion=== 123) {
        if(this.model.idagencia === undefined)   {
          this.messageService.add({severity:'error', summary:'Agregar OTs', detail:'Debe seleccionar una agencia'});
            return;
        }
      }




      this.model.idusuariocreacion = 2;

      // this.selectedOTs.forEach(item => {


      //    this.ordenService.getOrdenTransporteByNumcp(item.numcp).subscribe(resp => {
      //      this.model.idordentrabajo =   resp.idordentrabajo;

      //      this.model.ids = ',' +   resp.idordentrabajo ;

      //      this.ordenService.asignarTipoOperacionAlmacen(this.model ).subscribe( x=> {


      //       this.messageService.add({severity:'success', summary:'Agregar OTs', detail:'Se han agregado las OTs de manera correcta'});

      //       this.ref.close();

      //     })
      //   })
      // });

      // this.ordenService.getOrdenTransporteByNumcp(this.model.numcp).subscribe(resp => {
      //      this.model.idordentrabajo =   resp.idordentrabajo;

      //      this.model.ids = ',' +   resp.idordentrabajo ;

      //      this.ordenService.asignarTipoOperacionAlmacen(this.model ).subscribe( x=> {

      //       this.ordenService.GenerarOTsPendientes(this.model).subscribe(x => {
      //         this.ref.close();

      //       })





      //     })


      // })



      // this.ordenService.agregarOtManifiesto(this.model).subscribe(resp => {
      //     this.ref.close();
      // });

    }


}
