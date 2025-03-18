import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService, SortEvent, SortMeta } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ToastModule } from 'primeng/toast';
import { Router, ActivatedRoute } from '@angular/router';
import { cloneDeep } from 'lodash';
import { OrdenTransporteService } from '../../recepcion/ordentransporte/ordentransporte.service';
import { Carga } from '../planning.types';
import { ModalTipoUnidadComponent } from '../porprovincia/modaltipounidad';
import { AsignarPlacalocalComponent } from './modal.asignarplacalocal';
import { ModalAsignaraCargaLocalComponent } from './modalasignaracarga';
import { SeleccionarDestinoModalComponent } from './modal.seleccionardestino';
import { CalendarModule } from 'primeng/calendar';
import { TableModule } from 'primeng/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MatIcon } from '@angular/material/icon';
import { PlanningService } from '../planning.service';
import { OrdenTransporte } from '../../recepcion/ordentransporte/ordentransporte.types';
import { Documento, Incidencia, User } from '../../trafico/trafico.types';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-planninglocal',
  templateUrl: './planninglocal.component.html',
  styleUrls: ['./planninglocal.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    ButtonModule,
    ToastModule,
    CalendarModule,
    TableModule,
    ConfirmDialogModule,
    MatIcon,
InputTextModule
  ],
  providers: [
    ConfirmationService,
    DialogService,
    MessageService
  ]
})
export class PlanninglocalComponent implements OnInit {
  sortMode: string = 'multiple';
  ordenes2: OrdenTransporte[] = [];




  ordenes11: OrdenTransporte[] = [];

  despacho: any;

  es: any;

  loading = false;
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


  carga11 = false;





  selectedDepartaments: OrdenTransporte[];
  selectedOTs: OrdenTransporte[]= [];

  constructor( private router: Router,
    private activatedRoute: ActivatedRoute,
    private confirmationService: ConfirmationService ,
    public dialogService: DialogService,
    private messageService: MessageService,
    private planningService: PlanningService,
    private ordenService: OrdenTransporteService) { }

      incidencias: Incidencia[] = [];
      carga: Carga[] = [];
      id: any;

      ref: DynamicDialogRef;

      documentos: Documento[];
      cols: any[];
      cols2: any[];
      selectedRows: any[];

  

      clonedOrders: { [s: string]: OrdenTransporte; } = {};

      orden: OrdenTransporte = {};
      despachos: OrdenTransporte[] = [];
      user: User ;

      model: any = {};
      dateInicio: Date = new Date(Date.now()) ;
      dateFin: Date = new Date(Date.now()) ;
 


ngOnInit() {


  this.user = JSON.parse(localStorage.getItem('user'));
  this.model.idusuariocreacion = this.user.id;
  this.model.idplanificador = this.user.id;

  this.es = {
    firstDayOfWeek: 1,
    dayNames: [ 'domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado' ],
    dayNamesShort: [ 'dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb' ],
    dayNamesMin: [ 'D', 'L', 'M', 'X', 'J', 'V', 'S' ],
    monthNames: [ 'enero', 'febrero', 'marzo', 'abril',
    'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre' ],
    monthNamesShort: [ 'ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic' ],
    today: 'Hoy',
    clear: 'Borrar'
};

  this.cols =
  [
      {header: 'OT', field: 'numcp'  ,  width: '80px' },
      {header: 'F. CITA', field: 'fechahoracita'  ,  width: '60px' },
      {header: 'H. CITA', field: 'horacita'  ,  width: '60px' },
      {header: 'CLIENTE', field: 'remitente'  ,   width: '160px'  },
      {header: 'ORIGEN', field: 'distritoOrigen'  ,  width: '70px'  },
      {header: 'PUNTO DE PARTIDA', field: 'origen'  ,  width: '20px' },
      {header: 'DESTINO', field: 'distritoDestino'  ,  width: '70px'  },
      {header: 'CENTRO DE ACOPIO', field: 'centroacopio'  ,  width: '20px' },

  
  
      {header: 'CONTACTO', field: 'personarecojo'  ,  width: '20px' },
  
      {header: 'OBSERVACIONES', field: 'observaciones'  ,  width: '20px' },
      {header: 'BULTOS', field: 'bulto'  , width: '30px'   },
      {header: 'PESO', field: 'peso'  ,  width: '30px'  },


  ];

//  this.cols2 = [
//     { field: 'numcp', header: 'N° OT',  width: '20px'},

//     {header: 'BULTOS', field: 'bulto'  , width: '60px'   },
//     {header: 'FECHA', field: 'fecharegistro'  , width: '60px'   },
//     {header: 'PESO', field: 'peso'  ,  width: '30px'  },
//     {header: 'SUBTOTAL', field: 'subtotal'  ,  width: '30px'  },
//     {header: 'DESTINO', field: 'destino'  ,  width: '30px'  },
//     {header: 'CLIENTE', field: 'razonsocial'  ,  width: '100px'  },
//     {header: 'TIPO', field: 'tipooperacion'  ,  width: '100px'  },
//     {header: 'ACCIONES', field: 'acciones'  ,  width: '30px'  },
//   ];



 this.cols2 = [
  { field: 'numcarga', header: 'N° MOVIL',  width: '60px'},
  {header: 'Tipo de Unidad', field: 'tipounidad'  , width: '60px'   },
  {header: 'Planificador', field: 'planificador'  ,  width: '90px'  },
  {header: 'Estado', field: 'estado'  ,  width: '90px'  },
  {header: 'Fecha de Registro', field: 'fecharegistro'  ,  width: '70px'  },
  {header: 'Peso', field: 'peso'  ,  width: '30px'  },
  {header: 'Volumen', field: 'volumen'  ,  width: '60px'  },
  {header: 'SubTotal', field: 'subtotal'  ,  width: '60px'  },
  {header: 'ACCIONES', field: 'acciones'  ,  width: '60px'  },
];

this.dateInicio.setDate((new Date()).getDate() - 7);
this.dateFin.setDate((new Date()).getDate() );


this.model.fec_ini = this.dateInicio;
this.model.fec_fin = this.dateFin;
this.model.idestado = 6; // pendiente de programación

this.id  = 10;

this.reloadDetalles();







}




buscar() {
  this.reloadDetalles();
}

planificar(){

}

generar(idcarga: number) {

  const ref = this.dialogService.open(AsignarPlacalocalComponent, {
  header: 'Confirmar Despacho',
  width: '40%',
  height: '450px',
  contentStyle: {'height': '450px', overflow: 'auto',  },
  data : { idcarga }
});
ref.onClose.subscribe(() => {

    this.reloadDetalles();
    this.loading = false;


});



}
onRowEditInit(order: OrdenTransporte) {
  this.clonedOrders[order.idordentrabajo] = {...order};
}
onRowEditSave(order: OrdenTransporte) {



  order.idusuarioentrega =  this.user.usr_int_id;

  this.ordenService.actualizarOTR(order).subscribe (resp => {

    // this.ordenService.GetAllOrdersDetailDistrito(this.user.idestacionorigen,this.id).subscribe(list =>  {

    //   this.ordenes2 =   list;
    //   console.log(this.ordenes2, 'pop')
      this.reloadDetalles();

   //});



  })


  if (order.idordentrabajo > 0) {
      delete this.clonedOrders[order.idordentrabajo];

  }
  else {
    // this.toastr.error('No se actualizó correctamente'
    // , 'Orden de Transporte', {
    //   closeButton: true
    // });
  }
}

onRowEditCancel(order: OrdenTransporte, index: number) {
  this.ordenes2[index] = this.clonedOrders[order.idordentrabajo];
  delete this.ordenes2[order.idordentrabajo];
}
eliminarDespacho(idcarga: number) {

  this.model.idcarga = idcarga;

  this.confirmationService.confirm({
    message: '¿Está seguro que desea eliminar el despacho?',
    header: 'Eliminar',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {


        this.planningService.eliminarDespacho(this.model).subscribe( resp =>  {

          this.reloadDetalles();
          this.messageService.add({ severity: 'success', summary: 'Planning', detail: 'Se ha eliminado de manera correcta.' });


        });

      },
      reject: () => {

      }

    });

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
verDocument(resp){
  const url = 'http://104.36.166.65/webreports/hojarutaor.aspx?idmanifiesto=' + String(resp.idmanifiesto)

  window.open(url);
}

crearcarga( ) {

  let ids  = '';
  this.selectedOTs.forEach(element => {
    ids = ids + ',' + element.iddepartamento;

  });


  this.ref = this.dialogService.open(ModalTipoUnidadComponent, {
    data : { tipoperacioncarga : 2  },
    header: 'Tipo de unidad a asignar',
    width: '40%',
    contentStyle: { overflow: 'auto' },
    baseZIndex: 10000,

});
  this.ref.onClose.subscribe(() => {
    this.reloadDetalles();
  });


}
agregaracarga() {


    if(this.selectedRows.length  === 0 ) {
        this.messageService.add({ severity: 'warn', summary: 'Planning', detail: 'Debe seleccionar al menos una OT.' });
        return ;
    }

  

   let ids = this.selectedRows;


  this.ref = this.dialogService.open(ModalAsignaraCargaLocalComponent, {
    data : { ids  },
    header: 'Asignar a carga',
    width: '40%',
    contentStyle: { overflow: 'auto' },
    baseZIndex: 10000,
  });

  this.ref.onClose.subscribe((product: any) => {
      this.reloadDetalles();
     });
   }

   reloadDetalles() {

    this.selectedRows  = [];

    this.loading = true;
    this.selectedOTs = [];

    this.bultosTotal =0;
    this.pesoTotal =0;
    this.subtotalTotal  =0;

    this.model.fechainicio = this.dateInicio.toLocaleDateString();
    this.model.fechafin = this.dateFin.toLocaleDateString();
    this.model.id = this.id;


    console.log(this.id);

    this.ordenService.GetAllOrdersDetailDistrito(this.user.idestacionorigen,this.model).subscribe(list =>  {
      this.ordenes2 =   list;
      this.otsTotal = this.ordenes2.length;


     console.log(this.ordenes2);

      this.ordenes2.forEach(x=> {

          this.bultosTotal = this.bultosTotal + x.bulto;
          this.pesoTotal = this.pesoTotal + x.peso;
          this.subtotalTotal  = this.subtotalTotal + x.subtotal;

      });




   });

    this.ordenService.GetAllCargasTemporalTrafico(2).subscribe(list1 => {
         this.despachos = list1;

         console.log('bolsas', this.despachos);
     });
   }
   modificarDestino() {

    var id = this.selectedDepartaments;

    this.ref = this.dialogService.open(SeleccionarDestinoModalComponent, {
      header: 'Seleccionar Destino',
      width: '40%',
      contentStyle: {'max-height': '400px', overflow: 'auto'},
      baseZIndex: 10000,
      data : {id }
  });

    this.ref.onClose.subscribe((product: any) => {
      if (product === undefined) { return; }
      else{

      }
  });


   }

   quitarSeleccionados() {

    this.selectedOTs.forEach(x=> {
        this.desasignarOT(x.idordentrabajo);

        const index = this.ordenes11.indexOf(x, 0);
        if (index > -1) {
          this.ordenes11.splice(index, 1);
        }

    });

    this.reloadDetalles();


   }
   quitarNoSeleccionados() {

        var ordenes = cloneDeep(this.ordenes11);


        ordenes.forEach(item => {
              var existe =   this.selectedOTs.find(x=> x.idordentrabajo == item.idordentrabajo);

              if(existe === undefined) {
                this.desasignarOT(item.idordentrabajo);

                const index = this.ordenes11.indexOf(item, 0);
                this.ordenes11.splice(index, 1);

              }
        });

        this.reloadDetalles();

       // this.ver(this.despacho);

   }


   asignarTipoOperacion(){

    let ids  = '';

    if(this.selectedOTs.length  === 0 )
      {
        // this.toastr.error('Debe seleccionar una o más OTs'
        // , 'Planning', {
        //   closeButton: true
        // });
        return ;
      }

    this.selectedOTs.forEach(element => {
      if(element.idordentrabajo === undefined){
        return;
      }

      ids = ids + ',' + element.idordentrabajo;

    });




  //   this.ref = this.dialogService.open(ModalAsignarTipoOperacionComponent, {
  //     header: 'Asignar Tipo de Operación',
  //     width: '50%',
  //     contentStyle: {'height': '350px', overflow: 'auto'},
  //     baseZIndex: 10000,
  //     data : {ids }
  // });

  //   this.ref.onClose.subscribe((product: any) => {

  //     this.reloadDetalles();
  //     return ;
  //   });

  }

  ver(idcarga){


    this.loading = true;

    this.router.navigate(['planning/generarrutaslocaldetalle', idcarga]);

    // this.ordenService.GetAllOrdersCargasTemporal(idcarga).subscribe(resp=>  {

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
  onSort(event: SortEvent) {

    const sortFields = event.field;
    const sortOrders = event.order;



      this.ordenes2.sort((a, b) => {

          const column = sortFields;
          const order = sortOrders;

          const value1 = a[column];
          const value2 = b[column];



          if (typeof value1 === 'string') {
            return order * value1.localeCompare(value2);
          } else if (typeof value1 === 'number') {
            return order * (value1 - value2);
          } else if (value1 instanceof Date && value2 instanceof Date) {
            return order * (value1.getTime() - value2.getTime());
          }
          // Agrega más casos según los tipos de datos de tus columnas

        return 0;
      });

  }
}

