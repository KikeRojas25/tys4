import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MessageService, SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { UsersBotService } from '../usersbot.service';
import { PERFIL_LABELS, UserBot } from '../usersbot.types';

@Component({
  selector: 'app-usersbot-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    ButtonModule,
    DropdownModule,
    InputTextModule,
    ToastModule
  ]
})
export class UsersBotEditComponent implements OnInit {
  form: FormGroup;
  esEdicion = false;
  loading = false;
  perfiles: SelectItem[] = [
    { value: 4, label: PERFIL_LABELS[4] },
    { value: 6, label: PERFIL_LABELS[6] }
  ];

  constructor(
    private fb: FormBuilder,
    private service: UsersBotService,
    private messageService: MessageService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {
    this.form = this.fb.group({
      id: [null],
      dni: [null],
      nombre: [null, [Validators.required, Validators.maxLength(100)]],
      apellido: [null, [Validators.required, Validators.maxLength(100)]],
      telefono: ['+51', [Validators.required, Validators.pattern(/^\+51\d{9}$/)]],
      idperfil: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    const data = this.config.data?.userBot as UserBot | undefined;
    if (data?.id) {
      this.esEdicion = true;
      this.form.patchValue({
        id: data.id,
        dni: data.dni,
        nombre: data.nombre,
        apellido: data.apellido,
        telefono: data.telefono || '+51',
        idperfil: data.idperfil
      });
    }
  }

  onTelefonoInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // Asegurar que siempre empiece con +51
    if (!value.startsWith('+51')) {
      // Si el usuario borró el prefijo, lo reponemos conservando solo dígitos
      const digitsOnly = value.replace(/\D/g, '');
      value = '+51' + digitsOnly.slice(0, 9);
    } else {
      // Mantener +51 y limitar el resto a 9 dígitos
      const rest = value.substring(3).replace(/\D/g, '').slice(0, 9);
      value = '+51' + rest;
    }

    if (input.value !== value) {
      input.value = value;
    }
    this.form.patchValue({ telefono: value }, { emitEvent: false });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Complete los campos obligatorios.'
      });
      return;
    }

    this.loading = true;
    const value = this.form.value as UserBot;

    const obs = this.esEdicion && value.id
      ? this.service.update(value.id, value)
      : this.service.create(value);

    obs.subscribe({
      next: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: this.esEdicion ? 'Usuario actualizado.' : 'Usuario creado.'
        });
        this.ref.close(true);
      },
      error: (err) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message || 'No se pudo guardar el usuario.'
        });
      }
    });
  }

  cancelar(): void {
    this.ref.close(null);
  }
}
