import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MantenimientoService } from '../../mantenimiento.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css'],
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
  providers: [ConfirmationService, MessageService]
})
export class EditComponent implements OnInit {
  form: FormGroup;
  estacionId: number;
  distritos: SelectItem[] = [];

  constructor(
    private mantenimientoService: MantenimientoService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {
    this.estacionId = this.config.data?.id;
  }

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
    
    if (this.estacionId) {
      this.cargarEstacion();
    }
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

  cargarEstacion(): void {
    this.mantenimientoService.getEstacionById(this.estacionId).subscribe(
      (estacion) => {
        this.form.patchValue({
          estacionOrigen: estacion.estacionOrigen,
          idDistrito: estacion.idDistrito,
          flujoRegular: estacion.flujoRegular || false,
        });
      },
      (error) => {
        console.error('Error al cargar estación:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar los datos de la estación' });
      }
    );
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.confirmationService.confirm({
        message: '¿Está seguro de actualizar esta estación?',
        header: 'Confirmación de Actualización',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.actualizarEstacion();
        },
        reject: () => {
          console.log('Actualización cancelada');
        },
      });
    } else {
      console.log('Formulario no válido');
    }
  }

  onCancel(): void {
    this.ref.close();
  }

  actualizarEstacion(): void {
    const formData = {
      ...this.form.value,
    };

    this.mantenimientoService.actualizarEstacion(this.estacionId, formData).subscribe(
      (resp) => {
        console.log('Estación actualizada con éxito:', resp);
        this.ref.close(true);
      },
      (error) => {
        console.error('Error al actualizar estación:', error);
        this.messageService.add({ severity: 'error', summary: 'Editar Estación', detail: error.error || 'Error al actualizar la estación' });
      }
    );
  }
}

