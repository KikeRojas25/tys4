import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MantenimientoService } from '../../mantenimiento.service';

@Component({
  selector: 'app-new',
  templateUrl: './new.component.html',
  styleUrls: ['./new.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    InputNumberModule 
  ],
  providers: [ DialogService ]
})
export class NewComponent implements OnInit {
  form: FormGroup;

  constructor(
    private mantenimientoService: MantenimientoService,
    public ref: DynamicDialogRef,
    private fb: FormBuilder,
    private confirmationService: ConfirmationService ,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      razon_social: [
        '',
        [Validators.required, Validators.minLength(3), Validators.maxLength(50)]
      ],
      ruc: [
        null,
        [Validators.required, Validators.minLength(8), Validators.maxLength(11)]
      ],
    
    });
  }

  onSubmit(): void {

    if (this.form.valid) {
      this.confirmationService.confirm({
        message: '¿Está seguro de registrar este cliente?',
        header: 'Confirmación de Registro',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.registrarCliente(); // Llama a la función de registro al aceptar
           
         

        },
        reject: () => {
          console.log('Registro cancelado');
        },
      });
    } else {
      console.log('Formulario no válido');
    }



  }

  onCancel(): void {
    this.ref.close(); // Cierra el diálogo
  }


  registrarCliente(): void {

    console.log('variable', this.form.value);

    const formData = {
      ...this.form.value,
      ruc: this.form.value.ruc?.toString(), // Convierte el RUC a cadena
    };



    this.mantenimientoService.registrarCliente(formData).subscribe(
      (resp) => {
        console.log('Cliente registrado con éxito:', resp);

       // this.messageService.add({ severity: 'success', summary: 'Nuevo Cliente', detail: 'Se ha registrado el nuevo cliente con éxito.' });


        this.ref.close(true); // Cierra el diálogo al completar
      },
      (error) => {
        console.error('Error al registrar cliente:', error);

        this.messageService.add({ severity: 'error', summary: 'Nuevo Cliente', detail: error.error });


      }
    );
  }




}
