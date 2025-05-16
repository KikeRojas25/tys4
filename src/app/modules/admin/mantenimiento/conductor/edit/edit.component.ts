import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { MantenimientoService } from '../../mantenimiento.service';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css'],
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
export class EditComponent implements OnInit {

  model: any = {};

  constructor(
    private mantenimientoService: MantenimientoService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    // Inicialización si se necesita
    const id = this.config.data?.id;

    console.log('ID del chofer:', id);


    if (id) {

      this.mantenimientoService.getChoferById(id).subscribe({
        next: (chofer) => {
         // this.model = chofer;


          this.model = {
            ...chofer,
            telefono: chofer.telefono?.startsWith('+51')
              ? chofer.telefono.substring(3)
              : chofer.telefono
          };


          console.log('Chofer cargado:', chofer);
        },
        error: (err) => {
          console.error('Error al cargar chofer:', err);
          // Aquí puedes redirigir o mostrar un mensaje si el ID no existe
        }
      });
    }



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
    
    this.model.idchofer =    this.config.data?.id;

    console.log('Datos del formulario:', this.model);

    this.mantenimientoService.editar_chofer(this.model).subscribe({
      next: (resp) => {
        // Aquí puedes mostrar un mensaje de éxito si deseas
        this.ref?.close();
        
      },
      error: (err) => {
        console.error('Error al registrar chofer:', err);

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
   
  }

}
