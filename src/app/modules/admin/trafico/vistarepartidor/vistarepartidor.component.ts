import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TraficoService } from '../trafico.service';
import { TabViewModule } from 'primeng/tabview';
import { Manifiesto, User } from '../trafico.types';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CambiarEstadoModalComponent } from '../vistamanifiestos/modalcambiarestado';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { EntregarOtModalComponent } from './modalentregarOT';
import { OrdenTransporte } from '../../recepcion/ordentransporte/ordentransporte.types';
import { BadgeModule } from 'primeng/badge';
import { AsignartipooperacionComponent } from '../../planning/porprovincia/asignartipooperacion/asignartipooperacion.component';
import { AsignartipooperacionRutaComponent } from './asignartipooperacion/asignartipooperacionruta.component';

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
    ToastModule,
    BadgeModule
    
  ],
  providers: [
    DialogService ,
    MessageService 
  ]
})
export class VistarepartidorComponent implements OnInit {
  modalDetalleManifiesto = false;
  repartidor: any = {};
  idproveedor: any;
  iddepartamento: any;
  cols1: any[];
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
  ordenes5: OrdenTransporte[] = [];

  selectedOrdenes: OrdenTransporte[] = [];


  totalRecojo: number = 0;
  totalRecepcion: number = 0;
  totalReparto: number = 0;
  totalRecabarCargo: number = 0;
  totalEnviarCargo: number = 0;
  totalObservadas: number = 0;

  selectedManifiesto: any = {};
  selectedManifiestoRecojo: any = {};
  SelectedOrdenTransporte?: OrdenTransporte | undefined;

  constructor( private traficoService: TraficoService,
    private activatedRoute: ActivatedRoute,
    public dialogService: DialogService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    
 this.cols1 = [
    { field: 'numcp', header: 'N° OT',  width: '20px'},
    {header: 'FECHA', field: 'fecharegistro'  , width: '60px'   },    
    {header: 'DESTINO', field: 'destino'  ,  width: '30px'  },
    {header: 'CLIENTE', field: 'razonsocial'  ,  width: '100px'  },
    {header: 'ESTADO', field: 'estado'  ,  width: '100px'  },
    {header: 'TIPO OP', field: 'tipooperacion'  ,  width: '100px'  },
    {header: 'BULTOS', field: 'bulto'  , width: '60px'   },
    {header: 'PESO', field: 'peso'  ,  width: '30px'  },
    {header: 'ACCIONES', field: 'acciones'  ,  width: '30px'  },
  
  ];

  this.cols2 = [
    { field: 'numcp', header: 'N° OT',  width: '40px'},
    {header: 'FECHA RECOJO', field: 'fecharegistro'  , width: '60px'   },
    {header: 'CLIENTE', field: 'razonsocial'  ,  width: '180px'  },
    {header: 'DESTINATARIO', field: 'destinatario'  , width: '180px'   },


    {header: 'F. ENTREGA REPARTIDOR', field: 'fecha_estado_actual'  ,  width: '90px'  },
    // {header: 'F. ENTREGA COMPROMETIDA', field: 'fechaentrega'  , width: '90px'   },
    // {header: 'Dif. Fechas', field: 'diferencia_fechas'  ,  width: '20px'  },

    {header: 'BULTOS', field: 'bulto'  , width: '30px'   },
    {header: 'PESO', field: 'peso'  ,  width: '30px'  },
    {header: 'ESTADO', field: 'destino'  ,  width: '30px'  },
    {header: 'ACCIONES', field: 'acciones'  ,  width: '20px'  },

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



    this.idproveedor  = this.activatedRoute.snapshot.params['id'];

    this.iddepartamento  = this.activatedRoute.snapshot.params['uid'];


    this.user = JSON.parse(localStorage.getItem('user'));
    this.model.idusuariocreacion = this.user.usr_int_id;

    this.reloadDetalles();

  

  }
  reloadDetalles() {

    

    this.traficoService.getAllManifiestosForProvider(this.idproveedor, 11,  this.iddepartamento ).subscribe(x=> {
      this.despachos1 = x; 
      this.totalRecepcion = x.length;
    });

    this.traficoService.getAllManifiestosForProviderRecojo (this.idproveedor, this.iddepartamento).subscribe(list => {
      this.despachos = list;
      this.totalRecojo = list.length;
    });

    this.traficoService.getAllOrdersxRepartidor(this.idproveedor, 13).subscribe(x => {
      this.ordenes2 = x; 
      this.totalReparto = x.length;
    });

      this.traficoService.getAllOrdersxRepartidor(this.idproveedor, 34).subscribe(x => {
      
        this.ordenes3 = x;
        this.totalRecabarCargo = x.length;

      const conTipoEntrega = x.filter(o => o.tipoentrega !== null);
      this.ordenes5 = [...(this.ordenes5 || []), ...conTipoEntrega];

       this.totalObservadas = this.ordenes5.length;

    });

    this.traficoService.getAllOrdersxRepartidor(this.idproveedor, 35).subscribe(x => {
      this.ordenes4 = x;
      this.totalEnviarCargo = x.length;
      const conTipoEntrega = x.filter(o => o.tipoentrega !== null);
      this.ordenes5 = [...(this.ordenes5 || []), ...conTipoEntrega];

      this.totalObservadas = this.ordenes5.length;

     
    });


    this.traficoService.getProveedor(this.idproveedor).subscribe( resp => {

      this.repartidor.nombre = resp.razonSocial;
      this.repartidor.direccion = resp.direccion;
      this.repartidor.telefono = resp.telefono;
      this.repartidor.ruc = resp.ruc;
      this.repartidor.provincia = resp.distrito;



    });




  }

  verEventos(id) {

    this.traficoService.ListarOrdenesTransporte(id).subscribe(x=> {
  
      console.log('detalle ots:',x);
      this.ordenes = x;
  
    });
  
  this.modalDetalleManifiesto = true;
  
  }

  cambiarEstadoRecojo(){


    console.log(this.selectedManifiestoRecojo);


    let ids  = ',' + this.selectedManifiestoRecojo.idManifiesto  ;
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

    console.log( 'Manifiesto Seleccionado:',this.selectedManifiesto);
    if (!this.selectedManifiesto || Object.keys(this.selectedManifiesto).length === 0) {
      this.messageService.add({
          severity: 'warn',
          summary: 'Proveedor de reparto',
          detail: 'Debe seleccionar al menos un manifiesto'
      });
      return;
  }
  
  
     

      let ids  = ',' + this.selectedManifiesto.idManifiesto  ;


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
  verOt(idOrdenTrabajo) {

    const url = `http://104.36.166.65/webreports/ot.aspx?idorden=${idOrdenTrabajo}`;
    window.open(url, '_blank');
}
 asignarTipoOperacion() {
  if (!this.selectedManifiesto || !this.selectedManifiesto.idManifiesto) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Proveedor de reparto',
      detail: 'Debe seleccionar al menos un manifiesto'
    });
    return;
  }

  this.traficoService.ListarOrdenesTransporte(this.selectedManifiesto.idManifiesto).subscribe(x => {
    console.log('ordenes:', x);
    this.ordenes = x;

    // Concatenar los idOrdenTrabajo separados por coma
    const ids = this.ordenes.map(m => m.idOrdenTrabajo).join(',');
    console.log('ids', ids);

    this.ref = this.dialogService.open(AsignartipooperacionRutaComponent, {
      header: 'Reasignar Tipo de Operación',
      width: '60%',
      contentStyle: { 'max-height': '450px', overflow: 'auto' },
      baseZIndex: 10000,
      data: { ids }
    });

    this.ref.onClose.subscribe((response: any) => {
      // Si se canceló, no hacer nada
      if (response?.cancelado) {
        return;
      }

      console.log('respuesta', response);
      this.reloadDetalles();

      // Solo mostrar mensaje si hay una respuesta válida (no cancelado)
      if (response && !response.error) {
        this.messageService.add({
          severity: 'success',
          summary: 'Planning',
          detail: 'Se ha asignado el tipo de operación de manera correcta.'
        });
      } else if (response?.error) {
        this.messageService.add({
          severity: 'error',
          summary: 'Planning',
          detail: 'Hubo un error en la asignación de tipo de operación.'
        });
      }
    });
  });
}
asignarTipoOperacionxOt() {
  if (!this.selectedOrdenes || this.selectedOrdenes.length === 0) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Proveedor de reparto',
      detail: 'Debe seleccionar al menos una OT'
    });
    return;
  }
    this.ordenes = this.selectedOrdenes;

    // Concatenar los idOrdenTrabajo separados por coma (para Manifiesto)
    const ids = this.ordenes.map(m => m.idOrdenTrabajo).join(',');
    console.log('ids', ids);

    this.ref = this.dialogService.open(AsignartipooperacionRutaComponent, {
      header: 'Reasignar Tipo de Operación (Manifiesto)',
      width: '60%',
      contentStyle: { 'max-height': '450px', overflow: 'auto' },
      baseZIndex: 10000,
      data: { ids }
    });

    this.ref.onClose.subscribe((response: any) => {
      // Si se canceló, no hacer nada
      if (response?.cancelado) {
        return;
      }

      console.log('respuesta', response);
      this.reloadDetalles();

      // Solo mostrar mensaje si hay una respuesta válida (no cancelado)
      if (response && !response.error) {
        this.messageService.add({
          severity: 'success',
          summary: 'Planning',
          detail: 'Se ha asignado el tipo de operación de manera correcta.'
        });
      } else if (response?.error) {
        this.messageService.add({
          severity: 'error',
          summary: 'Planning',
          detail: 'Hubo un error en la asignación de tipo de operación.'
        });
      }
    });
  
}

asignarTipoOperacionxOtMasivo() {
  if (!this.selectedOrdenes || this.selectedOrdenes.length === 0) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Proveedor de reparto',
      detail: 'Debe seleccionar al menos una OT'
    });
    return;
  }

  // Obtener todos los IDs de las OT seleccionadas
  const idsOrdenTrabajo: number[] = [];
  this.selectedOrdenes.forEach(orden => {
    const idOrdenTrabajo = (orden as any).idOrdenTrabajo || orden.idordentrabajo;
    if (idOrdenTrabajo) {
      idsOrdenTrabajo.push(idOrdenTrabajo);
    }
  });

  if (idsOrdenTrabajo.length === 0) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Proveedor de reparto',
      detail: 'No se encontraron IDs válidos en las OT seleccionadas'
    });
    return;
  }

  // Convertir a string separado por comas para el componente (formato: ,id1,id2,id3)
  const idsString = ',' + idsOrdenTrabajo.join(',');

  // Abrir modal para procesar todas las OT masivamente
  this.ref = this.dialogService.open(AsignartipooperacionRutaComponent, {
    header: `Reasignar Tipo de Operación (${idsOrdenTrabajo.length} OT seleccionada${idsOrdenTrabajo.length > 1 ? 's' : ''})`,
    width: '60%',
    contentStyle: { 'max-height': '450px', overflow: 'auto' },
    baseZIndex: 10000,
    data: { ids: idsString }
  });

  this.ref.onClose.subscribe((response: any) => {
    // Si se canceló, no hacer nada
    if (response?.cancelado) {
      return;
    }

    console.log('Respuesta procesamiento masivo:', response);
    this.reloadDetalles();

    // Solo mostrar mensaje si hay una respuesta válida (no cancelado)
    if (response && !response.error) {
      this.messageService.add({
        severity: 'success',
        summary: 'Planning',
        detail: `Se ha asignado el tipo de operación a ${idsOrdenTrabajo.length} OT(s) correctamente.`
      });
    } else if (response?.error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Planning',
        detail: 'Hubo un error en la asignación de tipo de operación.'
      });
    }
  });
}

asignarTipoOperacionxOtIndividualDesdeFila(orden: any) {
  if (!orden) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Proveedor de reparto',
      detail: 'No se pudo obtener la información de la OT'
    });
    return;
  }

  // El objeto puede tener idOrdenTrabajo (del servicio) o idordentrabajo (de la interfaz)
  const idOrdenTrabajo = (orden as any).idOrdenTrabajo || orden.idordentrabajo;
  if (!idOrdenTrabajo) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Proveedor de reparto',
      detail: 'La OT no tiene un ID válido'
    });
    return;
  }

  this.abrirModalAsignarTipoOperacionOt(idOrdenTrabajo);
}

private abrirModalAsignarTipoOperacionOt(idOrdenTrabajo: number) {
  console.log('idOrdenTrabajo individual', idOrdenTrabajo);

  // Formato requerido: ,id (con coma al inicio)
  const idsString = ',' + idOrdenTrabajo;

  this.ref = this.dialogService.open(AsignartipooperacionRutaComponent, {
    header: 'Reasignar Tipo de Operación (OT Individual)',
    width: '60%',
    contentStyle: { 'max-height': '450px', overflow: 'auto' },
    baseZIndex: 10000,
    data: { ids: idsString }
  });

  this.ref.onClose.subscribe((response: any) => {
    // Si se canceló, no hacer nada
    if (response?.cancelado) {
      return;
    }

    console.log('respuesta', response);
    this.reloadDetalles();

    // Solo mostrar mensaje si hay una respuesta válida (no cancelado)
    if (response && !response.error) {
      this.messageService.add({
        severity: 'success',
        summary: 'Planning',
        detail: 'Se ha asignado el tipo de operación de manera correcta.'
      });
    } else if (response?.error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Planning',
        detail: 'Hubo un error en la asignación de tipo de operación.'
      });
    }
  });
}

}