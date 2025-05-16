import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DynamicDialogModule, DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';
import { Cliente } from 'app/modules/admin/recepcion/ordentransporte/ordentransporte.types';
import { MantenimientoService } from '../../mantenimiento.service';
import { EditComponent } from '../edit/edit.component';
import { NewComponent } from '../new/new.component';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ConfirmDialogModule,
    InputTextModule,
    MatIcon,
    DynamicDialogModule,
    ReactiveFormsModule ,
    MessageModule,
    ToastModule

  ],
  providers: [
    ConfirmationService ,
    DialogService ,
    MessageService
  ]
})
export class ListComponent implements OnInit {

  ref: DynamicDialogRef | undefined;


  clientes: Cliente[];
  cols: any[];



  constructor(private mantenimientoService: MantenimientoService,
    public dialogService: DialogService,
    private confirmationService: ConfirmationService ,
    private messageService: MessageService
  ) { }

  ngOnInit() {


    this.cols = [
      { field: 'idCliente', header: 'ID',  width: '10%'},
      { field: 'razonSocial', header: 'Razón Social' ,  width: '40%'},
      { field: 'ruc', header: 'RUC' ,  width: '40%'},
      { field: 'tipo', header: 'Acciones',  width: '20%' }
        ];

      this.load();
  
  }

  load() {
    this.mantenimientoService.getAllClientes('', 1).subscribe(resp => {
      this.clientes = resp;
    });
  }

  nuevo() {
    this.ref = this.dialogService.open(NewComponent, {
      header: 'Nuevo Cliente',
      width: '50%', // Tamaño opcional del diálogo
      closable: true, // Habilitar cierre
      modal: true, // Modalidad
      dismissableMask: true, // Permitir cierre al hacer clic fuera
      data: {}, // Puedes pasar datos iniciales si los necesitas
    });
  
    // Manejar el evento de cierre del diálogo
    this.ref.onClose.subscribe((result) => {
      if (result) {
        console.log('Datos del formulario recibidos:', result);
        this.messageService.add({ severity: 'success', summary: 'Mantenimiento de clientes', detail: 'Se ha registrado al cliente de manera correcta.' });
        this.load();
      }
    });
  }

  edit(id) {
    this.ref = this.dialogService.open(EditComponent, {
      header: 'Editar Cliente',
      width: '50%', // Tamaño opcional del diálogo
      closable: true, // Habilitar cierre
      modal: true, // Modalidad
      dismissableMask: true, // Permitir cierre al hacer clic fuera
      data: {id : id}, // Puedes pasar datos iniciales si los necesitas
    });
  
    // Manejar el evento de cierre del diálogo
    this.ref.onClose.subscribe((result) => {
      if (result) {
        console.log('Datos del formulario recibidos:', result);
        this.messageService.add({ severity: 'success', summary: 'Mantenimiento de clientes', detail: 'Se ha registrado al cliente de manera correcta.' });
        this.load();
      }
    });
   }
   confirm(id) {
  
     this.confirmationService.confirm({
         message: '¿Está seguro que desea eliminar?',
         header: 'Eliminar',
         icon: 'pi pi-exclamation-triangle',
         accept: () => {
           this.mantenimientoService.deleteCliente(id).subscribe(x => {
              
               this.messageService.add({ severity: 'success', summary: 'Mantenimiento de clientes', detail: 'Se ha eliminado al cliente de manera correcta.' });

               this.load();

             });
         },
         reject: () => {
  
         }
     });
  }


}
