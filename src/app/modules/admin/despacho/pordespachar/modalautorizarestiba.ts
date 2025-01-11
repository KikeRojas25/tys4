import {Component, OnInit} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig, DialogService } from 'primeng/dynamicdialog';
import { OrdenTransporte } from '../../trafico/trafico.types';
import { AuthService } from 'app/core/auth/auth.service';
import { DespachoService } from '../despacho.service';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';


@Component({
    template: `

<div class=" mb-3 col-md-12">
  <div class=" row col-md-12 mb-2">
  <form #loginForm="ngForm" (ngSubmit)="login(loginForm)">

            <div class="form-group">

                <input  pInputText id="email" type="text" style="width:100% ;"
                placeholder="Usuario" autocomplete="off" name="email" required [(ngModel)]="model.email" />


            </div>
            <div class="form-group">

              <input pInputText id="password" type="password"  style="width:100% ;"
              placeholder="Contraseña" name="password" required [(ngModel)]="model.password"/>
          </div>
            <!-- <div class="form-group row login-tools">
              <div class="col-2 login-remember">
                <label class="custom-control custom-checkbox">
                  <input class="custom-control-input" id="recuerdame" type="checkbox" name="recuerdame" [(ngModel)]="model.recuerdame"><span class="custom-control-label">. Recuérdame</span>
                </label>
              </div>
               <div class="col-6 login-forgot-password"><a href="pages-forgot-password.html">¿Olvidaste tu contraseña?</a></div>
            </div> -->
            <div class="form-group login-submit">
              <button [disabled]="!loginForm.valid" class="btn btn-primary btn-xl" type="submit">Autorizar</button>
            </div>


          </form>

  </div>


</div>

<p-toast />
    `,
    standalone: true,
    imports: [
      FormsModule,
      CommonModule,
      ToastModule,
      InputTextModule,
      ButtonModule
    ],
    providers: [
      DialogService,
      ConfirmationService,
      MessageService
    ]
})
export class AutorizarEstibaModalComponent  implements OnInit {


    model : any = {};
    ordenes2: OrdenTransporte[] = [];
    mani: any = [];
    numhojaruta : string ;
    cols: any[];
    selectedOTs: OrdenTransporte[] = [];
    manifiestos: boolean;


    constructor(private ordenService: DespachoService
        , public messageService: MessageService
        ,  private authService: AuthService
        ,  public ref: DynamicDialogRef, public config: DynamicDialogConfig) {

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
        });
    }

  



    confirmar() {

      if(this.selectedOTs.length === 0){
        this.messageService.add({severity:'error', summary:'Confirmar Estiba', detail:'Debe seleccionar al menos una OT.'});
        return ;
      }

      this.ordenService.confirmarEstibaxOTs(this.selectedOTs).subscribe ( x=> {

         if(x.terminado === true)
         {
           this.messageService.add({severity:'success', summary:'Confirmar Estiba', detail:'Se ha culminado con la carga del camión, ya puede imprimir los MANIFIESTOS'});
         }

        this.ordenService.getAllOrdersForDespacho(this.numhojaruta).subscribe(list =>  {
              this.ordenes2 = list;
          });

      });
    }
    login(form: NgForm) {

      if (form.invalid) {
        return;
      }
      this.authService.authorization(this.model).subscribe(resp => {

            console.log('respuesta' ,resp);




            // const found = resp.roles.find((element) => element.rol_int_id === 10 ||element.rol_int_id === 2);

            // if(found === undefined )
            // {
            //   this.messageService.add({severity:'error', summary:'Confirmar Estiba', detail:'No se ha autorizado con éxito, Ud. no tiene los permisos necesarios para esta acción.'});
            // }
            // else
            // {
               this.messageService.add({severity:'success', summary:'Confirmar Estiba' , detail :'Se ha autorizado con éxito.'});

               this.ordenService.autorizarHojaRuta(this.numhojaruta).subscribe(resp => {

                  this.ref.close();


               });

           // }

            // if(element.rol_int_id === 13 || element.rol_int_id === 2){
            //   this.toastr.success('Se ha autorizado con éxito.', 'TYS');
            //   return;
            // }
            // else {
            // //  this.toastr.error('No se ha autorizado con éxito, Ud. no tiene los permisos necesarios para esta acción.', 'TYS');
            // }



      }, error => {

          if ('Unauthorized' === error.statusText) {
             this.messageService.add({severity:'error', summary:'Confirmar Estiba' , detail :'usuario y/o contraseña incorrecta, o ud no cuenta con los permisos para autorizar esta operación.'});
          }
      }, () => {

          this.ref.close();

      });
    }
}
