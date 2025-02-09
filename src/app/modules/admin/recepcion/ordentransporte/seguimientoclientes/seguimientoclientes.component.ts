import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';
import { User } from 'app/core/user/user.types';
import { ConfirmationService, MenuItem, MessageService, SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { Table, TableModule } from 'primeng/table';
import { TimelineModule } from 'primeng/timeline';
import { ToastModule } from 'primeng/toast';
import { OrdenTransporteService } from '../ordentransporte.service';
import { OrdenTransporte } from '../ordentransporte.types';
import { FileModalComponent } from '../seguimientoot/modalfiles';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { DetalleotComponent } from '../detalleot/detalleot.component';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';


interface EventItem {
  status?: string;
  dateRegister?: string;
  dateEvent?: string;
  icon?: string;
  color?: string;
  image?: string;
  user?: string;
}

interface Column {
  field: string;
  header: string;
  customExportHeader?: string;
}

interface ExportColumn {
  title: string;
  dataKey: string;
}

@Component({
  selector: 'app-seguimientoclientes',
  templateUrl: './seguimientoclientes.component.html',
  styleUrls: ['./seguimientoclientes.component.css'],
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
      DynamicDialogModule
      
    ],
    providers: [
      ConfirmationService,
      DialogService,
      MessageService
    ]
})
export class SeguimientoclientesComponent implements OnInit {

clientes: SelectItem[] = [];
  ubigeo: SelectItem[] = [];
  estados: SelectItem[] = [];
  events: EventItem[];
  ref: DynamicDialogRef | undefined;

  exportColumns!: ExportColumn[];

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
  dateInicio: Date = new Date(Date.now()) ;
  dateFin: Date = new Date(Date.now()) ;
  imageToShow: any;
  items: MenuItem[];


  estadosMap = {
    0: [0],
    1: [6], // "Por despachar" se mapea a "Pend. Programacion"
    2: [11, 13], // "Por entregar" se mapea a "En Ruta", "En Reparto" y "Entregado"
    3: [34,35], // "TODOS LOS ESTADOS" incluye todos
};
  
@ViewChild('dt') dt: Table | undefined;

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
    this.model.referencia = '';
    this.model.grr = '';
    this.model.nummanifiesto = '';
    this.model.numhojaruta = '';



    this.cols =
    [
        {header: 'ACC', field: 'numcp'  ,  width: '160px' },
        {header: 'OT', field: 'numcp'  ,  width: '100px' },
        {header: 'GRR', field: 'grr'  ,  width: '150px' },
        {header: 'F. RECOJO', field: 'fecharegistro' , width: '120px'  },
        {header: 'F. DESPACHO', field: 'fecharegistro' , width: '120px'  },
        {header: 'F. ENTREGA', field: 'fecharegistro' , width: '120px'  },
        {header: 'CLIENTE', field: 'razonsocial'  ,  width: '180px'  },
        {header: 'DESTINATARIO', field: 'razonsocial'  ,  width: '180px'  },
        // {header: 'MANIFIESTO TRONCAL', field: 'razonsocial'  ,  width: '280px'  },
        // {header: 'HOJA DE RUTA TRONCAL ', field: 'razonsocial'  ,  width: '280px'  },
     
        {header: 'ESTADO', field: 'estado'  , width: '120px'   },
        {header: 'ORIGEN', field: 'estado'  , width: '120px'   },
        {header: 'DESTINO', field: 'estado'  , width: '120px'   },
       
        // {header: 'MANIFIESTO', field: 'razonsocial'  ,  width: '120px'  },
        // {header: 'HOJA DE RUTA', field: 'razonsocial'  ,  width: '120px'  },
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
    this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));

    this.ordenTransporteService.getClientes(this.user.idscliente).subscribe(resp => {
        this.clientes.push({ value: 0,  label : 'TODOS LOS CLIENTES'});
        resp.forEach(element => {
            this.clientes.push({ value: element.idCliente ,  label : element.razonSocial});
          });

        this.ProveedorLoaded = true;
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
    this.router.navigate(['/seguimientoot/editarot', id]);
  }

  verguias(id) {

    this.ref = this.dialogService.open(DetalleotComponent, { header: 'Detalle de la OT'});


   // this.router.navigate(['/seguimiento/verorden', id]);
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

      console.log(this.model);



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

    // const url = `http://104.36.166.65/webreports/ot.aspx?idorden=${idOrdenTrabajo}`;
    // window.open(url, '_blank');

   

    
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


  this.ref = this.dialogService.open(DetalleotComponent, 
    
    {
      data: idordentransporte, 
      header: 'Detalle de la OT'
    
    });
 // this.router.navigate(['/seguimientoot/detalleot', idordentransporte]);

  // this.ordenTransporteService.getEventos(idordentransporte).subscribe(list => {

  //   let eventos =  list;
  //   this.events = [];



  //   this.dialoglifecycle = true;

  //   eventos.forEach(x=> {
  //     this.events.push({ 
  //       status: x.descripcion, dateRegister: x.fechaRegistro , dateEvent: x.fechaEvento , user: x.usuario, icon:'pi pi-shopping-cart', color: '#9C27B0'
  //     })
  //   })

    // this.events = [
    //         { status: 'descripcion', date: '15/10/2020 10:30', icon: 'pi pi-shopping-cart', color: '#9C27B0', image: 'game-controller.jpg' },
    //         { status: 'Processing', date: '15/10/2020 14:00', icon: 'pi pi-cog', color: '#673AB7' },
    //         { status: 'Shipped', date: '15/10/2020 16:15', icon: 'pi pi-shopping-cart', color: '#FF9800' },
    //         { status: 'Delivered', date: '16/10/2020 10:00', icon: 'pi pi-check', color: '#607D8B' }
    //     ];





  // });




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

verarchivos(id) {

  const ref = this.dialogService.open(FileModalComponent, {
    header: 'Visor Fotos',
    width: '30%',
    data : {id }
});
}

getEstadosParaBusqueda(valueSeleccionado: number): string {
  const estadosArray = this.estadosMap[valueSeleccionado] || [valueSeleccionado];
  return estadosArray.join(","); // Convierte el array a una cadena separada por comas
}
exportarExcel() {
  if (!this.ordenes || this.ordenes.length === 0) {
    console.error("No hay datos para exportar.");
    return;
  }

  // Obtener dinámicamente todas las claves (columnas) de los objetos
  const keys = Object.keys(this.ordenes[0]);

  // Convertir los datos a un formato adecuado para Excel
  const datos = this.ordenes.map(obj =>
    keys.reduce((acc, key) => {
      acc[key.toUpperCase()] = obj[key]; // Convertir los nombres de columna a mayúsculas si se desea
      return acc;
    }, {} as Record<string, any>)
  );

  const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datos);
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Ordenes");

  const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });

  saveAs(blob, "Ordenes.xlsx");
}



}
