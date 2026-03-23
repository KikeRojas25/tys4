import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MessageService, SelectItem } from 'primeng/api';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { User } from '../trafico.types';
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
      <small *ngIf="campoInvalido('horaLlegada')" class="text-red-500">Valor inválido</small>
    </div>

    <!-- Hora de atención -->
    <div class="col-6">
      <label for="horaAtencion" class="block text-sm font-medium text-gray-700">Hora de Atención</label>
      <input id="horaAtencion" type="time" pInputText formControlName="horaAtencion" class="w-full"/>
      <small *ngIf="campoInvalido('horaAtencion')" class="text-red-500">Valor inválido</small>
    </div>

    <!-- Hora de salida -->
    <div class="col-6">
      <label for="horaSalida" class="block text-sm font-medium text-gray-700">Hora de Salida</label>
      <input id="horaSalida" type="time" pInputText formControlName="horaSalida" class="w-full"/>
      <small *ngIf="campoInvalido('horaSalida')" class="text-red-500">Valor inválido</small>
    </div>

    <!-- Kilos recogidos -->
    <div class="col-6">
      <label for="kilos" class="block text-sm font-medium text-gray-700">Kilos Recogidos</label>
      <input id="kilos" type="number" pInputText formControlName="kilosRecogidos" class="w-full"/>
      <small *ngIf="campoInvalido('kilosRecogidos')" class="text-red-500">Debe ser mayor o igual a 0</small>
    </div>

    <!-- Bultos recogidos -->
    <div class="col-6">
      <label for="bultos" class="block text-sm font-medium text-gray-700">Bultos Recogidos</label>
      <input id="bultos" type="number" pInputText formControlName="bultosRecogidos" class="w-full"/>
      <small *ngIf="campoInvalido('bultosRecogidos')" class="text-red-500">Debe ser mayor o igual a 0</small>
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
    this.form = this.fb.group(
      {
        idestado: [null],
        horaLlegada: [''],
        horaAtencion: [''],
        horaSalida: [''],
        kilosRecogidos: [null, [Validators.min(0)]],
        bultosRecogidos: [null, [Validators.min(0)]],
      },
      { validators: [this.validacionMinima()] }
    );

    // Estados disponibles
    this.estadosnext = [
      { value: 13, label: 'Confirmar Entrega a Tercero' },
      { value: 39, label: 'Confirmar Recojo' },
      { value: 40, label: 'Recojo cancelado' }
    ];
  }

  campoInvalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && control.touched;
  }

  private validacionMinima(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const fg = control as FormGroup;

      const idestado = fg.get('idestado')?.value;
      const horaLlegada = fg.get('horaLlegada')?.value;
      const horaAtencion = fg.get('horaAtencion')?.value;
      const horaSalida = fg.get('horaSalida')?.value;
      const kilosRecogidos = fg.get('kilosRecogidos')?.value;
      const bultosRecogidos = fg.get('bultosRecogidos')?.value;

      const hasEstado = idestado !== null && idestado !== undefined && idestado !== '';
      const hasHoraLlegada = typeof horaLlegada === 'string' && horaLlegada.trim().length > 0;
      const hasHoraAtencion = typeof horaAtencion === 'string' && horaAtencion.trim().length > 0;
      const hasHoraSalida = typeof horaSalida === 'string' && horaSalida.trim().length > 0;
      const hasKilos = kilosRecogidos !== null && kilosRecogidos !== undefined && kilosRecogidos !== '';
      const hasBultos = bultosRecogidos !== null && bultosRecogidos !== undefined && bultosRecogidos !== '';

      const hasDato = hasHoraLlegada || hasHoraAtencion || hasHoraSalida || hasKilos || hasBultos;

      // Regla especial: Confirmar Recojo (39) requiere al menos un dato (hora/kilos/bultos)
      if (idestado === 39) {
        return hasDato ? null : { missingDataForRecojo: true };
      }

      // Para otros casos: permitir guardar si se selecciona un estado o se ingresa al menos un dato
      return hasEstado || hasDato ? null : { missingData: true };
    };
  }

  cancelar() {
    this.ref.close();
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      const errors = this.form.errors || {};

      if (errors['missingDataForRecojo']) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Tráfico',
          detail: 'Para “Confirmar Recojo”, registre al menos un dato (p.ej. hora de llegada).',
        });
        return;
      }

      if (errors['missingData']) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Tráfico',
          detail: 'Ingrese al menos un dato (p.ej. hora de llegada) o seleccione un estado.',
        });
        return;
      }

      this.messageService.add({ severity: 'warn', summary: 'Tráfico', detail: 'Revise los campos ingresados.' });
      return;
    }

    const payload = this.normalizarPayload();

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

  private normalizarPayload(): any {
    const raw = this.form.value as any;

    const payload: any = {
      IdOrdenTrabajo: this.config.data.ids,
      idusuariocreacion: this.user?.id,
      fechaestado: new Date(this.dateInicio).toISOString(),
    };

    // Estado es opcional: solo enviar si se selecciona
    if (raw.idestado !== null && raw.idestado !== undefined && raw.idestado !== '') {
      payload.idestado = raw.idestado;
    }

    const cleanTime = (v: any): string | null => {
      if (typeof v !== 'string') return null;
      const t = v.trim();
      return t.length ? t : null;
    };

    const cleanNumber = (v: any): number | null => {
      if (v === null || v === undefined || v === '') return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };

    const horaLlegada = cleanTime(raw.horaLlegada);
    const horaAtencion = cleanTime(raw.horaAtencion);
    const horaSalida = cleanTime(raw.horaSalida);
    const kilosRecogidos = cleanNumber(raw.kilosRecogidos);
    const bultosRecogidos = cleanNumber(raw.bultosRecogidos);

    if (horaLlegada !== null) payload.horaLlegada = horaLlegada;
    if (horaAtencion !== null) payload.horaAtencion = horaAtencion;
    if (horaSalida !== null) payload.horaSalida = horaSalida;
    if (kilosRecogidos !== null) payload.kilosRecogidos = kilosRecogidos;
    if (bultosRecogidos !== null) payload.bultosRecogidos = bultosRecogidos;

    return payload;
  }
}
