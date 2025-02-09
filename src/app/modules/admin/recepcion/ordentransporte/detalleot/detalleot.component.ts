import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { TableModule } from 'primeng/table';
import { TimelineModule } from 'primeng/timeline';
import { ToastModule } from 'primeng/toast';
import { OrdenTransporteService } from '../ordentransporte.service';
import { Documento, OrdenTransporte } from '../ordentransporte.types';
import { CarouselModule } from 'primeng/carousel';

@Component({
  selector: 'app-detalleot',
  templateUrl: './detalleot.component.html',
  styleUrls: ['./detalleot.component.css'],
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
        CarouselModule
        
      ],
      providers: [
        ConfirmationService,
        DialogService,
        MessageService
      ]
})
export class DetalleotComponent implements OnInit {
  id_interval: any;
  id: any;
  lat = -12.0608335;
  lng = -76.9347693 ;
  zoom = 16;
  
  pageSizeOptions: number[] = [5, 10, 25, 50, 100];
  displayedColumns: string[] = [ 'Nombre', 'actionsColumn' ];
  documentos: Documento[];
  intervalId: number;
  text = 'Your Text Here';
  target; options;
  cols: any[];
  cols2: any[];
  orden: any ;
  guias: any;
  imageToShow: any;
  escliente: any;
  


  constructor( private router: Router,
    private activatedRoute: ActivatedRoute,
    private messageService: MessageService,
    public dialogService: DialogService,
    public config: DynamicDialogConfig, 
    public ref: DynamicDialogRef,
    private ordenService: OrdenTransporteService) { }






ngOnInit() {
this.cols = [
    { field: 'fecha_incidencia', header: 'Fecha Incidencia',  width: '20%'},
    { field: 'incidencia', header: 'Incidencia' ,  width: '20%'},
    { field: 'observacion', header: 'Observación' ,  width: '30%'},
    { field: 'usuario', header: 'Usuario',  width: '20%' },

    ];
    this.cols2 = [
    { field: 'nombre', header: 'Nombre',  width: '20%'},
    { field: 'usuario', header: 'Acciones',  width: '20%' }
    ];


    this.id = this.config.data|| null;

    console.log(this.id);


//this.id  = this.activatedRoute.snapshot.params.uid;

      this.ordenService.getOrden(this.id).subscribe(orden => {


      this.orden = orden.ordenTransporte;
      this.guias = orden.guias

      console.log(this.orden);
     



        
      });



this.ordenService.getAllDocumentos( this.id ).subscribe(list1 => {

this.documentos = list1;

});


}


createImageFromBlob(image: Blob) {
const reader = new FileReader();
reader.addEventListener('load', () => {
this.imageToShow = reader.result;
console.log(reader.result);

}, false);

if (image) {
reader.readAsDataURL(image);
}
}
// downloadFile(documentoId: number) {
// this.ordenService.downloadDocumento(documentoId).subscribe(
// (response: any) => {
// const dataType = response.type;
// const binaryData = [];
// binaryData.push(response);
// const downloadLink = document.createElement('a');
// downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, {type: dataType}));


// window.open(downloadLink.href);
// }
// );
// }

deleteVendorRecord(nose: any) {
alert(nose);

}
volver() {
this.router.navigate(['/seguimiento/listadoordentransporte']);
}




}
