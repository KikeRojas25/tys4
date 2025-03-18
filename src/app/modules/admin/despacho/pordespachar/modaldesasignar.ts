import { CommonModule } from '@angular/common';
import {Component, OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { OrdenTransporteService } from '../../recepcion/ordentransporte/ordentransporte.service';
import { OrdenTransporte } from '../../recepcion/ordentransporte/ordentransporte.types';
import { DespachoService } from '../despacho.service';


@Component({
    template: `

<div class=" mb-3 col-md-12">

              <p-table  [columns]="cols"
                       [style]="{width:'100%'}"  editMode="row" dataKey="idordentrabajo"
                      [rowsPerPageOptions]="[20,40,60,120]"
                      [value]="ordenes2" #dt [paginator]="true"
                      [rows]="10" [resizableColumns]="true" [responsive]="true" >


                        <ng-template pTemplate="colgroup" let-columns>
                          <colgroup>
                              <col *ngFor="let col of columns"   [ngStyle]="{'width': col.width}" >
                          </colgroup>
                       </ng-template>


                        <ng-template pTemplate="header" let-columns>
                          <tr>

                              <th  [ngStyle]="{'width': col.width}" *ngFor="let col of columns" pResizableColumn [pSortableColumn]="col.field">
                                  {{col.header}}

                              </th>
                          </tr>
                      </ng-template>




                    <ng-template pTemplate="body" let-rowData  let-ri="rowIndex" let-index="rowIndex">
                      <tr>
                            <td class="ui-resizable-column" style="text-align:left;">
                              <button type='button' pButton  class="p-button-rounded p-button-text" label=""   title='Ver Fotos' icon='fa fa-times'  (click)='desasociar(rowData.idordentrabajo);' > </button>
                            </td>
                            <td class="ui-resizable-column" style="text-align:center;" > {{ rowData.numcp    }}   </td>
                            <td class="ui-resizable-column" style="text-align:left;"> {{rowData.remitente  }} </td>
                            <td class="ui-resizable-column" style="text-align:center;"> {{rowData.tipooperacion  }}</td>
                            <td class="ui-resizable-column" style="text-align:left;"> {{rowData.destinatario}}</td>
                            <td class="ui-resizable-column" style="text-align:left;"> {{rowData.peso}}</td>
                            <td class="ui-resizable-column" style="text-align:left;"> {{rowData.bulto}}</td>
                      </tr>
                    </ng-template>
                    </p-table>


</div>




    `
    ,
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
export class DesasignarModalComponent  implements OnInit {


    model : any = {};
    ordenes2: OrdenTransporte[] = [];
    numhojaruta : string ;
    cols: any[];



    constructor(private ordenService: OrdenTransporteService,
                private despachoService: DespachoService,
                 public messageService: MessageService,
                private confirmationService: ConfirmationService,
               public ref: DynamicDialogRef, public config: DynamicDialogConfig) {

               this.numhojaruta =   config.data.hojaruta;

         }

    ngOnInit() {

      this.cols =
      [
          {header: 'ACCIÓN', field: 'idordentrabajo'  ,  width: '80px' },
          {header: 'N° OT', field: 'idordentrabajo'  ,  width: '105px' },
          {header: 'REMITENTE', field: 'remitente' , width: '180px'  },
          {header: 'TIPO DE OPERACIÓN', field: 'tipooperacion' , width: '100px'  },
          {header: 'DESTINATARIO', field: 'destinatario'  , width: '180px'   },
          {header: 'PESO', field: 'peso' , width: '180px'  },
          {header: 'BULTO', field: 'bulto' , width: '180px'  },

      ];

      this.ordenService.getAllOrdersForDespacho(this.numhojaruta).subscribe(list =>  {

           this.ordenes2 =   list;

        });
    }


    cargarDestinatarios(hojaruta: any) {


    }
    desasociar(idordentrabajo: number) {


      this.confirmationService.confirm({
        message: '¿Esta seguro que desea desvincular del despacho esta OT?',
        accept: () => {


      this.despachoService.desvincularOt(idordentrabajo).subscribe ( x=> {


        this.messageService.add({severity:'success', summary:'Desvincular OT', detail:'Se ha desvinculado correctamente.'});



        this.ordenService.getAllOrdersForDespacho(this.numhojaruta).subscribe(list =>  {

          this.ordenes2 =   list;

       });

      });

      },
      reject: () => {
          this.ref.close();
      }
    
    });
  }


}
