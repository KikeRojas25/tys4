import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MessageService, ConfirmationService, SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogModule, DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TimelineModule } from 'primeng/timeline';
import { ToastModule } from 'primeng/toast';
import { MantenimientoService } from '../../mantenimiento.service';

import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { NewComponent } from '../new/new.component';
import { EditComponent } from '../edit/edit.component';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
  standalone:true,
  imports: [
        InputTextModule, 
        DropdownModule,
        FormsModule,
        ButtonModule,
        TableModule,
        CommonModule,
        DialogModule   ,
        TimelineModule ,
        CardModule ,
        DynamicDialogModule ,
        ToastModule,
        CalendarModule,
        ConfirmDialogModule,
        MatIcon,
        IconFieldModule,
        InputIconModule,
        InputMaskModule ,
        InputNumberModule
      ],
      providers: [
        DialogService ,
        MessageService ,
        ConfirmationService     
      ]
})
export class ListComponent implements OnInit {

  proveedores: SelectItem[] = [];
  model: any = { placa: '', idProveedor: null };
  vehiculos: any = [];
  cargandoProveedores = false;
  loading = false;
  mostrarModal: boolean = false;
  marcas: SelectItem[] = [];
  tiposVehiculo:SelectItem[] = [];
  ref: DynamicDialogRef | undefined;

  constructor(private mantenimientoService: MantenimientoService,

        private messageService: MessageService,
        public dialogService: DialogService,
        private confirmationService: ConfirmationService ,
   ) { 

    

  }

  ngOnInit() {
    this.cargandoProveedores = true;
    // Solo transportistas (21513) para asignación de vehículos
    this.mantenimientoService.getProveedores('', 21513).subscribe({
      next: (data) => {

     
        this.proveedores = data.map(p => ({
          label: p.razonSocial, // o lo que corresponda
          value: p.idProveedor
      }));



    },
    error: (err) => {
        console.error('Error al cargar proveedores', err);
    },
    complete: () => {
        this.cargandoProveedores = false;
    } 
  
  
  });


  }

  buscar() {

    const placa = (this.model.placa ?? '').trim();
    this.loading = true;
    const idProv = this.model.idProveedor ?? null;

    this.mantenimientoService.vehiculoGetAll(placa === '' ? null : placa, idProv).subscribe({
      next: (data) => {
        this.vehiculos = data;

        console.log('vehiculos', this.vehiculos);
    },
    error: (err) => {
        console.error('Error al listar vehículos', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Vehículos',
          detail: err?.error?.message ?? 'No se pudo listar vehículos.',
        });
    },
    complete: () => {
        this.loading = false;
    } 
  
  
  });




  } 
  editar(id: number) {  

console.log('vehiculoselected', id);


    this.ref = this.dialogService.open(EditComponent, {
      header: 'Editar vehículo',
         width: '700px',
        height: '600px',
        data: {vehiculoId:id}
      
  });

  this.ref.onClose.subscribe((actualizado) => {
    if (actualizado) {
      this.buscar(); // 👈 refresca tu tabla
    }
  });


  }
  nuevo() {

    this.ref = this.dialogService.open(NewComponent, {
      header: 'Nuevo vehículo',
         width: '700px',
        height: '600px',
        data: {codigo:''}
      
  });
  this.ref.onClose.subscribe((actualizado) => {
    if (actualizado) {
      this.buscar(); // 👈 refresca tu tabla
    }
  });


  }
  exportarExcel() {

  }
  
  eliminar(id: number): void {


    this.confirmationService.confirm({
      message: '¿Está seguro que desea eliminar el vehículo?',
      header: 'Eliminar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {

      this.mantenimientoService.vehiculoEliminar(id).subscribe({
        next: (res) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Vehículos',
            detail: res?.message ?? 'Vehículo eliminado correctamente.',
          });
          this.buscar(); // refresca la lista
        },
        error: (err) => {
          console.error('Error al eliminar', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Vehículos',
            detail: err?.error?.message ?? 'Error al eliminar el vehículo.',
          });
        }
      });
     },
  reject: () => {

  }
});
}




}
