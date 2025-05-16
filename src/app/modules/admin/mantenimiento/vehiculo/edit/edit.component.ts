import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';

import { MessageService, ConfirmationService, SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogConfig, DynamicDialogModule, DynamicDialogRef } from 'primeng/dynamicdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MantenimientoService } from '../../mantenimiento.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css'],
  standalone:true,
      imports: [
            InputTextModule, 
            DropdownModule,
            FormsModule,
            ButtonModule,
            TableModule,
            CommonModule,
            DialogModule   ,
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
            MessageService ,
            ConfirmationService     
          ]
})
export class EditComponent implements OnInit {

 
   proveedores: SelectItem[] = [];
   model: any = {};
   cargandoProveedores = false;  
     marcas: SelectItem[] = [];
     tiposVehiculo:SelectItem[] = [];
 
 
   constructor(private mantenimientoService: MantenimientoService,
           private generalService: MantenimientoService,
           private ref: DynamicDialogRef,
           private confirmationService: ConfirmationService ,
           public config: DynamicDialogConfig,
           private messageService: MessageService) {





            }
 
   ngOnInit(): void {
    this.cargarDatosIniciales();
  }

  cargarDatosIniciales(): void {
    forkJoin({
      marcas: this.generalService.getValorTabla(18),
      tipos: this.generalService.getValorTabla(8),
      proveedores: this.mantenimientoService.getProveedores('', 21513)
    }).subscribe({
      next: ({ marcas, tipos, proveedores }) => {
        this.marcas = marcas.map(m => ({ label: m.valor, value: m.idValorTabla }));
        this.tiposVehiculo = tipos.map(t => ({ label: t.valor, value: t.idValorTabla }));
        this.proveedores = proveedores.map(p => ({ label: p.razonSocial, value: p.idProveedor }));
        this.cargandoProveedores = false;

        const vehiculoId = this.config.data?.vehiculoId;
        if (vehiculoId) {
          this.obtenerVehiculo(vehiculoId);
        }
      },
      error: err => {
        console.error('Error al cargar datos iniciales', err);
        this.cargandoProveedores = false;
      }
    });
  }


   
   cargarDropdown() {
    
     this.generalService.getValorTabla(5).subscribe(resp =>    {
 
       console.log(resp);
         resp.forEach(element => {
           this.marcas.push({ value: element.idValorTabla , label: element.valor});
         });
 
       });
 
       this.generalService.getValorTabla(4).subscribe(resp =>
         {
           resp.forEach(element => {
             this.tiposVehiculo.push({ value: element.idValorTabla , label: element.valor});
           });
   
         });
   }
   cargarDropdownProveedores() {
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
   obtenerVehiculo(id: number) {
    this.mantenimientoService.getVehiculoById(id).subscribe({
      next: (data) => {

        console.log('Vehículo:', data);

        this.model = {
          ...data,
          // Asegúrate de que los siguientes campos sean los `value` (ids) del dropdown
          marcaid: data.marcaId, // si usas ID para marcas
          tipoid: data.tipoId,
          proveedorId: data.proveedorId
        };
      },
      error: (err) => {
        console.error('Error al obtener el vehículo', err);
      }
    });
  }

  actualizarVehiculo(): void {


    this.model.idVehiculo = this.config.data?.vehiculoId;
    this.confirmationService.confirm({
      message: '¿Está seguro que desea actualizar el vehículo?',
      header: 'Actualizar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {



    this.mantenimientoService.actualizarVehiculo(this.model.idVehiculo, this.model).subscribe({
      next: (res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Actualización exitosa',
          detail: res.message
        });
        this.ref?.close(true); // Cierra modal y notifica que se actualizó


        
      },
      error: (err) => {
        const mensaje = err.error?.message || 'Error al actualizar vehículo';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: mensaje
        });
      }
    });



  },
  reject: () => {

  }
});



  }
  
  
   cerrarModal() { 
          this.ref?.close();
      }
 
 
 }
 