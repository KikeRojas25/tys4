import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';

import { MantenimientoService } from '../../mantenimiento.service';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-new',
  templateUrl: './new.component.html',
  styleUrls: ['./new.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    InputMaskModule,
    InputTextModule,
    CardModule,
    FormsModule,
    ButtonModule
  ]
})
export class NewComponent implements OnInit {

  model: any = {};

  constructor(
    private mantenimientoService: MantenimientoService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private ref: DynamicDialogRef,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    // Inicialización si se necesita
  }

  /**
   * Registra un nuevo chofer si el formulario es válido
   */
  registrar(form: NgForm): void {


    if (form.invalid) {
      return;
    }


    
    this.confirmationService.confirm({
      acceptLabel: 'Guardar',                   // Texto del botón "Aceptar"
      rejectLabel: 'Cancelar',                  // Texto del botón "Rechazar"
      acceptIcon: 'pi pi-check',                // Icono del botón "Aceptar"
      rejectIcon: 'pi pi-times',                // Icono del botón "Rechazar"
      message: '¿Está seguro que desea crear este nuevo conductor?',
      header: 'Confirmar Guardado',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
  

    const telefonoConCodigo = '+51' + this.model.telefono;


    console.log('Datos del formulario:', this.model);

    this.mantenimientoService.registrar_chofer(this.model).subscribe({
      next: (resp) => {
        // Aquí puedes mostrar un mensaje de éxito si deseas
        this.ref?.close();

        
      },
      error: (err) => {
        console.error('Error al registrar chofer:', err);
        // Aquí podrías mostrar una alerta/toast si lo deseas

        this.messageService.add({severity:'error', summary:'Error', detail: err.error.message});
        this.ref?.close();

        
      },
      complete: () => {
      }
    });
  
    } ,
    reject: () => {
    }
    });

  }

  /**
   * Cancela el registro y redirige al listado
   */
  cancel(): void {
    this.router.navigate(['mantenimiento/listadoconductores']);
  }

}
