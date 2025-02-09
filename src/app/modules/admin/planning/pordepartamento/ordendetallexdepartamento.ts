import { CommonModule } from '@angular/common';
import {Component, OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { PlanningService } from '../planning.service';
import { OrdenTransporte } from '../../recepcion/ordentransporte/ordentransporte.types';



@Component({
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule
    ],
    template: `

<div class="col-md-12">

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

                            <td class="ui-resizable-column" style="text-align:center;" > {{ rowData.numcp    }}   </td>
                            <td class="ui-resizable-column" style="text-align:left;"> {{rowData.remitente  }} </td>
                            <td class="ui-resizable-column" style="text-align:center;"> {{rowData.fecharecojo | date:'dd/MM/yyyy'  }}</td>
                            <td class="ui-resizable-column" style="text-align:left;"> {{rowData.destinatario}}</td>
                            <td class="ui-resizable-column" style="text-align:left;"> S/. {{rowData.subtotal}}</td>
                            <td class="ui-resizable-column" style="text-align:left;"> {{rowData.peso}}</td>
                            <td class="ui-resizable-column" style="text-align:left;"> {{rowData.bulto}}</td>
                      </tr>
                    </ng-template>
                    </p-table>


</div>




    `
})
export class VerDetalleOrdenxDepartamentoModalComponent  implements OnInit {


    model : any = {};
    ordenes2: OrdenTransporte[] = [];
    iddepartamento : number ;
    idestacionorigen: number;
    cols: any[];



    constructor(private ordenService: PlanningService
        ,       public ref: DynamicDialogRef, public config: DynamicDialogConfig) {

               this.iddepartamento =   config.data.iddepartamento;
               this.idestacionorigen = config.data.idestacionorigen;

         }

    ngOnInit() {

      this.cols =
      [
          {header: 'N° OT', field: 'idordentrabajo'  ,  width: '105px' },
          {header: 'REMITENTE', field: 'remitente' , width: '180px'  },
          {header: 'FEC. RECOJO', field: 'tipooperacion' , width: '100px'  },
          {header: 'DESTINATARIO', field: 'destinatario'  , width: '180px'   },
          {header: 'SUBTOTAL', field: 'subtotal'  , width: '60px'   },
          {header: 'PESO', field: 'peso' , width: '60px'  },
          {header: 'BULTO', field: 'bulto' , width: '60px'  },

      ];

      this.ordenService.GetAllOrdersDetailDeparment(this.idestacionorigen,this.iddepartamento).subscribe(list =>  {

           this.ordenes2 =   list;
           console.log(this.ordenes2, 'pop')

        });
    }






}
