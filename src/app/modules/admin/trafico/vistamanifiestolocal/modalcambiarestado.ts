import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MessageService, SelectItem } from 'primeng/api';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { OrdenTransporteService } from '../../recepcion/ordentransporte/ordentransporte.service';
import { User } from '../trafico.types';
import { PlanningService } from '../../planning/planning.service';
import { TraficoService } from '../trafico.service';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  template: `
  <form [formGroup]="form" class="col-12 row">

    <!-- Estado -->
    <div class="col-6">
      <h6>Estado:</h6>
      <p-dropdown
        formControlName="idestado"
        [options]="estadosnext"
        appendTo="body"
        placeholder="Selecciona un estado"
        [baseZIndex]="100000"
        [style]="{'width':'70%'}"
        [hideTransitionOptions]="'0ms'"
        [showTransitionOptions]="'0ms'">
      </p-dropdown>
    </div>

    <!-- Hora de llegada -->
    <div class="col-6">
      <label for="horaLlegada" class="block text-sm font-medium text-gray-700">Hora de Llegada</label>
      <input id="horaLlegada" type="time" pInputText formControlName="horaLlegada" class="w-full"/>
      <small *ngIf="campoInvalido('horaLlegada')" class="text-red-500">Campo obligatorio</small>
    </div>

    <!-- Hora de atención -->
    <div class="col-6">
      <label for="horaAtencion" class="block text-sm font-medium text-gray-700">Hora de Atención</label>
      <input id="horaAtencion" type="time" pInputText formControlName="horaAtencion" class="w-full"/>
      <small *ngIf="campoInvalido('horaAtencion')" class="text-red-500">Campo obligatorio</small>
    </div>

    <!-- Hora de salida -->
    <div class="col-6">
      <label for="horaSalida" class="block text-sm font-medium text-gray-700">Hora de Salida</label>
      <input id="horaSalida" type="time" pInputText formControlName="horaSalida" class="w-full"/>
      <small *ngIf="campoInvalido('horaSalida')" class="text-red-500">Campo obligatorio</small>
    </div>

    <!-- Kilos recogidos -->
    <div class="col-6">
      <label for="kilos" class="block text-sm font-medium text-gray-700">Kilos Recogidos</label>
      <input id="kilos" type="number" pInputText formControlName="kilosRecogidos" class="w-full"/>
      <small *ngIf="campoInvalido('kilosRecogidos')" class="text-red-500">Campo obligatorio</small>
    </div>

    <!-- Bultos recogidos -->
    <div class="col-6">
      <label for="bultos" class="block text-sm font-medium text-gray-700">Bultos Recogidos</label>
      <input id="bultos" type="number" pInputText formControlName="bultosRecogidos" class="w-full"/>
      <small *ngIf="campoInvalido('bultosRecogidos')" class="text-red-500">Campo obligatorio</small>
    </div>

    <!-- Botones -->
    <div class="col-md-4 mt-4 offset-3">
      <button class="btn-danger btn btn-xs" pButton iconPos="left" label="Guardar" icon="fa fa-save"
              type="button" (click)="guardar()"></button>
      <button class="btn-primary btn btn-xs" pButton label="Cancelar" type="button" (click)="cancelar()"></button>
    </div>

  </form>
  `,
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DropdownModule,
    CalendarModule,
    ToastModule,
    InputTextModule
  ]
})
export class CambiarEstadoModalLocalComponent implements OnInit {
  
  form!: FormGroup;
  estadosnext: SelectItem[] = [];
  user!: User;
  dateInicio: Date = new Date(Date.now());
  
  constructor(
    private fb: FormBuilder,
    private traficoService: TraficoService,
    private messageService: MessageService,
    private ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {}

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('user') || '{}');

    console.log(this.config.data.ids);

    // Inicializa el formulario reactivo
    this.form = this.fb.group({
      idestado: [null, Validators.required],
      horaLlegada: [''],
      horaAtencion: [''],
      horaSalida: [''],
      kilosRecogidos: [''],
      bultosRecogidos: ['']
    });

    // Estados disponibles
    this.estadosnext = [
      { value: 13, label: 'Confirmar Entrega a Tercero' },
      { value: 39, label: 'Confirmar Recojo' },
      { value: 40, label: 'Recojo cancelado' }
    ];

    // 🔁 Reacciona al cambio de estado
    this.form.get('idestado')?.valueChanges.subscribe((value) => {
      if (value === 39) {
        // Confirmar Recojo → campos obligatorios
        this.form.get('horaLlegada')?.setValidators([Validators.required]);
        this.form.get('horaAtencion')?.setValidators([Validators.required]);
        this.form.get('horaSalida')?.setValidators([Validators.required]);
        this.form.get('kilosRecogidos')?.setValidators([Validators.required, Validators.min(1)]);
        this.form.get('bultosRecogidos')?.setValidators([Validators.required, Validators.min(1)]);
      } else {
        // Otros estados → limpia validadores
        this.form.get('horaLlegada')?.clearValidators();
        this.form.get('horaAtencion')?.clearValidators();
        this.form.get('horaSalida')?.clearValidators();
        this.form.get('kilosRecogidos')?.clearValidators();
        this.form.get('bultosRecogidos')?.clearValidators();
      }

      this.form.get('horaLlegada')?.updateValueAndValidity();
      this.form.get('horaAtencion')?.updateValueAndValidity();
      this.form.get('horaSalida')?.updateValueAndValidity();
      this.form.get('kilosRecogidos')?.updateValueAndValidity();
      this.form.get('bultosRecogidos')?.updateValueAndValidity();
    });
  }

  campoInvalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && control.touched;
  }

  cancelar() {
    this.ref.close();
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messageService.add({ severity: 'warn', summary: 'Tráfico', detail: 'Complete los campos obligatorios.' });
      return;
    }

    const payload = {
      ...this.form.value,
      IdOrdenTrabajo: this.config.data.ids,
      idusuariocreacion: this.user?.id,
      fechaestado: new Date(this.dateInicio).toISOString()
    };

    console.log('📤 Enviando al backend:', payload);

    this.traficoService.actualizarOrdenRecojo(payload).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Tráfico',
          detail: 'Se ha realizado el cambio de estado correctamente'
        });
        this.ref.close(true);
      },
      error: (err) => {
        console.error('❌ Error al guardar:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Ocurrió un problema al guardar los datos'
        });
      }
    });
  }
}
