import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { User } from 'app/core/user/user.types';
import { cloneDeep } from 'lodash';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { OrdenTransporteService } from '../../recepcion/ordentransporte/ordentransporte.service';
import { OrdenTransporte, Incidencia, Documento } from '../../trafico/trafico.types';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Carga } from '../planning.types';
import { PlanningService } from '../planning.service';
import { MatIcon } from '@angular/material/icon';
import { AsignarPlacaComponent } from './modal.asignarplaca';
import { ModalTipoUnidadComponent } from './modaltipounidad';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ModalAsignarTipoOperacionComponent } from './modalasignartipooperacion';
import { ModalAsignaraCargaComponent } from './modalasignaracarga';
import { MessagesModule } from 'primeng/messages';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-porprovincia',
  templateUrl: './porprovincia.component.html',
  styleUrls: ['./porprovincia.component.css'],
  standalone: true,
  imports: [ 
    FormsModule,
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    CheckboxModule,
    MatIcon,
    ConfirmDialogModule ,
    MessagesModule,
    ToastModule
  ],
  providers: [
    ConfirmationService,
    DialogService,
    MessageService
  ]
})
export class PorprovinciaComponent implements OnInit {

 
  ordenes2: OrdenTransporte[] = [];




  ordenes11: OrdenTransporte[] = [];
  ordenes22: OrdenTransporte[] = [];


  despacho: any;



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
  carga22 = false;




  carga11detalle = '';



  selectedDepartaments: OrdenTransporte[];
  selectedOTs: OrdenTransporte[]= [];

  constructor( private router: Router,
    private activatedRoute: ActivatedRoute,
    private confirmationService: ConfirmationService ,
    public dialogService: DialogService,
    private planningService: PlanningService,
    private messageService: MessageService,
    private ordenService: OrdenTransporteService) { }

incidencias: Incidencia[] = [];
carga: Carga[] = [];
id: any;

zoom = 16;
ref: DynamicDialogRef;

documentos: Documento[];
cols: any[];
cols2: any[];

cols3: any[];



orden: OrdenTransporte = {};
despachos: OrdenTransporte[] = [];
user: User ;

model: any = {};




ngOnInit() {


  this.user = JSON.parse(localStorage.getItem('user'));
  this.model.idusuariocreacion = this.user.usr_int_id;


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
    { field: 'numcp', header: 'N° OT',  width: '120px'},
    {header: 'BULTOS', field: 'bulto'  , width: '60px'   },
    {header: 'FECHA', field: 'fecharegistro'  , width: '60px'   },
    {header: 'PESO', field: 'peso'  ,  width: '30px'  },
    {header: 'SUBTOTAL', field: 'subtotal'  ,  width: '30px'  },
    {header: 'DESTINO', field: 'destino'  ,  width: '30px'  },
    {header: 'CLIENTE', field: 'razonsocial'  ,  width: '100px'  },
    {header: 'TIPO', field: 'tipooperacion'  ,  width: '100px'  },
    {header: 'ACCIONES', field: 'acciones'  ,  width: '30px'  },
  ];



 this.cols3 = [
  { field: 'numcarga', header: 'N° Despacho',  width: '60px'},
  {header: 'Tipo de Unidad', field: 'tipounidad'  , width: '60px'   },
  {header: 'Planificador', field: 'planificador'  ,  width: '90px'  },
  {header: 'Estado', field: 'estado'  ,  width: '90px'  },
  {header: 'Fecha de Registro', field: 'fecharegistro'  ,  width: '70px'  },
  {header: 'Peso', field: 'peso'  ,  width: '30px'  },
  {header: 'Volumen', field: 'volumen'  ,  width: '60px'  },
  {header: 'SubTotal', field: 'subtotal'  ,  width: '60px'  },
  {header: 'ACCIONES', field: 'acciones'  ,  width: '60px'  },
];









this.reloadDetalles();



}






planificar(){

}

generar(idcarga: number) {

  const ref = this.dialogService.open(AsignarPlacaComponent, {
  header: 'Confirmar Despacho',
  width: '40%',
  height: '450px',
  contentStyle: {'height': '450px', overflow: 'auto',  },
  data : { idcarga }
});
ref.onClose.subscribe(() => {

  this.reloadDetalles();


});



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

  this.planningService.DesAsignarProvinciaCarga(idordentrabajo).subscribe(resp=>  {

          this.reloadDetalles();
  });


}

crearcarga( ) {

  let ids  = '';
  this.selectedOTs.forEach(element => {
    ids = ids + ',' + element.iddepartamento;

  });


  this.ref = this.dialogService.open(ModalTipoUnidadComponent, {
    data : { id : 1  },
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

  let ids = this.selectedDepartaments;

    this.ref = this.dialogService.open(ModalAsignaraCargaComponent, {
      data : { ids  },
      header: 'Asignar a carga',
      width: '40%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
    });

    this.ref.onClose.subscribe((product: any) => {
        this.reloadDetalles();

        this.messageService.add({ severity: 'success', summary: 'Planning', detail: 'Se ha agregado la provincia de manera correcta.' });

      });
   }

   reloadDetalles() {

    this.selectedOTs = [];
    this.id  = this.activatedRoute.snapshot.params.uid;
    this.model.ids = this.id;
    this.model.idestacionorigen = this.user.idestacionorigen;

    this.planningService.GetAllOrdersGroupProvincias(this.model).subscribe(list => {
      this.ordenes2 = list;

          this.ordenes2.forEach(obj => {

        this.otsTotal =  this.otsTotal + obj.cantidad;
        this.bultosTotal =  this.bultosTotal + obj.bulto;
        this.pesoTotal =  this.pesoTotal + obj.peso;
        this.subtotalTotal = this.subtotalTotal  + obj.subtotal;

     });


    });


    this.ordenService.GetAllCargasTemporal(1).subscribe(list1 => {

       this.despachos = list1;



     });

     this.ver(this.despacho);



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



   }

   asignarTipoOperacion(){

    let ids  = '';

    if(this.selectedOTs.length  === 0 )
      {
       
        return ;
      }

    this.selectedOTs.forEach(element => {
      if(element.idordentrabajo === undefined){
        return;
      }

      ids = ids + ',' + element.idordentrabajo;

    });




    this.ref = this.dialogService.open(ModalAsignarTipoOperacionComponent, {
      header: 'Asignar Tipo de Operación',
      width: '50%',
      contentStyle: {'height': '350px', overflow: 'auto'},
      baseZIndex: 10000,
      data : {ids }
  });

    this.ref.onClose.subscribe((product: any) => {

      this.reloadDetalles();
      return ;
    });

  }
  ver(despacho){

    this.despacho = despacho;

    this.ordenService.GetAllOrdersCargasTemporal(despacho.data.idcarga).subscribe(resp=>  {

      this.ordenes11 = resp;

      if(resp.length === 0)
      {
        this.carga11detalle = '';
        return ;
      }

      this.carga11detalle = resp![0].numcarga!;

      
    });


  }

}

