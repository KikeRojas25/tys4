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
import { UploadModalComponent } from '../../recepcion/ordentransporte/seguimientoot/modal.upload';
import { FileModalComponent } from '../../recepcion/ordentransporte/seguimientoot/modalfiles';

@Component({
  template: `
    <form [formGroup]="form" class="w-full p-6 bg-white rounded-lg shadow-md">
      <div *ngIf="numcp" class="mb-4 text-sm text-gray-600">
        OT: <span class="font-semibold">{{ numcp }}</span>
      </div>

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

      <!-- Subestado / Incidencia (dependiente de Tipo Entrega) -->
      <div class="mb-4" *ngIf="showSubestado">
        <label class="block text-sm font-medium text-gray-700 mb-1">Subestado / Incidencia:</label>
        <p-dropdown
          [options]="getSubestados(form.get('tipoentrega')?.value)"
          formControlName="subestado"
          placeholder="Seleccione subestado"
          optionLabel="label"
          optionValue="value"
          scrollHeight="40vh"
          [style]="{ width: '100%' }">
        </p-dropdown>
        <small
          *ngIf="form.get('subestado')?.invalid && form.get('subestado')?.touched"
          class="text-red-500">
          Debe seleccionar un subestado para este tipo de entrega.
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

      <!-- Botón Confirmar Entrega -->
      <div class="mt-6">
        <div class="flex flex-col md:flex-row gap-2 md:items-center">
          <button
            class="w-full md:w-auto bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded shadow"
            pButton
            [disabled]="form.invalid"
            label="Confirmar Entrega"
            (click)="entregarOT()">
          </button>

          <button
            type="button"
            class="w-full md:w-auto"
            pButton
            icon="pi pi-upload"
            label="Subir fotos"
            (click)="subirFotos()">
          </button>

          <button
            type="button"
            class="w-full md:w-auto"
            pButton
            icon="pi pi-images"
            label="Ver fotos"
            (click)="verFotos()">
          </button>
        </div>
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
  numcp?: string;

  showSubestado = false;
  subestadosPorTipo: { [key: string]: any[] } = {};

  constructor(
    private fb: FormBuilder,
    private ordenService: OrdenTransporteService,
    public ref: DynamicDialogRef,
    private messageService: MessageService,
    public config: DynamicDialogConfig,
    private confirmationService: ConfirmationService,
    private dialogService: DialogService,
  ) {}

  ngOnInit() {
    // Inicializa el formulario reactivo
  
    this.user = JSON.parse(localStorage.getItem('user'));
    this.numcp = this.config?.data?.numcp;


    this.form = this.fb.group({
      tipoentrega: ['', Validators.required],
      subestado: [''],
      fechaentrega: ['', Validators.required],
      horaentrega: [
        '',
        [
          Validators.required,
          Validators.pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
        ],
      ],
    });

    // Opciones para el dropdown
    this.statuses = [
      { label: 'Entrega Perfecta', value: 'Entrega Perfecta' },
      { label: 'Entrega Sin Cargo', value: 'Entrega Sin Cargo' },
      { label: 'Rechazo Parcial', value: 'Rechazo Parcial' },
      { label: 'No Entrega', value: 'No Entrega' },
    ];

    // Subestados por tipo (mismo set que confirmarentregas)
    this.subestadosPorTipo = {
      'Entrega Perfecta': [{ label: 'Entrega Perfecta', value: 'Entrega Perfecta' }],
      'Entrega Sin Cargo': [{ label: 'Entrega Perfecta', value: 'Entrega Perfecta' }],
      'Rechazo Parcial': [
        { label: 'Mercadería parcial faltante', value: 'Parcial_Faltante' },
        { label: 'Mercadería parcial dañada', value: 'Parcial_Danada' },
        { label: 'Cliente no quiere recibir total pedido', value: 'Cliente_No_Recibe_Total' }
      ],
      'No Entrega': [
        { label: 'Dirección no existente', value: 'Direccion_No_Existe' },
        { label: 'Local cerrado', value: 'Local_Cerrado' },
        { label: 'Cliente rechazó total del pedido', value: 'Cliente_Rechazo_Total' }
      ]
    };

    // Validación dinámica de subestado según el tipo
    this.form.get('tipoentrega')?.valueChanges.subscribe((tipo: string) => {
      const requiereSubestado = this.tipoRequiereSubestado(tipo);
      this.showSubestado = requiereSubestado;

      const subCtrl = this.form.get('subestado');
      if (!subCtrl) return;

      if (requiereSubestado) {
        subCtrl.setValidators([Validators.required]);
      } else {
        subCtrl.clearValidators();
        subCtrl.setValue('');
      }
      subCtrl.updateValueAndValidity({ emitEvent: false });
    });
  }

  tipoRequiereSubestado(tipo: string): boolean {
    return tipo === 'Rechazo Parcial' || tipo === 'No Entrega';
  }

  getSubestados(tipoEntrega: string): any[] {
    return this.subestadosPorTipo[tipoEntrega] || [];
  }

  getIdSubestado(subestado: string): number {
    switch (subestado) {
      case 'Parcial_Faltante':
        return 1;
      case 'Parcial_Danada':
        return 2;
      case 'Cliente_No_Recibe_Total':
        return 3;
      case 'Direccion_No_Existe':
        return 1;
      case 'Local_Cerrado':
        return 2;
      case 'Cliente_Rechazo_Total':
        return 3;
      default:
        return 0;
    }
  }

  getIdTipoEntrega(tipoentrega: string): number {
    if (tipoentrega === 'Entrega Perfecta') return 5;
    if (tipoentrega === 'Entrega Sin Cargo') return 5;
    if (tipoentrega === 'Rechazo Parcial') return 11;
    if (tipoentrega === 'No Entrega') return 10;
    return 0;
  }

  subirFotos(): void {
    const idorden = this.config?.data?.idorden;
    if (!idorden) return;

    this.dialogService.open(UploadModalComponent, {
      header: 'Cargar Fotos',
      width: '70%',
      data: { id: idorden },
    });
  }

  verFotos(): void {
    const idorden = this.config?.data?.idorden;
    if (!idorden) return;

    this.dialogService.open(FileModalComponent, {
      header: 'Visor Fotos',
      width: '30%',
      data: { id: idorden },
    });
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

        // Campos base
        entregaData.idordentrabajo = this.config.data.idorden;
        entregaData.idusuarioentrega = this.user.id;
        // compat (por si algún endpoint/DTO espera esta variante)
        entregaData.idUsuarioEntrega = this.user.id;

        // Mapeos según pantalla confirmarentregas
        entregaData.idtipoentrega = this.getIdTipoEntrega(entregaData.tipoentrega);
        entregaData.IncidenciaEntregaId = this.getIdSubestado(entregaData.subestado);

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
              detail: 'Error al confirmar la entrega: ' + (err?.error || err?.message || 'No se pudo confirmar.'),
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
