import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
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
    InputNumberModule,
    CheckboxModule,
    DropdownModule,
    MessageModule,
    ToastModule,
  ],
  providers: [DialogService, MessageService],
})
export class NewComponent implements OnInit {
  form: FormGroup;
  guardando = false;

  monedas = [
    { label: 'Soles (PEN)', value: 1 },
    { label: 'Dólares (USD)', value: 2 },
  ];

  constructor(
    private fb: FormBuilder,
    private mantenimientoService: MantenimientoService,
    public ref: DynamicDialogRef,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      razon_social:  ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
      ruc:           ['', [Validators.required, Validators.minLength(8), Validators.maxLength(11)]],
      nombrecorto:   ['', Validators.maxLength(50)],
      lineacredito:  [null],
      idmonedalinea: [1],
      pagocontado:          [false],
      activo:               [true],
      tieneventasultimoano: [true],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardando = true;
    this.mantenimientoService.registrarCliente(this.form.value).subscribe({
      next: () => this.ref.close(true),
      error: (err) => {
        this.guardando = false;
        const msg = typeof err.error === 'string' ? err.error : (err.error?.message || 'Error al registrar el cliente.');
        this.messageService.add({ severity: 'error', summary: 'Error', detail: msg, life: 4000 });
      },
    });
  }

  onCancel(): void {
    this.ref.close();
  }
}
