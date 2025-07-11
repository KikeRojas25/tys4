import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { ConfirmationService, MenuItem, MessageService, SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { OrdenTransporte } from '../ordentransporte.types';
import { User } from 'app/core/user/user.types';
import { OrdenTransporteService } from '../ordentransporte.service';
import { Router } from '@angular/router';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { TimelineModule } from 'primeng/timeline';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputMaskModule } from 'primeng/inputmask';
import { FileModalComponent } from './modalfiles';

interface EventItem {
  status?: string;
  dateRegister?: string;
  dateEvent?: string;
  icon?: string;
  color?: string;
  image?: string;
  user?: string;
}



@Component({
  selector: 'app-seguimientoot',
  templateUrl: './seguimientoot.component.html',
  styleUrls: ['./seguimientoot.component.css'],
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
export class SeguimientootComponent implements OnInit {

  clientes: SelectItem[] = [];
  ubigeo: SelectItem[] = [];
  estados: SelectItem[] = [];
  events: EventItem[];

  dialoglifecycle = false;
  dialogConfirm = false;

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
  estrafico= false;

  ordenTransporte: any = {};
  guias : any[] = [];
  
  estadosMap = {
    0: [0],
    1: [6], // "Por despachar" se mapea a "Pend. Programacion"
    2: [11, 13], // "Por entregar" se mapea a "En Ruta", "En Reparto" y "Entregado"
    3: [34,35], // "TODOS LOS ESTADOS" incluye todos
};


  constructor(private ordenTransporteService: OrdenTransporteService,
              public dialogService: DialogService,
              private router: Router,
              private confirmationService: ConfirmationService,
              public messageService: MessageService
              ) { }

  ngOnInit() {


  
  

    this.user = JSON.parse(localStorage.getItem('user'));

    console.log('xD', this.user);

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
    this.estrafico = this.user.estrafico;

     console.log('user',this.user);


    this.dateInicio.setDate((new Date()).getDate() - 7);
    this.dateFin.setDate((new Date()).getDate() );
    this.model.numcp = '';
    this.model.docreferencia = '';
    this.model.grr = '';
    this.model.nummanifiesto = '';
    this.model.numhojaruta = '';
    this.model.referencia = '';



    this.cols =
    [
        {header: 'ACC', field: 'numcp'  ,  width: '300px' },
        {header: 'OT', field: 'numcp'  ,  width: '100px' },
        {header: 'F. RECOJO', field: 'fecharegistro' , width: '120px'  },
        {header: 'F. DESPACHO', field: 'fecharegistro' , width: '120px'  },
        {header: 'F. ENTREGA', field: 'fecharegistro' , width: '120px'  },
        {header: 'CLIENTE', field: 'razonsocial'  ,  width: '180px'  },
        {header: 'DESTINATARIO', field: 'razonsocial'  ,  width: '180px'  },
        // {header: 'MANIFIESTO TRONCAL', field: 'razonsocial'  ,  width: '280px'  },
        // {header: 'HOJA DE RUTA TRONCAL ', field: 'razonsocial'  ,  width: '280px'  },
        {header: 'ESTACIÓN ACTUAL', field: 'razonsocial'  ,  width: '180px'  },
        {header: 'ESTADO', field: 'estado'  , width: '120px'   },
        {header: 'SUB-ESTADO', field: 'subestado'  , width: '120px'   },
        {header: 'INCIDENCIA ENTREGA', field: 'tipoentrega'  , width: '120px'   },
        {header: 'ORIGEN', field: 'estado'  , width: '120px'   },
        {header: 'DESTINO', field: 'estado'  , width: '120px'   },
        {header: 'SUB TOTAL', field: 'subtotal' , width: '80px'  },
        {header: 'MANIFIESTO', field: 'razonsocial'  ,  width: '120px'  },
        {header: 'HOJA DE RUTA', field: 'razonsocial'  ,  width: '120px'  },
        {header: 'CANT', field: 'cantidad'  ,  width: '80px'  },
        {header: 'PESO', field: 'peso'  ,  width: '80px'  },
        {header: 'VOL', field: 'pesovol'  ,  width: '80px'  }

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



  }

  editar(id) {
    this.router.navigate(['/seguimientoot/editarot', id]);
  }
editarConfirm(id) {
  this.model.idordentrabajo = id;
  this.dialogConfirm = true;
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

  eliminar(id) {

    this.confirmationService.confirm({
      message: '¿Esta seguro que desea elminar esta OT?',
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
  buscar() {

      this.model.fecinicio = this.dateInicio;
      this.model.fecfin = this.dateFin;
      this.model.idusuario =  this.user.id;
      this.model.tipoorden = '';


      this.model.idestado = this.getEstadosParaBusqueda(this.model.idestado);


      this.ordenTransporteService.getAllOrder(this.model).subscribe(list => {

        this.ordenes =  list;

        console.log('ordenes:' , this.ordenes);


      });
  }


   eliminarFotos(id) {
    this.confirmationService.confirm({
      message: '¿Esta seguro que desea elminar las fotos de esta OT?',
      accept: () => {
        
        this.model.idusuarioregistro = this.user.id;
        this.model.idordentrabajo = id;
  
  
          this.messageService.add({severity: 'success', summary: 'Orden Transporte ', detail: 'Se ha eliminado con éxito.'});
  
          this.buscar();
  
       // });
      }
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
 getEstadosParaBusqueda(valueSeleccionado: number): string {
  const estadosArray = this.estadosMap[valueSeleccionado] || [valueSeleccionado];
  return estadosArray.join(","); // Convierte el array a una cadena separada por comas
}


verot(idOrdenTrabajo) {

    const url = `http://104.36.166.65/webreports/ot.aspx?idorden=${idOrdenTrabajo}`;
    window.open(url, '_blank');
}
vermanifiesto(idmanifiesto) {
  var url = "http://104.36.166.65/webreports/manifiesto.aspx?idmanifiesto=" + String(idmanifiesto);
  window.open(url);
}
verhojaruta(iddespacho) {

  var url = "http://104.36.166.65/webreports/hojaruta.aspx?iddespacho=" + String(iddespacho);
  window.open(url);
}
vertracking(idordentransporte: number) {


  this.ordenTransporteService.getEventos(idordentransporte).subscribe(list => {

    let eventos =  list;
    this.events = [];

    this.ordenTransporteService.getOrden(idordentransporte).subscribe(ot => {

      console.log('ot', ot);

      this.ordenTransporte  = ot.ordenTransporte;
      this.guias = ot.guias;


    this.dialoglifecycle = true;

   eventos.forEach(x => {
  this.events.push({ 
    status: x.evento,
    dateRegister: x.fechaRegistro,
    dateEvent: x.fechaEvento,
    user: x.usuario === 'ADMIN ADMIN' ? 'CHATBOT' : x.usuario,
    icon: 'pi pi-shopping-cart',
    color: '#9C27B0'
  });
});



  });


  });




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

saveConfirm(){

  this.model.idestado = 3;
  this.model.idusuarioentrega =  this.user.id;
  this.model.idusuarioregistro =  this.user.id;
  this.model.personaentrega =  "Sello";
  this.model.dnientrega =  "12345678";
  
  this.ordenTransporteService.saveConfirm(this.model).subscribe(list => {

     this.dialogConfirm =  false;
      this.buscar();

      this.messageService.add({severity: 'success', summary: 'Orden Transporte ', detail: 'Se ha actualizado la fecha de entrega con éxito.'});

  });


}
unConfirm(){

  this.model.idestado = 3;
  this.model.idusuarioentrega =  this.user.id;
  this.model.idusuarioregistro =  this.user.id;
  this.model.personaentrega =  "Sello";
  this.model.dnientrega =  "12345678";


  
  this.confirmationService.confirm({
    message: '¿Esta seguro que desea desconfirmar esta OT?',
    accept: () => {
      
      
      this.ordenTransporteService.unConfirm(this.model).subscribe(list => {

        this.dialogConfirm =  false;
          this.buscar();

          this.messageService.add({severity: 'success', summary: 'Orden Transporte ', detail: 'Se ha desconfirmado la OT con éxito.'});
            


      });

  }


  });

}

  verarchivos(id) {

        const ref = this.dialogService.open(FileModalComponent, {
          header: 'Visor Fotos',
          width: '30%',
          data : {id }
      });
  }
}
