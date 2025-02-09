import { CommonModule } from '@angular/common';
import {Component, OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { OrdenTransporte } from '../../recepcion/ordentransporte/ordentransporte.types';
import { OrdenTransporteService } from '../../recepcion/ordentransporte/ordentransporte.service';
import { DespachoService } from '../despacho.service';



@Component({
    template: `

            <div class=" mb-3 col-md-12">
                <h6>GRT :</h6>
                <input type="text" name="grt" autocomplete="off" class="form-control"   [(ngModel)]="model.grt"   placeholder="Número de OT"   pInputText />

                <div class=" mb-3 col-md-4">
                    <button  class='btn-primary btn-block btn' pButton iconPos="left" label="Generar" icon="fa fa-plus"  (click)="generar()"  type="button"></button>
              </div>
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
export class GrtModalComponent  implements OnInit {


    model : any = {};
    ordenes2: OrdenTransporte[] = [];
    numhojaruta : string ;
    cols: any[];



    constructor(private ordenService: OrdenTransporteService,
               private despachoService: DespachoService,
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

      this.ordenService.getAllOrdersForDespachoAll(this.numhojaruta).subscribe(list =>  {

           this.ordenes2 =   list;

        });
    }



    generar() {

      this.despachoService.generarGrt(this.numhojaruta ,  this.model.grt).subscribe ( x=> {


        console.log(this.ordenes2);


        let idcarga = this.ordenes2[0].idcarga;

        var url = "http://104.36.166.65/webreports/guiatransportista.aspx?idcarga=" + String(idcarga);
        window.open(url);

        this.ref.close();


      });

    }
  


}
