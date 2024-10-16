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
    ToastModule
    
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
  


  constructor(private ordenTransporteService: OrdenTransporteService,
              public dialogService: DialogService,
              private router: Router,
              private confirmationService: ConfirmationService,
              public messageService: MessageService
              ) { }

  ngOnInit() {

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
    this.dateInicio.setDate((new Date()).getDate() - 7);
    this.dateFin.setDate((new Date()).getDate() );
    this.model.numcp = '';
    this.model.docreferencia = '';
    this.model.grr = '';
    this.model.nummanifiesto = '';
    this.model.numhojaruta = '';



    this.cols =
    [
        {header: 'ACC', field: 'numcp'  ,  width: '160px' },
        {header: 'OT', field: 'numcp'  ,  width: '100px' },
        {header: 'F. RECOJO', field: 'fecharegistro' , width: '120px'  },
        {header: 'F. DESPACHO', field: 'fecharegistro' , width: '120px'  },
        {header: 'CLIENTE', field: 'razonsocial'  ,  width: '180px'  },
        {header: 'DESTINATARIO', field: 'razonsocial'  ,  width: '180px'  },
        // {header: 'MANIFIESTO TRONCAL', field: 'razonsocial'  ,  width: '280px'  },
        // {header: 'HOJA DE RUTA TRONCAL ', field: 'razonsocial'  ,  width: '280px'  },
     
        {header: 'ESTADO', field: 'estado'  , width: '120px'   },
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
    this.estados.push({ value: 6,  label : 'Pend. Programacion'});
    this.estados.push({ value: 11,  label : 'En Ruta'});
    this.estados.push({ value: 13,  label : 'En Reparto'});
    this.estados.push({ value: 34,  label : 'Pendiente de Cargo'});
    this.estados.push({ value: 35,  label : 'Pendiente Envio Cargo'});

    this.model.idestado = 0;



  }
//  exportExcel() {
//     import('xlsx').then(xlsx => {
//         const worksheet = xlsx.utils.json_to_sheet( this.ordenes );
//         const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
//         const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
//         this.saveAsExcelFile(excelBuffer, 'ListaOT');
//     });
// }
// saveAsExcelFile(buffer: any, fileName: string): void {
//   import('file-saver').then(FileSaver => {
//       const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
//       const EXCEL_EXTENSION = '.xlsx';
//       const data: Blob = new Blob([buffer], {
//           type: EXCEL_TYPE
//       });
//       FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
//   });
// }
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

  eliminar(id) {

    this.confirmationService.confirm({
      message: '¿Esta seguro que desea elminar esta OTR?',
      accept: () => {
        this.loading = true;
        this.model.responsablecomercialid = this.user.usr_int_id;
        this.model.idordentrabajo = id;
        // this.ordenTransporteService.eliminar(this.model).subscribe(resp => {
        //   //this.messageService.add({severity: 'info', summary: 'Orden Recojo', detail: 'Se ha eliminado con éxito.'});
        //   this.toastr.show('Se ha eliminado con éxito.' );
        //   this.buscar();
        //   this.loading = false;

        // });
      }
  });

  }

  buscar() {

      this.model.fecinicio = this.dateInicio;
      this.model.fecfin = this.dateFin;
      this.model.idusuario = 1;
      this.ordenTransporteService.getAllOrder(this.model).subscribe(list => {

        this.ordenes =  list;

        console.log('ordenes:' , this.ordenes);


      });
  }
  // getFiles(id, event, overlaypanel: OverlayPanel) {
  //   this.ordenTransporteService.getAllDocumentos(id).subscribe(list => {
  //       this.downloadFile(list[2].id);
  //       overlaypanel.toggle(event);
  //  });
  // }
  downloadFile(documentoId: number) {

    // this.ordenTransporteService.downloadDocumento(documentoId).subscribe(
    //    (response: any) => {
    //        const dataType = response.type;
    //        const binaryData = [];
    //        binaryData.push(response);
    //        const downloadLink = document.createElement('a');
    //        downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, {type: dataType}));
    //        this.createImageFromBlob(new Blob(binaryData, {type: dataType}));
    //    }
    //  );
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
 ver(id) {
//   this.ref = this.dialogService.open(VerAsignacionComponent, {
//     header: 'Ver detalle de asignación',
//     width: '40%',
//     contentStyle: {'max-height': '400px', overflow: 'auto'},
//     baseZIndex: 10000,
//     data : {id }
// });

//   this.ref.onClose.subscribe((product: any) => {
//     if (product === undefined) { return; }
//     else{

//       this.messageService.add({severity: 'info', summary: 'Vehículo seleccionado', detail: product.placa});
//     }
// });

 }
 asignar (id) {
  // this.ref = this.dialogService.open(AsignarEstibaComponent, {
  //   header: 'Asignar Estiba',
  //   width: '40%',
  //   contentStyle: {'max-height': '400px', overflow: 'auto'},
  //   baseZIndex: 10000,
  //   data : {id }
// });

//   this.ref.onClose.subscribe((product: any) => {
//     if (product === undefined) { return; }
//     else{
//       this.messageService.add({severity: 'info', summary: 'Vehículo seleccionado', detail: product.placa});
//     }
// });

}
verot(idOrdenTrabajo) {

    const url = `http://104.36.166.65/webreports/ot.aspx?idorden=${idOrdenTrabajo}`;
    window.open(url, '_blank');
}
vermanifiesto(idmanifiesto) {
  var url = "http://104.36.166.65/webreports/manifiesto.aspx?idmanifiesto=" + String(idmanifiesto);
  window.open(url);
}
vertracking(idordentransporte: number) {


  this.ordenTransporteService.getEventos(idordentransporte).subscribe(list => {

    let eventos =  list;
    this.events = [];



    this.dialoglifecycle = true;

    eventos.forEach(x=> {
      this.events.push({ 
        status: x.descripcion, dateRegister: x.fechaRegistro , dateEvent: x.fechaEvento , user: x.usuario, icon:'pi pi-shopping-cart', color: '#9C27B0'
      })
    })

    // this.events = [
    //         { status: 'descripcion', date: '15/10/2020 10:30', icon: 'pi pi-shopping-cart', color: '#9C27B0', image: 'game-controller.jpg' },
    //         { status: 'Processing', date: '15/10/2020 14:00', icon: 'pi pi-cog', color: '#673AB7' },
    //         { status: 'Shipped', date: '15/10/2020 16:15', icon: 'pi pi-shopping-cart', color: '#FF9800' },
    //         { status: 'Delivered', date: '16/10/2020 10:00', icon: 'pi pi-check', color: '#607D8B' }
    //     ];





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

}