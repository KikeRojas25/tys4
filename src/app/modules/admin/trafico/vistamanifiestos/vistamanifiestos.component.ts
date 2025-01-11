import { Component } from '@angular/core';
import { Documento, HojaRuta, Incidencia, Manifiesto, OrdenTransporte, User } from '../trafico.types';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TraficoService } from '../trafico.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CambiarEstadoModalComponent } from './modalcambiarestado';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-vistamanifiestos',
  standalone: true,
  templateUrl: './vistamanifiestos.component.html',
  styleUrl: './vistamanifiestos.component.scss',
  imports: [
    TableModule,
    FormsModule,
    CommonModule,
    ButtonModule,
    MatIcon,
    PanelModule,
    TabViewModule,
    ProgressBarModule,
    RouterModule ,
    DialogModule ,
    ToastModule

  ],
  providers: [ConfirmationService,DialogService,MessageService ]
})
export class VistamanifiestosComponent {

  modalDetalleManifiesto = false;
  ordenes2: HojaRuta[] = [];
  ordenes11: OrdenTransporte[] = [];
  baseUrlMani: string = 'http://104.36.166.65/webreports/manifiesto.aspx';
  baseUrlOrde: string = 'http://104.36.166.65/webreports/ot.aspx';

  ref: DynamicDialogRef | undefined;
 


  despacho: any;



  cantidadTotal : number = 0;
  pesoTotal : number = 0;
  otsTotal:number = 0;
  bultosTotal: number = 0;
  subtotalTotal: number = 0;

  cantidadTotal1 : number = 0;
  pesoTotal1 : number = 0;
  otsTotal1:number = 0;
  bultosTotal1: number = 0;
  subtotalTotal1: number = 0;


  cantidadTotal2 : number = 0;
  pesoTotal2 : number = 0;
  otsTotal2:number = 0;
  bultosTotal2: number = 0;
  subtotalTotal2: number = 0;




  selectedDepartaments: Manifiesto[];
  selectedOTs: Manifiesto[]= [];

  constructor( private router: Router,
    private activatedRoute: ActivatedRoute,
    private confirmationService: ConfirmationService ,
    private messageService: MessageService,
    public dialogService: DialogService,
    private traficoService: TraficoService) { }

incidencias: Incidencia[] = [];
id: any;


documentos: Documento[];
cols: any[];
cols2: any[];

cols3: any[];



orden: HojaRuta = {};
despachos: Manifiesto[] = [];
user: User ;

model: any = {};




ngOnInit() {


  this.user = JSON.parse(localStorage.getItem('user'));
  this.model.IdUsuarioRegistro = this.user.usr_int_id;


  this.cols =
  [
      {header: 'PROVINCIA', field: 'provincia'  ,  width: '120px' },
      {header: 'CANTIDAD', field: 'cantidad' , width: '60px'  },
      {header: 'BULTOS', field: 'bulto'  , width: '60px'   },
      {header: 'PESO', field: 'peso'  ,  width: '60px'  },
      {header: 'VOLUMEN', field: 'volumen'  ,  width: '60px'  },
      {header: 'SUBTOTAL', field: 'subtotal'  ,  width: '60px'  }

  ];

 this.cols2 = [
    { field: 'numcp', header: 'N° OT',  width: '20px'},
    {header: 'FECHA', field: 'fecharegistro'  , width: '60px'   },
    {header: 'DESTINO', field: 'destino'  ,  width: '30px'  },
    {header: 'CLIENTE', field: 'razonsocial'  ,  width: '100px'  },
    {header: 'TIPO OP', field: 'tipooperacion'  ,  width: '100px'  },
    {header: 'BULTOS', field: 'bulto'  , width: '60px'   },
    {header: 'PESO', field: 'peso'  ,  width: '30px'  },
    {header: 'ACCIONES', field: 'acciones'  ,  width: '30px'  },
  ];



 this.cols3 = [

  { field: 'nummanifiesto', header: 'Manifiesto',  width: '60px'},
  {header: 'Destino', field: 'provincia'  , width: '90px'   },
  {header: 'Tipo Operación', field: 'tipooperacion'  ,  width: '90px'  },
  {header: 'Destinatario', field: 'repartidor'  ,  width: '120px'  },
  {header: 'Estado', field: 'estado'  ,  width: '90px'  },
  {header: 'Fecha ult. estado', field: 'fecha_estado_actual'  ,  width: '70px'  },
  {header: 'Fecha programada', field: 'fecha_eta'  ,  width: '70px'  },
  {header: 'Dif. Fechas', field: 'diferencia_fechas'  ,  width: '120px'  },
  {header: 'Peso', field: 'peso'  ,  width: '30px'  },
  {header: 'Acc', field: 'acciones'  ,  width: '30px'  },
];





this.id  = this.activatedRoute.snapshot.params['id'];

this.reloadDetalles() ;



}




verManifiesto(idManifiesto: number) {

  const url = `${this.baseUrlMani}?idmanifiesto=${idManifiesto}`;
   window.open(url, '_blank');

}
verOt(idOrden: number) {
  const url = `${this.baseUrlOrde}?idorden=${idOrden}`;
  window.open(url, '_blank');
}


generar(idcarga: number) {



// const ref = this.dialogService.open(AsignarPlacaComponent, {
//   header: 'Confirmar Despacho',
//   width: '40%',
//   height: '450px',
//   contentStyle: {'height': '450px', overflow: 'auto',  },
//   data : { idcarga }
// });
// ref.onClose.subscribe(() => {

//   this.reloadDetalles();
//   this.loading = false;


// });



}
eliminarDespacho(idcarga: number) {

  // this.model.idcarga = idcarga;

  // this.confirmationService.confirm({
  //   message: '¿Está seguro que desea eliminar el despacho?',
  //   header: 'Eliminar',
  //   icon: 'pi pi-exclamation-triangle',
  //   accept: () => {


  //       this.ordenService.eliminarDespacho(this.model).subscribe( resp =>  {

  //         this.reloadDetalles();

  //       });

  //     },
  //     reject: () => {

  //     }

  //   });

}


verOT(idordentrabajo: number){

  this.router.navigate(['/seguimiento/verorden', idordentrabajo]);

}

desasignarOT(idordentrabajo: number){

  // this.ordenService.DesAsignarProvinciaCarga(idordentrabajo).subscribe(resp=>  {

  //         this.reloadDetalles();
  //         this.ordenService.GetAllOrdersGroupProvincias(this.id).subscribe(list => {
  //         this.ordenes2 = list;

  //      });
  // });


}

crearcarga( ) {

//   let ids  = '';
//   this.selectedOTs.forEach(element => {
//     ids = ids + ',' + element.iddepartamento;

//   });


//   this.ref = this.dialogService.open(ModalTipoUnidadComponent, {
//     data : { ids  },
//     header: 'Tipo de unidad a asignar',
//     width: '40%',
//     contentStyle: { overflow: 'auto' },
//     baseZIndex: 10000,

// });
//   this.ref.onClose.subscribe(() => {
//     this.reloadDetalles();
//   });


}
verEventos(id) {

  

  this.traficoService.ListarOrdenesTransporte(id).subscribe(x=> {

    console.log(x);
    this.ordenes11 = x;

  });


this.modalDetalleManifiesto = true;

}
agregaracarga() {

  // let ids = this.selectedDepartaments;

  // this.ref = this.dialogService.open(ModalAsignaraCargaComponent, {
  //   data : { ids  },
  //   header: 'Asignar a carga',
  //   width: '40%',
  //   contentStyle: { overflow: 'auto' },
  //   baseZIndex: 10000,
  // });

  // this.ref.onClose.subscribe((product: any) => {
  //     this.reloadDetalles();
  //    });
  //  }
}

   reloadDetalles() {

    this.traficoService.VerResumenManifiesto(this.id).subscribe(list => {
      this.despachos = list;

      console.log('despachos', this.despachos);


      this.model.nombrechofer = this.despachos[0].chofer;
      this.model.numHojaRuta = this.despachos[0].numHojaRuta;
      this.model.placa = this.despachos[0].placa;

    });



  }
   




   cambiarTipoOperacion(){

    // let ids  = '';

    // if(this.selectedOTs.length  === 0 )
    //   {
    //     this.toastr.error('Debe seleccionar una o más OTs'
    //     , 'Planning', {
    //       closeButton: true
    //     });
    //     return ;
    //   }

    // this.selectedOTs.forEach(element => {
    //   if(element.idordentrabajo === undefined){
    //     return;
    //   }

    //   ids = ids + ',' + element.idordentrabajo;

    // });




  //   this.ref = this.dialogService.open(ModalAsignarTipoOperacionComponent, {
  //     header: 'Reasignar Recursos',
  //     width: '50%',
  //     contentStyle: {overflow: 'auto'},
  //     baseZIndex: 10000,
  //     data : {ids }
  // });

  //   this.ref.onClose.subscribe((product: any) => {

  //     //this.reloadDetalles();
  //     return ;
  //   });

  }
   cambiarEstado(){

    let ids  = '';

    if(this.selectedOTs.length  === 0 )
      {
        // this.toastr.error('Debe seleccionar una o más OTs'
        // , 'Planning', {
        //   closeButton: true
        // });

        this.messageService.add({ severity:'warn', summary:'Tráfico', detail:'Debe seleccionar uno o más manifiestos'  })
        return ;
      }

    this.selectedOTs.forEach(element => {
      if(element.idManifiesto === undefined){
        return;
      }

      ids = ids + ',' + element.idManifiesto;

    });




    this.ref = this.dialogService.open(CambiarEstadoModalComponent, {
      header: 'Asignar Estado',
      width: '50%',
      contentStyle: {overflow: 'auto'},
      baseZIndex: 10000,
      data : {ids }
  });

    this.ref.onClose.subscribe((product: any) => {

      this.reloadDetalles();

      return ;
    });

  }







   reprogramarArribos(){

  //   let ids  = '';



  //   if(this.selectedOTs.length  === 0 )
  //     {
  //       this.toastr.error('Debe seleccionar una o más OTs'
  //       , 'Planning', {
  //         closeButton: true
  //       });
  //       return ;
  //     }

  //   this.selectedOTs.forEach(element => {
  //     if(element.idmanifiesto === undefined){
  //       return;
  //     }

  //     ids = ids + ',' + element.idmanifiesto;

  //   });


  //    ids = ids.substring(1, ids.length + 1);

  //    console.log(ids,'seleccionado');

  //   this.ref = this.dialogService.open(ModalReprogramarArribosComponent, {
  //     header: 'Fechas Aproximadas de llegada',
  //     width: '50%',
  //     contentStyle: { overflow: 'auto'},
  //     baseZIndex: 10000,
  //     data : {ids }
  // });

  //   this.ref.onClose.subscribe((product: any) => {

  //     //this.reloadDetalles();
  //     return ;
  //   });

  }
  ver(despacho){



    // this.loading = true;

    // this.ordenService.GetAllOrdersCargasTemporal(despacho.data.idcarga).subscribe(resp=>  {

    //   this.loading = false;

    //   this.ordenes11 = resp;
    //   if(resp.length === 0)
    //   {
    //     this.toastr.warning('El despacho aún no contiene órdenes' , 'Planning', {   closeButton: true   });
    //     this.carga11detalle = '';
    //     return ;
    //   }

    //   this.carga11detalle = resp![0].numcarga!;
    // });


  }

}

