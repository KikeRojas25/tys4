import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TraficoService } from '../trafico.service';
import { TabViewModule } from 'primeng/tabview';
import { Manifiesto, OrdenTransporte, User } from '../trafico.types';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CambiarEstadoModalComponent } from '../vistamanifiestos/modalcambiarestado';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { EntregarOtModalComponent } from './modalentregarOT';

@Component({
  selector: 'app-vistarepartidor',
  templateUrl: './vistarepartidor.component.html',
  styleUrls: ['./vistarepartidor.component.css'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatIcon,
    RouterModule,
    TabViewModule,
    TableModule,
    ButtonModule,
    DialogModule,
    ToastModule
  ],
  providers: [
    DialogService ,
    MessageService 
  ]
})
export class VistarepartidorComponent implements OnInit {
  modalDetalleManifiesto = false;
  repartidor: any = {};
  id: any;
  cols3: any[];
  cols4: any[];
  despachos: Manifiesto[] = [];
  user: User ;
  model: any = {};
  despachos1: any[] = [];
  ordenes: any[] = [];
  cols2: any[];

  ref: DynamicDialogRef;

  ordenes2: OrdenTransporte[] = [];
  ordenes3: OrdenTransporte[] = [];
  ordenes4: OrdenTransporte[] = [];

  selectedManifiesto: any = {};
  selectedManifiestoRecojo: any = {};
  SelectedOrdenTransporte?: OrdenTransporte | undefined;

  constructor( private traficoService: TraficoService,
    private activatedRoute: ActivatedRoute,
    public dialogService: DialogService,
  ) { }

  ngOnInit() {
    
//  this.cols2 = [
//     { field: 'numcp', header: 'N° OT',  width: '20px'},

//     {header: 'BULTOS', field: 'bulto'  , width: '60px'   },
//     {header: 'FECHA', field: 'fecharegistro'  , width: '60px'   },
//     {header: 'PESO', field: 'peso'  ,  width: '30px'  },
//     {header: 'DESTINO', field: 'destino'  ,  width: '30px'  },
//     {header: 'CLIENTE', field: 'razonsocial'  ,  width: '100px'  },
//     {header: 'TIPO OP', field: 'tipooperacion'  ,  width: '100px'  },
//     {header: 'ACCIONES', field: 'acciones'  ,  width: '30px'  },
//   ];

  this.cols2 = [
    { field: 'numcp', header: 'N° OT',  width: '40px'},
    {header: 'FECHA RECOJO', field: 'fecharegistro'  , width: '60px'   },
    {header: 'CLIENTE', field: 'razonsocial'  ,  width: '100px'  },
    {header: 'DESTINATARIO', field: 'destinatario'  , width: '60px'   },


    {header: 'F. ENTREGA REPARTIDOR', field: 'fecha_estado_actual'  ,  width: '90px'  },
    {header: 'F. ENTREGA COMPROMETIDA', field: 'fechaentrega'  , width: '90px'   },
    {header: 'Dif. Fechas', field: 'diferencia_fechas'  ,  width: '20px'  },

    {header: 'BULTOS', field: 'bulto'  , width: '30px'   },
    {header: 'PESO', field: 'peso'  ,  width: '30px'  },
    {header: 'ESTADO', field: 'destino'  ,  width: '30px'  },

  ];


 this.cols3 = [

  { field: 'numhojaruta', header: 'HR',  width: '120px'},
  { field: 'nummanifiesto', header: 'Manifiesto',  width: '120px'},
  {header: 'Destino', field: 'provincia'  , width: '200px'   },
  {header: 'Agencia', field: 'agencia'  ,  width: '70px'  },
  {header: 'Remitente', field: 'agenremi'  ,  width: '70px'  },
  {header: 'Consignado', field: 'agendesti'  ,  width: '70px'  },
  {header: 'Fecha Despacho', field: 'fecha_estado_actual'  ,  width: '70px'  },
  {header: 'Clave', field: 'diferencia_fechas'  ,  width: '120px'  },
  {header: 'Remito', field: 'peso'  ,  width: '30px'  },
  {header: 'Costo', field: 'peso'  ,  width: '30px'  },
  {header: 'Acciones', field: 'acciones'  ,  width: '30px'  }

];

this.cols4 = [

  { field: 'numhojaruta', header: 'HR',  width: '120px'},
  { field: 'nummanifiesto', header: 'Manifiesto',  width: '120px'},
  {header: 'Destino', field: 'provincia'  , width: '200px'   },
  {header: 'Placa', field: 'agencia'  ,  width: '70px'  },
  {header: 'Proveedor', field: 'agenremi'  ,  width: '70px'  },
  {header: 'Chofer', field: 'agendesti'  ,  width: '70px'  },
  {header: 'Fecha Despacho', field: 'fecha_estado_actual'  ,  width: '70px'  },
  {header: 'Acciones', field: 'acciones'  ,  width: '30px'  }

];



    this.id  = this.activatedRoute.snapshot.params['id'];


    this.user = JSON.parse(localStorage.getItem('user'));
    this.model.idusuariocreacion = this.user.usr_int_id;

    this.reloadDetalles();

  

  }
  reloadDetalles() {





    

    this.traficoService.getAllManifiestosForProvider(this.id, 11).subscribe(x=> {
      
  
      this.despachos1 = x; 

    });

    this.traficoService.getAllManifiestosForProviderRecojo (this.id).subscribe(list => {

      this.despachos = list;

      console.log('despachos', this.despachos);


    });

    this.traficoService.getAllOrdersxRepartidor(this.id, 13).subscribe(x => {
      this.ordenes2 = x;
      console.log('en reparto:', this.ordenes2);

    });


    this.traficoService.getAllOrdersxRepartidor(this.id, 34).subscribe(x => {
      this.ordenes3 = x;
      console.log(this.ordenes2);

    });


    this.traficoService.getAllOrdersxRepartidor(this.id, 35).subscribe(x => {
      this.ordenes4 = x;
      console.log(this.ordenes2);

    });



    this.traficoService.getProveedor(this.id).subscribe( resp => {
      console.log(resp);

      this.repartidor.nombre = resp.razonSocial;
      this.repartidor.direccion = resp.direccion;
      this.repartidor.telefono = resp.telefono;
      this.repartidor.ruc = resp.ruc;
      this.repartidor.provincia = resp.distrito;



    });




  }

  verEventos(id) {

    this.traficoService.ListarOrdenesTransporte(id).subscribe(x=> {
  
      console.log(x);
      this.ordenes = x;
  
    });
  
  this.modalDetalleManifiesto = true;
  
  }

  cambiarEstadoRecojo(){


    console.log(this.selectedManifiestoRecojo);


    let ids  = ',' + this.selectedManifiestoRecojo.idmanifiesto  ;
    if(this.selectedManifiestoRecojo  === undefined )
      {
       
        return ;
      }


    this.ref = this.dialogService.open(CambiarEstadoModalComponent, {
      header: 'Asignar Estado',
      width: '50%',
      contentStyle: {overflow: 'auto'},
      baseZIndex: 10000,
      data : {ids  }
  });

    this.ref.onClose.subscribe((product: any) => {

      this.reloadDetalles();
      return ;
    });

  }




  cambiarEstado(){


    console.log(this.selectedManifiesto);


    let ids  = ',' + this.selectedManifiesto.idmanifiesto  ;
    if(this.selectedManifiesto  === undefined )
      {
       
        return ;
      }


    this.ref = this.dialogService.open(CambiarEstadoModalComponent, {
      header: 'Asignar Estado',
      width: '50%',
      contentStyle: {overflow: 'auto'},
      baseZIndex: 10000,
      data : {ids  }
  });

    this.ref.onClose.subscribe((product: any) => {

      this.reloadDetalles();
      return ;
    });

  }


  
modalEntregarOT() {

  const idorden = this.SelectedOrdenTransporte.idordentrabajo;
  
  
  const ref = this.dialogService.open(EntregarOtModalComponent, {
    header: 'Confirmar entrega',
    width: '50%',
    height: '550px',
    contentStyle: {'height': '550px', overflow: 'auto',  },
    data : { idorden }
  });
  ref.onClose.subscribe(() => {
  
    this.reloadDetalles();
  
  
  });
  
  
  
  
  }
  
  

}