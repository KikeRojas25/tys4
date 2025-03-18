import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';

import { ActivatedRoute, Router } from '@angular/router';
import { OrdenTransporteService } from '../../recepcion/ordentransporte/ordentransporte.service';
import { OrdenTransporte } from '../../recepcion/ordentransporte/ordentransporte.types';
import { User } from '../../trafico/trafico.types';
import { AsignarPlacalocalComponent } from '../planninglocal/modal.asignarplacalocal';
import { AsignarTipooperacionLocalComponent } from './asignar-tipooperacion-local/asignar-tipooperacion-local.component';
import { InputTextModule } from 'primeng/inputtext';
import { PlanningService } from '../planning.service';

@Component({
  selector: 'app-planning-local-detalle',
  templateUrl: './planning-local-detalle.component.html',
  styleUrls: ['./planning-local-detalle.component.css'],
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
    InputTextModule,
    MatIcon
  ],
  providers: [
    ConfirmationService,
    DialogService,
    MessageService
  ]
})
export class PlanningLocalDetalleComponent implements OnInit {

  id: any;
  cols2: any[];
  ordenes11: OrdenTransporte[] = [];
  selectedOTs: OrdenTransporte[]= [];
  cantidadTotal : number = 0;
  pesoTotal : number = 0;
  otsTotal:number = 0;
  bultosTotal: number = 0;
  subtotalTotal: number = 0;
  ref: DynamicDialogRef;
  cantidadTotal1 : number = 0;
  pesoTotal1 : number = 0;
  otsTotal1:number = 0;
  bultosTotal1: number = 0;
  subtotalTotal1: number = 0;
  clonedOrders: { [s: string]: OrdenTransporte; } = {};
  user: User ;

  constructor(private activatedRoute: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService ,
    public dialogService: DialogService,
    private planningService: PlanningService,
    private ordenService: OrdenTransporteService) { }

  ngOnInit(): void {

    this.id  = this.activatedRoute.snapshot.params.uid;
    this.cols2 = [
      {header: 'ACCIONES', field: 'acciones'  ,  width: '40px'  },
      {header: 'H. INICIO', field: 'horacita'  , width: '60px'   },
      {header: 'H. FIN', field: 'horacita'  , width: '60px'   },

      {header: 'CLIENTE', field: 'razonsocial'  ,  width: '80px'  },
      {header: 'SEDE CITA', field: 'razonsocial'  ,  width: '80px'  },
      {header: 'TIPO OP.', field: 'zona'  , width: '60px'   },
      {header: 'DISTRITO', field: 'distrito'  , width: '60px'   },
      {field: 'numcp', header: 'N° OT',  width: '60px'},
      {field: 'tipo', header: 'R/E',  width: '60px'},
      {header: 'BULTOS', field: 'bultos'  ,  width: '30px'  },
      {header: 'PESO', field: 'peso'  ,  width: '30px'  },
      {header: 'SECUENCIA', field: 'secuencia'  ,  width: '30px'  },
    ];



    this.ordenService.GetAllOrdersCargasTemporal(this.id).subscribe(resp=>  {
      this.ordenes11 = resp;

        this.ordenes11.forEach(x=> {
          this.bultosTotal = this.bultosTotal + x.bulto;
          this.pesoTotal = this.pesoTotal + x.peso;
          this.subtotalTotal = this.subtotalTotal + x.subtotal;
        });


        console.log( 'ordenes', this.ordenes11);


    });

  }
  desasignarOT(idordentrabajo: number) {




    this.confirmationService.confirm({
      message: '¿Está seguro que desea devincular esta Orden?. Se enviará a un reporte de falso flete.',
      accept: () => {

        this.planningService.DesAsignarProvinciaCarga(idordentrabajo).subscribe(resp=>  {

          this.reloadDetalles();
        //  this.toastr.success( "Se ha eliminado la Orden con éxito." , 'Almacén', { closeButton: true });

          this.ref.close();

          });

        }

      });




  }

  reloadDetalles() {

    this.selectedOTs = [];


    this.ordenService.GetAllOrdersCargasTemporal(this.id).subscribe(resp=>  {
      this.ordenes11 = resp;


      
      this.ordenes11.forEach(x=> {
        this.bultosTotal = this.bultosTotal + x.bulto;
        this.pesoTotal = this.pesoTotal + x.peso;
        this.subtotalTotal = this.subtotalTotal + x.subtotal;
      })
    });

   }
 volver() {
  this.router.navigate(['planning/generarrutaslocal']);
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


onRowEditInit(order: OrdenTransporte) {
  this.clonedOrders[order.idordentrabajo] = {...order};
}
onRowEditSave(order: OrdenTransporte) {



   order.fechacita = this.ordenes11[0].fechacita;


  this.ordenService.actualizarOrden(order).subscribe (resp => {
    // this.toastr.success('Se actualizó correctamente'
    // , 'Orden de Transporte', {
    //   closeButton: true
    // });

    this.reloadDetalles();


  });


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
  this.ordenes11[index] = this.clonedOrders[order.idordentrabajo];
  delete this.ordenes11[order.idordentrabajo];
}


vinculartipooperacion() {

  console.log('ots',this.selectedOTs);

  let ids = this.selectedOTs;

    const ref = this.dialogService.open(AsignarTipooperacionLocalComponent, {
    header: 'Confirmar Despacho',
    width: '40%',
    height: '450px',
    contentStyle: {'height': '450px', overflow: 'auto',  },
    data : { ids }
  });
  ref.onClose.subscribe(() => {
  
    this.reloadDetalles();
  
  
  });
  

}





}
function cloneDeep(ordenes11: OrdenTransporte[]) {
  throw new Error('Function not implemented.');
}
