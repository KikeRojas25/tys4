import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';

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
    InputNumberModule,
    CheckboxModule,
    DropdownModule,
    MessageModule,
    ToastModule,
  ],
  providers: [DialogService, MessageService],
})
export class EditComponent implements OnInit {
  form: FormGroup;
  guardando = false;
  clienteId: number;

  monedas = [
    { label: 'Soles (PEN)', value: 1 },
    { label: 'Dólares (USD)', value: 2 },
  ];

  constructor(
    private fb: FormBuilder,
    private mantenimientoService: MantenimientoService,
    public ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.clienteId = this.config.data?.id;

    this.form = this.fb.group({
      razon_social:  ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
      ruc:           ['', [Validators.required, Validators.minLength(8), Validators.maxLength(11)]],
      nombrecorto:   ['', Validators.maxLength(50)],
      lineacredito:  [null],
      idmonedalinea: [1],
      pagocontado:          [false],
      activo:               [true],
      tieneventasultimoano: [false],
    });

    this.cargarCliente();
  }

  private cargarCliente(): void {
    this.mantenimientoService.getClienteById(this.clienteId).subscribe({
      next: (c) => {
        this.form.patchValue({
          razon_social:  c.razonSocial ?? c.RazonSocial ?? '',
          ruc:           c.ruc ?? c.Ruc ?? '',
          nombrecorto:   c.nombreCorto ?? c.NombreCorto ?? '',
          lineacredito:  c.lineaCredito ?? c.LineaCredito ?? null,
          idmonedalinea: c.idMonedaLinea ?? c.IdMonedaLinea ?? 1,
          pagocontado:          c.pagoContado ?? c.PagoContado ?? false,
          activo:               c.activo ?? c.Activo ?? true,
          tieneventasultimoano: c.tieneVentasUltimoAno ?? c.TieneVentasUltimoAno ?? false,
        });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el cliente.', life: 4000 });
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardando = true;
    const payload = { id: this.clienteId, ...this.form.value };

    this.mantenimientoService.updateCliente(payload).subscribe({
      next: () => this.ref.close(true),
      error: (err) => {
        this.guardando = false;
        const msg = typeof err.error === 'string' ? err.error : (err.error?.message || 'Error al actualizar el cliente.');
        this.messageService.add({ severity: 'error', summary: 'Error', detail: msg, life: 4000 });
      },
    });
  }

  onCancel(): void {
    this.ref.close();
  }
}
