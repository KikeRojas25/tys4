import {Component, OnInit} from '@angular/core';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { OrdenTransporteService } from '../../recepcion/ordentransporte/ordentransporte.service';
import { ToastModule } from 'primeng/toast';
import { OrdenTransporte } from '../../recepcion/ordentransporte/ordentransporte.types';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';



@Component({
    template: `

<div class=" mb-3 col-md-12">
  <div class=" row col-md-12 mb-2">
            <div  *ngIf="!manifiestos" class="col-md-2"> 
                   <p-button  severity="success"   icon='pi pi-check' label="Confirmar"  (click)='confirmar();' > </p-button>
             </div>

  </div>
              <p-table  [columns]="cols"
                       [style]="{width:'100%'}"  editMode="row" dataKey="idordentrabajo"
                      [rowsPerPageOptions]="[20,40,60,120]"
                      [value]="ordenes2" #dt [paginator]="true"
                      [(selection)]="selectedOTs" selectionMode="multiple"
                      [rows]="10" [resizableColumns]="true" [responsive]="true" >


                        <ng-template pTemplate="colgroup" let-columns>
                          <colgroup>
                              <col *ngFor="let col of columns"   [ngStyle]="{'width': col.width}" >
                          </colgroup>
                       </ng-template>


                        <ng-template pTemplate="header" let-columns>
                          <tr>
                          <th style="text-align:center;width: 4rem">
                            <p-tableHeaderCheckbox></p-tableHeaderCheckbox>
                          </th>

                            <th  [ngStyle]="{'width': col.width}" *ngFor="let col of columns" pResizableColumn [pSortableColumn]="col.field">
                                {{col.header}}

                            </th>
                          </tr>
                          <tr>
                      
                             <th colspan="3">
                                <input pInputText type="text" style="width:'60px'" (input)="dt.filter($event.target.value, 'numcp', 'contains')" placeholder="Número de OT" class="p-column-filter">
                            </th>
                          </tr>
                      </ng-template>







                    <ng-template pTemplate="body" let-rowData  let-ri="rowIndex" let-index="rowIndex">
                      <tr>
                            <!-- <td class="ui-resizable-column" style="text-align:left;">
                              <button type='button' pButton  class="p-button-rounded p-button-text" label=""   title='Confirmar' icon='fa fa-check'  (click)='confirmar(rowData.idordentrabajo);' > </button>
                            </td> -->

                             <td class="ui-resizable-column" style="text-align:center;">
                                <p-tableCheckbox [value]="rowData"></p-tableCheckbox>
                            </td>
                            <td class="ui-resizable-column" style="text-align:center;" > {{ rowData.nummanifiesto    }}   </td>
                            <td class="ui-resizable-column" style="text-align:center;" > {{ rowData.numcp    }}   </td>
                            <td class="ui-resizable-column" style="text-align:left;"> {{rowData.provinciaDestino  }} </td>
                            <td class="ui-resizable-column" style="text-align:left;"> {{rowData.remitente  }} </td>
                            <td class="ui-resizable-column" style="text-align:center;"> {{rowData.tipooperacion  }}</td>
                            <td class="ui-resizable-column" style="text-align:left;"> {{rowData.destinatario}}</td>
                            <td class="ui-resizable-column" style="text-align:left;"> {{rowData.peso}}</td>
                            <td class="ui-resizable-column" style="text-align:left;"> {{rowData.bulto}}</td>
                      </tr>
                      <tr>

                      </tr>
                    </ng-template>
                    </p-table>


</div>





    `,
    standalone: true,
    imports:[
      CommonModule,
      FormsModule,
      CheckboxModule,
      TableModule,
      ButtonModule,
      ToastModule,
      InputTextModule

    ]
})
export class ConfirmarEstibaModalComponent  implements OnInit {


    model : any = {};
    ordenes2: OrdenTransporte[] = [];
    mani: any = [];
    numhojaruta : string ;
    cols: any[];
    selectedOTs: OrdenTransporte[] = [];
    manifiestos: boolean = false;


    constructor(private ordenService: OrdenTransporteService
        , public messageService: MessageService
        ,       public ref: DynamicDialogRef, public config: DynamicDialogConfig) {

               this.numhojaruta =   config.data.hojaruta;
               this.mani = config.data.manifiestos

         }

    ngOnInit() {

      this.cols =
      [
          // {header: 'ACCIÓN', field: 'idordentrabajo'  ,  width: '80px' },
          {header: 'MANIFIESTO', field: 'nummanifiesto'  ,  width: '105px' },
          {header: 'N° OT', field: 'numcp'  ,  width: '105px' },
          {header: 'PPOVINCIA', field: 'provinciadestino' , width: '180px'  },
          {header: 'REMITENTE', field: 'remitente' , width: '180px'  },
          {header: 'TIPO DE OPERACIÓN', field: 'tipooperacion' , width: '100px'  },
          {header: 'DESTINATARIO', field: 'destinatario'  , width: '180px'   },
          {header: 'PESO', field: 'peso' , width: '180px'  },
          {header: 'BULTO', field: 'bulto' , width: '180px'  },

      ];

      this.ordenService.getAllOrdersForDespacho(this.numhojaruta).subscribe(list =>  {

              this.ordenes2 = list;
              if(this.ordenes2.length === 0)
              {
                this.manifiestos = true;
              }

              
        console.log('xD', this.manifiestos);
        });
    }

    cargarDestinatarios(hojaruta: any) {



    }

    confirmar() {

      if(this.selectedOTs.length === 0){
        this.messageService.add({severity:'error', summary:'Confirmar Estiba', detail:'Debe seleccionar al menos una OT.'});
        return ;
      }

      this.ordenService.confirmarEstibaxOTs(this.selectedOTs).subscribe ( x=> {

         if(x.terminado === true) {
           this.messageService.add({severity:'success', summary:'Confirmar Estiba', detail:'Se ha culminado con la carga del camión, ya puede imprimir los MANIFIESTOS'});
         }

        this.ordenService.getAllOrdersForDespacho(this.numhojaruta).subscribe(list =>  {
              this.ordenes2 = list;
          });

      });
    }
}
