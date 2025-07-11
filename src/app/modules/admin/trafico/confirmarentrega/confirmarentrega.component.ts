import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SelectItem, MenuItem, ConfirmationService, MessageService } from 'primeng/api';
import { DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { OrdenTransporteService } from '../../recepcion/ordentransporte/ordentransporte.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { TableModule } from 'primeng/table';
import { TimelineModule } from 'primeng/timeline';
import { ToastModule } from 'primeng/toast';
import { InputMaskModule } from 'primeng/inputmask';
import moment from 'moment';
import { UploadModalComponent } from '../../recepcion/ordentransporte/seguimientoot/modal.upload';
import { FileModalComponent } from '../../recepcion/ordentransporte/seguimientoot/modalfiles';
import { OrdenTransporte } from '../../recepcion/ordentransporte/ordentransporte.types';
import { User } from '../trafico.types';

@Component({
  selector: 'app-confirmarentrega',
  templateUrl: './confirmarentrega.component.html',
  styleUrls: ['./confirmarentrega.component.css'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    CheckboxModule,
    MatIcon,
    OverlayPanelModule ,
    DropdownModule,
    CalendarModule,
    DialogModule ,
    TimelineModule,
    ToastModule,
    ConfirmDialogModule,
    InputMaskModule
  ],
  providers: [
    ConfirmationService,
    DialogService,
    MessageService
  ]
})
export class ConfirmarentregaComponent implements OnInit {
  clientes: SelectItem[] = [];
  ubigeo: SelectItem[] = [];
  estados: SelectItem[] = [];

  clonedOrders: { [s: string]: OrdenTransporte; } = {};

  dialoglifecycle = false;


  subestadosPorTipo: { [key: string]: any[] } = {}

  

  estadosMap = {
    0: [0],
    1: [6], // "Por despachar" se mapea a "Pend. Programacion"
    2: [11, 13], // "Por entregar" se mapea a "En Ruta", "En Reparto" y "Entregado"
    3: [34,35], // "TODOS LOS ESTADOS" incluye todos
};



  ordenes: OrdenTransporte[] = [];
  selected: OrdenTransporte[];
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
  items: MenuItem[];

  statuses: SelectItem[];
  

  


  constructor(private ordenTransporteService: OrdenTransporteService,
              public dialogService: DialogService,
              private router: Router,
              private confirmationService: ConfirmationService,
              public messageService: MessageService
              ) { }

  ngOnInit() {

    this.statuses = [
      {label: 'Ninguna', value: ''},
      {label: 'Entrega Perfecta', value: 'Entrega Perfecta'},
      {label: 'Entrega Sin Cargo', value: 'Entrega Sin Cargo'},
      {label: 'Rechazo Parcial', value: 'Rechazo Parcial'},
      {label: 'No Entrega', value: 'No Entrega'},
     ]
    this.user = JSON.parse(localStorage.getItem('user'));

        this.items = [
          {label: 'Update', icon: 'pi pi-refresh', command: () => {
            // this.update();
          }},
          {label: 'Delete', icon: 'pi pi-times', command: () => {
              // this.delete();
          }},
          {label: 'Angular.io', icon: 'pi pi-info', url: 'http://angular.io'},
          {separator: true},
          {label: 'Setup', icon: 'pi pi-cog', routerLink: ['/setup']}
      ];

    this.model.idusuario = this.user.usr_int_id;
    this.dateInicio.setDate((new Date()).getDate() - 1);
    this.dateFin.setDate((new Date()).getDate() );
    this.model.numcp = '';
    this.model.docreferencia = '';
    this.model.grr = '';
    this.model.nummanifiesto = '';
    this.model.numhojaruta = '';
    this.model.referencia = '';


    this.cols =
    [ {header: 'ACC', field: 'idordentrabajo'  ,  width: '260px' },
      {header: 'OT', field: 'numcp'  ,  width: '120px' },
      {header: 'F. DESPACHO', field: 'fechadespacho' , width: '100px'  },
      {header: 'DÍAS', field: 'diasDesdeDespacho' , width: '50px'  },
      {header: 'REF', field: 'docgeneral' , width: '90px'  },
      {header: 'TIPO ENTREGA' , field: 'tipoentrega'  , width: '210px'   },
      {header: 'SUB ESTADO' , field: 'tipoentrega'  , width: '210px'   },
      {header: 'F. ENTREGA', field: 'fechaentrega' , width: '200px'  },
      {header: 'HR ENTREGA' , field: 'horaentrega'  , width: '260px'   },
      {header: 'DIR DEST' , field: 'direccion'  , width: '280px'   },
      {header: 'DESTINO', field: 'destino'  ,  width: '90px'  },
      {header: 'DESTINATARIO', field: 'destinatario' , width: '180px'  },
      {header: 'REPARTIDOR ', field: 'destinatario' , width: '180px'  },

     ];



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


    this.ordenTransporteService.getClientes(this.user.idscliente).subscribe(resp => {
        this.clientes.push({ value: 0,  label : 'TODOS LOS CLIENTES'});
        resp.forEach(element => {
            this.clientes.push({ value: element.idCliente ,  label : element.razonSocial});
          });

        this.ProveedorLoaded = true;
        this.model.idcliente = 0;
      });


    this.ordenTransporteService.getUbigeo('').subscribe(resp => {
        this.ubigeo.push({ value: 0,  label : 'TODOS LOS DESTINOS'});
        resp.forEach(element => {
            this.ubigeo.push({ value: element.idDistrito ,  label : element.ubigeo});
          });
        this.UbigeoLoaded = true;
        this.model.iddistrito = 0;
      }, error => {
      }, () => {
        this.buscar();
      });

      this.estados.push({ value: 0,  label : 'TODOS LOS ESTADOS'});
      this.estados.push({ value: 1, label: 'Por despachar' });
      this.estados.push({ value: 2, label: 'Por entregar' });
      this.estados.push({ value: 3, label: 'Entregado' });
  
    this.model.idestado = 0;

    
this.subestadosPorTipo = {
  'Entrega Perfecta': [{ label: 'Entrega Perfecta', value: 'Entrega Perfecta' }],
  'Entrega Sin Cargo': [{ label: 'Entrega Perfecta', value: 'Entrega Perfecta' }],
  'Rechazo Parcial': [
    { label: 'Mercadería parcial faltante', value: 'Parcial_Faltante' },
    { label: 'Mercadería parcial dañada', value: 'Parcial_Danada' },
    { label: 'Cliente no quiere recibir total pedido', value: 'Cliente_No_Recibe_Total' }
  ],
  'No Entrega': [
    { label: 'Dirección no existente', value: 'Direccion_No_Existe' },
    { label: 'Local cerrado', value: 'Local_Cerrado' },
    { label: 'Cliente rechazó total del pedido', value: 'Cliente_Rechazo_Total' }
  ]
};



  }

  editar(id) {
    this.router.navigate(['/trafico/editarotr', id]);
  }

  verguias(id) {
    this.router.navigate(['/seguimiento/verorden', id]);
  }

  save(info: string) {
    let resumen = '';
    this.selected.forEach(res => {
      resumen = resumen + ',' + res.idordentrabajo.toString();
     });
    this.router.navigate(['/seguimiento/asignarequipotransporte', resumen]);
  }
  getEstadosParaBusqueda(valueSeleccionado: number): string {
    const estadosArray = this.estadosMap[valueSeleccionado] || [valueSeleccionado];
    return estadosArray.join(","); // Convierte el array a una cadena separada por comas
  }
  
  


  buscar() {

      this.model.fecinicio = this.dateInicio;
      this.model.fecfin = this.dateFin;
      this.model.idusuario = this.user.id;
      this.model.tipoorden = '';

      
      this.model.idestado = this.getEstadosParaBusqueda(this.model.idestado);
      
      this.ordenTransporteService.getAllOrder(this.model).subscribe(list => {

        this.ordenes =  list;

        console.log('ordenes:' , this.ordenes);


      });
  }


   createImageFromBlob(image: Blob) {

    const reader = new FileReader();
    reader.addEventListener('load', () => {
       this.imageToShow = reader.result;
       console.log(reader.result);

    }, false);

    if(image) {
       reader.readAsDataURL(image);
    }
 }


eliminar(id) {

  this.confirmationService.confirm({
    message: '¿Esta seguro que desea elminar esta OTR?',
    accept: () => {
      
      this.model.idusuarioregistro = this.user.id;
      this.model.idordentrabajo = id;

      this.ordenTransporteService.eliminar(this.model).subscribe(resp => {

        this.messageService.add({severity: 'success', summary: 'Orden Transporte ', detail: 'Se ha eliminado con éxito.'});

        this.buscar();

      });
    }
});

}
verot(idOrdenTrabajo) {

    const url = `http://104.36.166.65/webreports/ot.aspx?idorden=${idOrdenTrabajo}`;
    window.open(url, '_blank');
}
vermanifiesto(idmanifiesto) {
  var url = "http://104.36.166.65/webreports/manifiesto.aspx?idmanifiesto=" + String(idmanifiesto);
  window.open(url);
}

getColor(status: string): string {
  switch (status) {
      case 'Pendiente':
          return 'orange'; // Color para eventos pendientes
      case 'Completado':
          return 'green'; // Color para eventos completados
      case 'Cancelado':
          return 'red'; // Color para eventos cancelados
      default:
          return 'gray'; // Color por defecto
  }
}

onRowEditInit(order: OrdenTransporte) {
  this.clonedOrders[order.idordentrabajo] = {...order};
}
onRowEditSave(order: OrdenTransporte) {

  const tiposQueRequierenSubestado = ['Rechazo Parcial', 'No Entrega'];

  if (tiposQueRequierenSubestado.includes(order.tipoentrega) && !order.subestado) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Validación',
      detail: `Debe seleccionar un subestado para "${order.tipoentrega}".`
    });
    return;
  }




  order.idtipoentrega = this.getIdTipoEntrega(order.tipoentrega);
  order.IncidenciaEntregaId = this.getIdSubestado(order.subestado);


  order.idusuarioentrega =  this.user.id;


  if (order.idordentrabajo > 0) {

      delete this.clonedOrders[order.idordentrabajo];

      this.ordenTransporteService.confirmar_entrega(order).subscribe( resp => {


        if (tiposQueRequierenSubestado.includes(order.tipoentrega)) {

          this.ordenTransporteService.agregarVisitaDespacho(order).subscribe(resp => {
         
          });
        }

        this.messageService.add({
                severity: 'success',
                summary: 'Orden actualizada',
                detail: `OT ${order.numcp} confirmada correctamente`
              });


      }, (error)=> {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error?.error || 'No se pudo confirmar la entrega.'
        });
      }, ()=> {

      });




  }
  else {
    this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail:  'No se pudo confirmar la entrega.'
        });
  }
}

onRowEditCancel(order: OrdenTransporte, index: number) {
  this.ordenes[index] = this.clonedOrders[order.idordentrabajo];
  delete this.ordenes[order.idordentrabajo];
}
exportExcel() {


  this.model.fec_ini =  moment(this.dateInicio).format('DD/MM/YYYY');
  this.model.fec_fin = moment(this.dateFin).format('DD/MM/YYYY');
  let iddestino = '';
  if (this.model.iddestino === undefined){
    iddestino = '';
  }
  else {
    iddestino = String(this.model.iddestino);
  }

  const url = 'http://104.36.166.65/webreports/consultaots.aspx?idcliente=' + String(this.model.idcliente) +
  '&fecinicio=' + this.model.fec_ini +  '&fecfin=' + this.model.fec_fin +   '&numcp=' + this.model.numcp +
  '&docreferencia=' + this.model.docreferencia +  '&grr=' + this.model.grr +   '&iddestino=' + iddestino +
  '&idestado=' + String(this.model.idestado)  + '&idusuario=' + this.model.idusuario;

  window.open(url);
}
// verarchivos(id) {

//   const ref = this.dialogService.open(FileModalComponent, {
//     header: 'Visor Fotos',
//     width: '30%',
//     data : {id }
// });
// }
cargarfiles(id) {

     const ref = this.dialogService.open(UploadModalComponent, {
    header: 'Cargar Fotos',
    width: '70%',
    data : {id }
   });
    ref.onClose.subscribe(() => {



});

}
verarchivos(id) {

  const ref = this.dialogService.open(FileModalComponent, {
    header: 'Visor Fotos',
    width: '30%',
    data : {id }
});
}
verdetalles(id) {
   this.router.navigate(['/seguimiento/verorden', id]);
}

// Método para obtener subestados según el tipo de entrega seleccionado
getSubestados(tipoEntrega: string): any[] {
  return this.subestadosPorTipo[tipoEntrega] || [];
}



getIdSubestado(subestado: string): number {
  switch (subestado) {
    case 'Parcial_Faltante':
      return 1;
    case 'Parcial_Danada':
      return 2;
    case 'Cliente_No_Recibe_Total':
      return 3;
    case 'Direccion_No_Existe':
      return 1;
    case 'Local_Cerrado':
      return 2;
    case 'Cliente_Rechazo_Total':
      return 3;
    default:
      return 0; // o null si prefieres manejarlo así
  }
}


getIdTipoEntrega(tipoentrega: string) : number {

  console.log(tipoentrega);

  if("Entrega Perfecta" == tipoentrega)
  {
        return 5;
  }
  else if("No Entrega" == tipoentrega)
  {
     return 10;
  }
  else if("Entrega Sin Cargo" == tipoentrega)
  {
     return 5;
  }
  else if("No Entrega" == tipoentrega)
  {
     return 10;
  }
  else if("Rechazo Parcial" == tipoentrega)
  {
    return 11;
  }

}

}

