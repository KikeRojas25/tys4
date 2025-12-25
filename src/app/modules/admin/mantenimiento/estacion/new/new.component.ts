import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
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
    ConfirmDialogModule,
    ToastModule,
    DropdownModule,
    CheckboxModule
  ],
  providers: [DialogService, ConfirmationService, MessageService]
})
export class NewComponent implements OnInit {
  form: FormGroup;
  distritos: SelectItem[] = [];

  constructor(
    private mantenimientoService: MantenimientoService,
    public ref: DynamicDialogRef,
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      estacionOrigen: [
        '',
        [Validators.required, Validators.minLength(3), Validators.maxLength(100)]
      ],
      idDistrito: [
        null,
        [Validators.required]
      ],
      flujoRegular: [
        false
      ],
    });

    this.cargarDistritos();
  }

  cargarDistritos(): void {
    this.mantenimientoService.getUbigeo('').subscribe({
      next: (resp) => {
        this.distritos = resp.map(element => ({
          value: element.idDistrito,
          label: element.ubigeo
        }));
      },
      error: (err) => {
        console.error('Error al cargar distritos:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.confirmationService.confirm({
        message: '¿Está seguro de registrar esta estación?',
        header: 'Confirmación de Registro',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.registrarEstacion();
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
    this.ref.close();
  }

  registrarEstacion(): void {
    console.log('variable', this.form.value);

    const formData = {
      ...this.form.value,
    };

    this.mantenimientoService.registrarEstacion(formData).subscribe(
      (resp) => {
        console.log('Estación registrada con éxito:', resp);
        this.ref.close(true);
      },
      (error) => {
        console.error('Error al registrar estación:', error);
        this.messageService.add({ severity: 'error', summary: 'Nueva Estación', detail: error.error || 'Error al registrar la estación' });
      }
    );
  }
}

