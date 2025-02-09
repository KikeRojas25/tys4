import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { RippleModule } from 'primeng/ripple'; 
import { MessageService, SelectItem } from 'primeng/api';
import {  User } from '../../trafico/trafico.types';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { PlanningService } from '../planning.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { PanelModule } from 'primeng/panel';
import { VerDetalleOrdenxDepartamentoModalComponent } from './ordendetallexdepartamento';
import { TraficoService } from '../../trafico/trafico.service';
import { OrdenTransporte } from '../../recepcion/ordentransporte/ordentransporte.types';

@Component({
  selector: 'app-pordepartamento',
  templateUrl: './pordepartamento.component.html',
  styleUrls: ['./pordepartamento.component.css'],
  standalone: true,
  imports: [ 
    FormsModule,
    CommonModule,
    TableModule,
    DropdownModule,
    ButtonModule,
    OverlayPanelModule,
    RippleModule,
    MatIcon,
    PanelModule
  ],
  providers: [
    DialogService,
    MessageService
  ]
})
export class PordepartamentoComponent implements OnInit {
  clientes: SelectItem[] = [];
  destinatarios: SelectItem[] = [];
  ubigeo: SelectItem[] = [];
  estados: SelectItem[] = [];
  tipotransporte: SelectItem[] = [];

  ordenes: OrdenTransporte[] = [];
  ordenes2: OrdenTransporte[] = [];

  selectedDepartaments: OrdenTransporte[] = [];


  loading: any;
  model: any = {};
  ProveedorLoaded = false;
  UbigeoLoaded = false;
  cols: any[];
  es: any;
  frozenCols: any[];
  user: User ;
  ref: DynamicDialogRef;
  dateInicio: Date = new Date(Date.now()) ;
  dateFin: Date = new Date(Date.now()) ;
  imageToShow: any;
  estaciones: SelectItem[] = [];

  statuses: SelectItem[];
  clonedOrders: { [s: string]: OrdenTransporte; } = {};

  cantidadTotal : number = 0;
  pesoTotal : number = 0;
  otsTotal:number = 0;
  bultosTotal: number = 0;
  subtotalTotal : number = 0;

  estacionhabilitada: boolean = false
  lat = -12.0608335;
  lng = -76.9347693 ;

  lat2 = -16.3988900;
  lng2 = -71.5350000 ;


  zoom = 6;

  constructor(private planningService: PlanningService,
              public dialogService: DialogService,
              private router: Router,
              public messageService: MessageService,
              private traficoService: TraficoService,
              ) { }

  ngOnInit() {

    this.user = JSON.parse(localStorage.getItem('user'));


    this.model.idusuario = this.user.usr_int_id;


    this.dateInicio.setDate((new Date()).getDate() - 1);
    this.dateFin.setDate((new Date()).getDate() );
    this.model.numcp = '';
    this.model.docreferencia = '';
    this.model.grr = '';




    this.statuses = [
                     {label: 'Seleccionar', value: '0'},
                     {label: 'Ausente', value: 'Ausente'},
                     {label: 'Falta referencias', value: 'Falta referencias'},
                     {label: 'Faltan datos en la dirección', value: 'Faltan datos en la dirección'},
                     {label: 'No hay acceso a la zona', value: 'No hay acceso a la zona'},
                     {label: 'No lo conocen', value: 'No lo conocen'},
                     {label: 'No visitado', value: 'No visitado'},
                     {label: 'Se mudó', value: 'Se mudó'},
                     {label: 'Se negó a recibir', value: 'Se negó a recibir'},
                    ]

    this.cols =
    [
       {header: 'ACC', field: 'numcp'  ,  width: '60px' },
        {header: 'ZONA', field: 'zona'  ,  width: '120px' },
        {header: 'DEPARTAMENTO', field: 'departamento'  ,  width: '120px' },
        {header: 'OTS', field: 'cantidad' , width: '60px'  },
        {header: 'BULTOS', field: 'bulto'  , width: '60px'   },
        {header: 'PESO', field: 'peso'  ,  width: '60px'  },
        {header: 'VOLUMEN', field: 'volumen'  ,  width: '60px'  },
        {header: 'SUBTOTAL', field: 'subtotal'  ,  width: '60px'  }

    ];




  this.planningService.GetAllEstaciones().subscribe(resp => {
    resp.forEach(element => {
      this.estaciones.push({ value: element.idEstacion ,  label : element.estacionOrigen});
    });
  }, (error) => {

  }, () => {
    this.model.idestacionorigen =  this.user.idestacionorigen;

  

    console.log('entre', this.model);

    if( this.model.idestacionorigen === null) {
      return;
    }
    else {
      this.estacionhabilitada = true;
    }

    
    this.reload();

  });



  }
  verdetalles(id) {


    //  this.model.iddepartamento =id;
    //  let iddepartamento =  this.model.iddepartamento ;
    //  let idestacionorigen =  this.model.idestacionorigen ;



    //  const ref = this.dialogService.open(VerDetalleOrdenxDepartamentoModalComponent, {
    //   header: 'Programar Arribos',
    //   width: '50%',
    //   height: '550px',
    //   contentStyle: {'height': '350px', overflow: 'auto',  },
    //   data : { iddepartamento,  idestacionorigen}
    // });
    // ref.onClose.subscribe(() => {


    //   this.loading = false;


    // });


  }
  verguias(id) {

  }
  planificar () {

      let ids  = '';

      this.selectedDepartaments.forEach(element => {
        ids = ids + ',' + element.iddepartamento;

      });

      this.router.navigate(['/planning/generarrutas', ids]);

  }
  verDetalle(rowData) {

    this.model.iddepartamento =rowData.iddepartamento;
    let iddepartamento =  this.model.iddepartamento ;
    let idestacionorigen =  this.model.idestacionorigen ;

    const ref = this.dialogService.open(VerDetalleOrdenxDepartamentoModalComponent, {
     header: 'Detalle por departamento',
     width: '50%',
     contentStyle: { overflow: 'auto',  },
     data : { iddepartamento,  idestacionorigen}
   });
   ref.onClose.subscribe(() => {




   });
   }

  reload() {
    

   


      this.planningService.GetAllOrdersGroupDepartament(this.model).subscribe(list =>  {
        this.loading = false;
        this.ordenes =  list;
        this.ordenes2 = list;


            this.ordenes2.forEach(obj => {

               this.otsTotal =  this.otsTotal + obj.cantidad;
               this.bultosTotal =  this.bultosTotal + obj.bulto;
               this.pesoTotal =  this.pesoTotal + obj.peso;
               this.subtotalTotal = this.subtotalTotal + obj.subtotal;

            });

      });
  }







}

