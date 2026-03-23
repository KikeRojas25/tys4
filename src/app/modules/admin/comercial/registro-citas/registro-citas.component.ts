import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MessageService, SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ComercialService } from '../comercial.service';
import { MantenimientoService } from '../../mantenimiento/mantenimiento.service';
import { TipoRegistro, OTPendiente } from './registro-citas.types';

@Component({
  selector: 'app-registro-citas',
  templateUrl: './registro-citas.component.html',
  styleUrls: ['./registro-citas.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    DropdownModule,
    CalendarModule,
    InputTextareaModule,
    ButtonModule,
    CardModule,
    TableModule,
    ToastModule,
  ],
  providers: [MessageService],
})
export class RegistroCitasComponent implements OnInit {
  form: FormGroup;
  clientes: SelectItem[] = [];
  otsPendientes: OTPendiente[] = [];
  selectedOT: OTPendiente | null = null;
  loadingOTs = false;
  loading = false;
  tipos: { id: TipoRegistro; label: string; icon: string; desc: string }[] = [
    { id: 'cita', label: 'Cita', icon: 'heroicons_solid:calendar', desc: 'Agendar cita para OT' },
    { id: 'reclamo', label: 'Reclamo', icon: 'heroicons_solid:exclamation-triangle', desc: 'Registrar reclamo' },
    { id: 'consulta', label: 'Consulta', icon: 'heroicons_solid:chat-bubble-left-right', desc: 'Registrar consulta' },
    { id: 'recojo', label: 'Recojo', icon: 'heroicons_solid:truck', desc: 'Registrar recojo' },
  ];

  tiposReclamo: { id: string; label: string }[] = [
    { id: 'retraso', label: 'Retraso en entrega' },
    { id: 'danio', label: 'Mercadería dañada' },
    { id: 'faltante', label: 'Pedido incompleto / Faltante' },
    { id: 'lugar_incorrecto', label: 'Entrega en lugar incorrecto' },
    { id: 'facturacion', label: 'Reclamo por facturación' },
  ];

  constructor(
    private fb: FormBuilder,
    private comercialService: ComercialService,
    private mantenimientoService: MantenimientoService,
    private messageService: MessageService
  ) {
    this.form = this.fb.group({
      idCliente: [null, Validators.required],
      tipo: [null as TipoRegistro | null, Validators.required],
      idOT: [null],
      fechaCita: [null],
      horaCita: [null],
      tipoReclamo: [null],
      observaciones: [null],
    });
  }

  ngOnInit(): void {
    this.cargarClientes();
    this.form.get('idCliente')?.valueChanges.subscribe((id) => {
      this.form.patchValue({ tipo: null, idOT: null, fechaCita: null, horaCita: null });
      this.selectedOT = null;
      this.otsPendientes = [];
      if (id) this.cargarOTsPendientes(id);
    });
    this.form.get('tipo')?.valueChanges.subscribe((tipo) => {
      this.form.patchValue({ idOT: null, fechaCita: null, horaCita: null, tipoReclamo: null });
      this.selectedOT = null;
      if (tipo === 'cita') {
        const id = this.form.value.idCliente;
        if (id) this.cargarOTsPendientes(id);
      }
    });
  }

  cargarClientes(): void {
    this.mantenimientoService.getAllClientes('', 2, true).subscribe({
      next: (clientes) => {
        this.clientes = clientes.map((c) => ({
          value: c.idCliente,
          label: c.razonSocial ?? '',
        }));
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los clientes',
        });
      },
    });
  }

  cargarOTsPendientes(idcliente: number): void {
    this.loadingOTs = true;
    this.selectedOT = null;
    this.comercialService.getOTsPendientesPorCliente(idcliente).subscribe({
      next: (list) => {
        this.otsPendientes = list ?? [];
        this.loadingOTs = false;
      },
      error: () => {
        this.otsPendientes = [];
        this.loadingOTs = false;
      },
    });
  }

  get tipoSeleccionado(): TipoRegistro | null {
    return this.form.get('tipo')?.value;
  }

  get esCita(): boolean {
    return this.tipoSeleccionado === 'cita';
  }

  get esReclamo(): boolean {
    return this.tipoSeleccionado === 'reclamo';
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Complete los campos requeridos',
      });
      return;
    }
    if (this.esCita && (!this.form.value.idOT || !this.form.value.fechaCita || !this.form.value.horaCita)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Para una cita debe seleccionar OT, fecha y hora',
      });
      return;
    }

    this.loading = true;
    // Simular guardado
    setTimeout(() => {
      this.loading = false;
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: `Registro guardado correctamente (${this.tipoSeleccionado})`,
      });
      this.form.reset({ idCliente: null, tipo: null, idOT: null, fechaCita: null, horaCita: null, tipoReclamo: null, observaciones: null });
      this.selectedOT = null;
      this.otsPendientes = [];
    }, 800);
  }

  onOTSelect(event: { data: OTPendiente }): void {
    this.form.patchValue({ idOT: event.data.numcp });
  }

  onOTUnselect(): void {
    this.form.patchValue({ idOT: null });
  }
}
