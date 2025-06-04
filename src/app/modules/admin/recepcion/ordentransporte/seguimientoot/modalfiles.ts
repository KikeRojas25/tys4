import { CommonModule } from '@angular/common';
import {Component, OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogRef, DynamicDialogConfig, DialogService } from 'primeng/dynamicdialog';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { TableModule } from 'primeng/table';
import { TimelineModule } from 'primeng/timeline';
import { ToastModule } from 'primeng/toast';
import { OrdenTransporteService } from '../ordentransporte.service';
import { CarouselModule } from 'primeng/carousel';





@Component({
    template: `
   <p-carousel [value]="documentos" [numVisible]="1" [numScroll]="1" [circular]="true">
  <ng-template let-product pTemplate="item">
    <div class="product-item">
      <div class="product-item-content">
        <div class="p-mb-3">
          <img
            [src]="'http://104.36.166.65/Tys2.0/uploadedfiles/' + product.idordentrabajo + '/' + product.nombrearchivo"
            (error)="cambiarImagen($event, product)"
          />
        </div>
      </div>
    </div>
  </ng-template>
</p-carousel>
    `
     ,standalone: true,
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
           FileUploadModule,
           CarouselModule
           
         ],
         providers: [
           ConfirmationService,
           DialogService,
           MessageService
         ]
})
export class FileModalComponent  implements OnInit {

    documentos: any[];
    id: any;

    constructor(private ordenService: OrdenTransporteService
        ,       public ref: DynamicDialogRef, public config: DynamicDialogConfig) {

            this.id = config.data.id;
            this.ordenService.getAllDocumentos(config.data.id ).subscribe(x => {

                this.documentos = x;



          });
         }

    ngOnInit() {

    }

    cambiarImagen(event: Event, product: any) {
        const imgElement = event.target as HTMLImageElement;
        imgElement.src = 'http://199.89.55.49/tysfiles/' + product.idordentrabajo + '/' + product.nombrearchivo;
    }

    // downloadFile(documentoId: number) {
    //     this.ordenService.downloadDocumento(documentoId).subscribe(
    //       (response: any) => {
    //           const dataType = response.type;
    //           const binaryData = [];
    //           binaryData.push(response);
    //           const downloadLink = document.createElement('a');
    //           downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, {type: dataType}));
    //          // document.body.appendChild(downloadLink);
    //           // downloadLink.click();
    //          // this.createImageFromBlob(new Blob(binaryData, {type: dataType}));

    //           window.open(downloadLink.href);
    //       }
    //     );
    //   }

}
