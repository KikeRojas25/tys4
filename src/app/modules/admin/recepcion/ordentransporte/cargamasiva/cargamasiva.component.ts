import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { ConfirmationService, MessageService, PrimeNGConfig, SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { FileUpload, FileUploadModule } from 'primeng/fileupload';
import { OrdenTransporteService } from '../ordentransporte.service';
import { User } from 'app/core/user/user.types';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { BadgeModule } from 'primeng/badge';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cargamasiva',
  templateUrl: './cargamasiva.component.html',
  styleUrls: ['./cargamasiva.component.css'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatIcon,
    DynamicDialogModule ,
    DropdownModule ,
    CalendarModule,
    ButtonModule,
    TableModule,
    InputTextModule,
    FileUploadModule ,
    ToastModule ,
    ProgressBarModule,
    ConfirmDialogModule,
    BadgeModule
  ],
  providers: [
    ConfirmationService,
    DialogService,
    MessageService
  ]
})
export class CargamasivaComponent implements OnInit {

  
  @ViewChild('fileUpload', { static: false }) fileUpload!: FileUpload;
  
  files = [];
  totalSize : number = 0;
  totalSizePercent : number = 0;
  clientes: SelectItem[] = [];


  public errors = 0;
  public value = 0;
  public indeterminate = true;
  public min = -10;
  public max = 10;
  public chunks = 10;
  result:  any =[];
  public currentItem;
  public pageSizes = true;
  public pageSize = 200;
  public previousNext = true;
  public skip = 0;
  public allowUnsort = true;
  model: any = {};

  cols: any[];

  ordenes: any[];
  idcarga : any;

  public mySelection: number[] = [];

  divvisible = false;
  
  divprocesar = false;
  btnprocesar = false;
  divprocesando = false;
  public progress: number;
  public message: string;
  fileData: File = null;
  previewUrl: any = null;
  fileUploadProgress: string = null;
  uploadedFilePath: string = null;
  user: User;
  
  // Variables para manejo de errores
  errorMessage: string = null;
  showError: boolean = false;


  constructor(private ordenTransporteService: OrdenTransporteService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService ,
    private router: Router,
    private config: PrimeNGConfig
  ) { }

  ngOnInit() {

    this.user = JSON.parse(localStorage.getItem('user'));

    
    this.cols =
    [
      {header: 'ERROR', field: 'error'  ,  width: '160px' },

        {header: 'DNI', field: 'clientnum'  ,  width: '80px' },
        {header: 'DESTINATARIO', field: 'lastname' , width: '120px'  },
        {header: 'DIRECCIÓN' , field: 'responsable'  , width: '120px'   },
        {header: 'DISTRITO', field: 'razonsocial'  ,  width: '180px'  },
        {header: 'PROVINCIA', field: 'fechahoracita' , width: '120px'  },
        {header: 'DEPARTAMENTO', field: 'estado'  , width: '90px'   },
        {header: 'REFERENCIA', field: 'personarecojo' , width: '120px'  },
        {header: 'TELÉFONO', field: 'tipounidad'  ,  width: '80px'  },
        {header: 'NRO GUIA', field: 'personarecojo' , width: '220px'  },
        {header: 'PESO', field: 'centroacopio' , width: '120px'  },
     ];

     console.log('user:', this.user);

     

    this.ordenTransporteService.getClientes(this.user.idclientes).subscribe(resp => {

        const mappedClients = resp.map((item: any) => ({
          value: item.idCliente,
          label: item.razonSocial
        }));

        this.clientes.push(...mappedClients);


    });


  }

  choose(event: Event, chooseCallback: Function) {
    chooseCallback(); // Llamada al callback interno de PrimeNG
  }
  upload() {
    console.log(this.fileUpload.upload());
    this.fileUpload.upload(); // Llama al método 'upload' del componente 'p-fileUpload'
  }


  onTemplatedUpload(event: any) {

    const files: File[] = event.files;
    for (const file of files) {
      this.ordenTransporteService.uploadFile( file, this.user.id , this.model.idcliente).subscribe({
        next: (response) => {
          this.messageService.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded', life: 3000 });
          this.hideError();
        },
        error: (error) => {
          console.error('Error al cargar el archivo', error);
          const errorMsg = this.extractErrorMessage(error);
          this.showErrorMessage(errorMsg);
        },
      });
    }
  }
   

onSelectedFiles(event) {
  this.files = event.currentFiles;
  this.files.forEach((file) => {
      this.totalSize += parseInt(this.formatSize(file.size));
  });
  this.totalSizePercent = this.totalSize / 10;
}
formatSize(bytes) {
  const k = 1024;
  const dm = 3;
  const sizes = this.config.translation.fileSizeTypes;
  if (bytes === 0) {
      return `0 ${sizes[0]}`;
  }

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

  return `${formattedSize} ${sizes[i]}`;
}

onRemoveTemplatingFile(event, file, removeFileCallback, index) {
  removeFileCallback(event, index);
  this.totalSize -= parseInt(this.formatSize(file.size));
  this.totalSizePercent = this.totalSize / 10;
}

onClearTemplatingUpload(clear) {
  clear();
  this.totalSize = 0;
  this.totalSizePercent = 0;
}

uploadSelectedFiles() {
  if (this.files.length === 0) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No files selected',
      life: 3000
    });
    return;
  }

  if (!this.model.idcliente) {
    this.showErrorMessage('Por favor, seleccione un cliente antes de subir los archivos.');
    return;
  }

  for (const file of this.files) {
    this.ordenTransporteService.uploadFile(file, this.user.id , this.model.idcliente).subscribe(resp => {
     

      this.ordenes  = resp.detalles;
      this.idcarga = resp.cargaid;


      console.log('respuesta:', this.ordenes, this.idcarga);


      if( this.ordenes.length > 0 )
        {
          this.divvisible = false;
          this.btnprocesar = false;
        }
        else {
          this.divvisible = false;
          this.btnprocesar = true;
        }
  
        this.hideError();
        this.messageService.add({
          severity: 'info',
          summary: 'Exitoso',
          detail: 'Archivo cargado',
          life: 3000
        });



      }, error => {
        console.error('Error downloading the file', error);
        const errorMsg = this.extractErrorMessage(error);
        this.showErrorMessage(errorMsg);
      });

      


  }
}

  procesar(): void {



    this.confirmationService.confirm({
      message: '¿Está seguro que desea procesar?',
      header: 'Procesar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {

        this.ordenTransporteService.procesarCargaMasiva(this.idcarga ).subscribe(resp => {

          this.hideError();
          this.messageService.add({
            severity: 'info',
            summary: 'Exitoso',
            detail: 'Archivo Procesado exitosamente.',
            life: 3000
          });
          this.router.navigate(['seguimientoot/listadoordentransporte']);



       }, error => {
        console.error('Error al procesar la carga', error);
        const errorMsg = this.extractErrorMessage(error);
        this.showErrorMessage(errorMsg);
        this.divvisible = false;


      }, () => {
        // this.router.navigate(['/dashboard']);
        this.divvisible = false;


      });


      },
      reject: () => {

      }
  });
  }

  // Métodos para manejo de errores
  showErrorMessage(message: string) {
    this.errorMessage = message;
    this.showError = true;
  }

  hideError() {
    this.errorMessage = null;
    this.showError = false;
  }

  // Método para extraer el mensaje de error del JSON de respuesta
  extractErrorMessage(error: any): string {
    // Si el error es una cadena de texto
    if (typeof error === 'string') {
      return error;
    }

    // Si error.error existe (objeto de respuesta HTTP)
    if (error?.error) {
      // Buscar en diferentes propiedades comunes del JSON de error
      if (typeof error.error === 'string') {
        return error.error;
      }
      
      if (error.error?.error) {
        return error.error.error;
      }
      
      if (error.error?.message) {
        return error.error.message;
      }
      
      if (error.error?.mensaje) {
        return error.error.mensaje;
      }
      
      // Si error.error es un objeto, intentar obtener el primer valor de string
      if (typeof error.error === 'object') {
        const errorObj = error.error;
        // Buscar propiedades comunes que contengan el mensaje
        for (const key in errorObj) {
          if (typeof errorObj[key] === 'string' && errorObj[key].length > 0) {
            return errorObj[key];
          }
        }
      }
    }

    // Si error.message existe
    if (error?.message) {
      return error.message;
    }

    // Mensaje por defecto
    return 'Error inesperado. Por favor, intente nuevamente.';
  }
}
