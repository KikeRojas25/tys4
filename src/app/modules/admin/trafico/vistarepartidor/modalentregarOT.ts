import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { InputMaskModule } from 'primeng/inputmask';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig, DialogService } from 'primeng/dynamicdialog';
import { CommonModule } from '@angular/common';
import { OrdenTransporteService } from '../../recepcion/ordentransporte/ordentransporte.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { User } from '../trafico.types';

@Component({
  template: `
    <form [formGroup]="form" class="w-full p-6 bg-white rounded-lg shadow-md">
      <!-- Tipo Entrega -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">Tipo Entrega:</label>
        <p-dropdown
          [options]="statuses"
          formControlName="tipoentrega"
          scrollHeight="40vh"
          placeholder="Seleccione un tipo de entrega"
          [style]="{ width: '100%' }">
        </p-dropdown>
        <small
          *ngIf="form.get('tipoentrega')?.invalid && form.get('tipoentrega')?.touched"
          class="text-red-500">
          El tipo de entrega es obligatorio.
        </small>
      </div>

      <!-- Fecha y Hora de Entrega -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Entrega:</label>
          <p-calendar
            formControlName="fechaentrega"
            appendTo="body"
            [style]="{ width: '100%' }"
            baseZIndex="100"
            dateFormat="dd/mm/yy">
          </p-calendar>
          <small
            *ngIf="form.get('fechaentrega')?.invalid && form.get('fechaentrega')?.touched"
            class="text-red-500">
            La fecha de entrega es obligatoria.
          </small>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Hora de Entrega:</label>
          <p-inputMask
            formControlName="horaentrega"
            mask="99:99"
            placeholder="hh:mm">
          </p-inputMask>
          <small
            *ngIf="form.get('horaentrega')?.invalid && form.get('horaentrega')?.touched"
            class="text-red-500">
            Ingrese una hora válida (hh:mm).
          </small>
        </div>
      </div>

      <!-- DNI y Persona Entrega -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">DNI Entrega:</label>
          <input
            pInputText
            formControlName="dnientrega"
            class="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500">
          <small
            *ngIf="form.get('dnientrega')?.invalid && form.get('dnientrega')?.touched"
            class="text-red-500">
            El DNI debe contener solo números y al menos 8 caracteres.
          </small>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Persona Entrega:</label>
          <input
            pInputText
            formControlName="personaentrega"
            class="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500">
          <small
            *ngIf="form.get('personaentrega')?.invalid && form.get('personaentrega')?.touched"
            class="text-red-500">
            El nombre de la persona es obligatorio.
          </small>
        </div>
      </div>

      <!-- Cargo Pendiente -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">Cargo Pendiente:</label>
        <p-checkbox formControlName="cargopendiente"  binary="true"></p-checkbox>
      </div>

      <!-- Observación -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">Observación:</label>
        <textarea
          formControlName="observacion_enreparto"
          rows="5"
          cols="30"
          autoResize="true"
          placeholder="Escribe aquí..."
          class="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500">
        </textarea>
      </div>

      <!-- Botón Confirmar Entrega -->
      <div class="mt-6">
        <button
          class="w-full md:w-auto bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded shadow"
          pButton
          [disabled]="form.invalid"
          label="Confirmar Entrega"
          (click)="entregarOT()">
        </button>
      </div>
    </form>
    <p-confirmDialog header="Confirmación" icon="pi pi-exclamation-triangle"></p-confirmDialog>
    <p-toast />
  `,
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DropdownModule,
    InputTextModule,
    ButtonModule,
    InputMaskModule,
    CheckboxModule,
    InputTextareaModule,
    CalendarModule,
    ConfirmDialogModule,
    ToastModule

  ],
  providers: [
    DialogService,
    ConfirmationService,
    MessageService
  ]
})
export class EntregarOtModalComponent implements OnInit {
  form: FormGroup;
  statuses: SelectItem[] = [];
  user: User;

  constructor(
    private fb: FormBuilder,
    private ordenService: OrdenTransporteService,
    public ref: DynamicDialogRef,
    private messageService: MessageService,
    public config: DynamicDialogConfig,
    private confirmationService: ConfirmationService,
  ) {}

  ngOnInit() {
    // Inicializa el formulario reactivo
  
    this.user = JSON.parse(localStorage.getItem('user'));


    this.form = this.fb.group({
      tipoentrega: ['', Validators.required],
      fechaentrega: ['', Validators.required],
      horaentrega: [
        '',
        [
          Validators.required,
          Validators.pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
        ],
      ],
      dnientrega: [
        '',
        [Validators.required, Validators.minLength(8), Validators.pattern(/^\d+$/)],
      ],
      personaentrega: ['', Validators.required],
      cargopendiente: [false],
      observacion_enreparto: [''],
    });

    // Opciones para el dropdown
    this.statuses = [
      { label: 'Entrega Conforme', value: 5 },
      { label: 'Rechazo Parcial', value: 11 },
      { label: 'Rechazo Total', value: 12 },
    ];
  }

  entregarOT() {

    if (this.form.invalid) {
      this.messageService.add({
        severity: 'warn',
        detail: 'Por favor completa todos los campos obligatorios.',
        summary: 'Validación',
      });
      return;
    }

    this.confirmationService.confirm({
      message: '¿Esta seguro que desea confirmar la entrega?',
    accept: () => {
        const entregaData = this.form.value;
        entregaData.idordentrabajo = this.config.data.idorden;
        entregaData.idUsuarioEntrega= this.user.id;
        entregaData.idtipoentrega = entregaData.tipoentrega;

        this.ordenService.confirmar_entrega(entregaData).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              detail: 'Entrega confirmada exitosamente.',
              summary: 'Tráfico',
            });
            this.ref.close();
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              detail: 'Error al confirmar la entrega: ' + err.message,
              summary: 'Error',
            });
          },
        });
      },
      reject: () => {
        this.ref.close();
      }
    });
  }


}
