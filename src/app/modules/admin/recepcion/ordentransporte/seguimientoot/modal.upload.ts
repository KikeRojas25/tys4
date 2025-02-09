import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { TableModule } from 'primeng/table';
import { TimelineModule } from 'primeng/timeline';
import { ToastModule } from 'primeng/toast';
import { OrdenTransporteService } from '../ordentransporte.service';


@Component({
    template: `
        <div class="card card-border-color card-border-color-primary">
            <div class="card-body">
                <div class="row">
                    <div class="form-group col-12">
                        <p-fileUpload 
                            (uploadHandler)="myUploader($event)" 
                            (onUpload)="onUpload($event)" 
                            name="myfile[]"  
                            customUpload="true" 
                            multiple="true"
                            [maxFileSize]="10485760" 
                            [accept]="'image/*'"
                            [invalidFileSizeMessageSummary]="'Archivo demasiado grande: '"
                            [invalidFileSizeMessageDetail]="'Máximo permitido: 10 MB'">
                        </p-fileUpload>
                    </div>

                    <div class="form-group col-12">
                        <h5>Archivos Subidos</h5>
                        <ul *ngIf="uploadedFiles.length > 0">
                            <li *ngFor="let file of uploadedFiles; let i = index">
                                {{ file.name }} 
                                <button class="btn btn-sm btn-danger" (click)="removeFile(i)">Eliminar</button>
                            </li>
                        </ul>
                    </div>

                 
                </div>
            </div>
        </div>
    `,
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
       FileUploadModule
       
     ],
     providers: [
       ConfirmationService,
       DialogService,
       MessageService
     ]
})
export class UploadModalComponent implements OnInit {

    model: any = {};
    id: any;
    ot: any;
    es: any;
    uploadedFiles: any[] = [];

    constructor(
        public ref: DynamicDialogRef,
        private confirmationService: ConfirmationService,
        public messageService: MessageService,
        public config: DynamicDialogConfig,
        public ordenService: OrdenTransporteService 
    ) {
        this.id = config.data.id;
        this.ot = config.data.ot;
    }

    ngOnInit(): void {
        this.es = {
            firstDayOfWeek: 1,
            dayNames: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
            dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
            dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
            monthNames: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
            monthNamesShort: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
            today: 'Hoy',
            clear: 'Borrar'
        };
    }

    myUploader(event): void {
        for (let file of event.files) {
            const fileToUpload = file as File;
            const formData = new FormData();
            formData.append('file', fileToUpload, fileToUpload.name);

            this.ordenService.uploadFileSite(formData, this.id).subscribe(
                () => {
                    this.uploadedFiles.push(fileToUpload);
                    this.messageService.add({ severity: 'info', summary: 'Éxito', detail: 'Archivo subido correctamente' });
                },
                (error) => {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Falló la subida del archivo' });
                }
            );
        }
    }

    onUpload(event): void {
        for (let file of event.files) {
            this.uploadedFiles.push(file);
        }
        this.messageService.add({ severity: 'info', summary: 'Éxito', detail: 'Archivos subidos correctamente' });
    }

    removeFile(index: number): void {
        this.uploadedFiles.splice(index, 1);
        this.messageService.add({ severity: 'info', summary: 'Info', detail: 'Archivo eliminado' });
    }

    evento(): void {
        if (!this.model.observacion || this.model.observacion.trim() === '') {
            this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Debe ingresar una observación' });
            return;
        }

        // this.ordenService.VincularFactura(this.id, this.model.observacion).subscribe(
        //     (response) => {
        //         this.ref.close(response);
        //         this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Observación enviada correctamente' });
        //     },
        //     (error) => {
        //         this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Falló el envío de la observación' });
        //     }
        // );
    }
}
