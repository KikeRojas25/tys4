import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { MultiSelectModule } from 'primeng/multiselect';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';

import { SeguridadService } from '../seguridad.service';
import { MantenimientoService } from '../../mantenimiento/mantenimiento.service';

@Component({
  selector: 'app-newuser',
  templateUrl: './newuser.component.html',
  styleUrls: ['./newuser.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    CardModule,
    MessageModule,
    MatIcon,
    RouterModule,
    MultiSelectModule,
    ConfirmDialogModule,
    PasswordModule,
    ToastModule,
  ],
  providers: [MessageService, ConfirmationService],
})
export class NewuserComponent implements OnInit {
  userForm: FormGroup;
  listClientes: SelectItem[] = [];
  guardando = false;

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private seguridadService: SeguridadService,
    private mantenimientoService: MantenimientoService,
    private router: Router
  ) {}

  ngOnInit() {
    this.userForm = this.fb.group({
      username:  ['', [Validators.required, Validators.maxLength(12)]],
      nombres:   ['', [Validators.required, Validators.maxLength(50)]],
      apellidos: ['', [Validators.required, Validators.maxLength(50)]],
      email:     ['', [Validators.required, Validators.email]],
      password:  ['', [Validators.required, Validators.minLength(6)]],
      clientesIds: [[]],
    });

    this.mantenimientoService.getAllClientes('', 2, true).subscribe({
      next: (clientes) => {
        this.listClientes = clientes.map(c => ({ label: c.razonSocial, value: c.idCliente }));
      },
    });
  }

  onSubmit() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.confirmationService.confirm({
      message: '¿Está seguro que desea guardar el nuevo usuario?',
      header: 'Confirmar Guardado',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Guardar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.guardando = true;
        const v = this.userForm.value;

        const dto = {
          username:    v.username,
          nombres:     v.nombres,
          apellidos:   v.apellidos,
          email:       v.email,
          password:    v.password,
          clientesIds: (v.clientesIds as number[]).map(String),
        };

        this.seguridadService.registrarUsuario(dto).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario registrado correctamente.', life: 3000 });
            setTimeout(() => this.router.navigate(['/seguridad/listausuarios']), 1500);
          },
          error: (err) => {
            this.guardando = false;
            const msg = err?.error?.message || 'Ocurrió un error al registrar el usuario.';
            this.messageService.add({ severity: 'error', summary: 'Error', detail: msg, life: 4000 });
          },
        });
      },
    });
  }

  onCancel() {
    this.router.navigate(['/seguridad/listausuarios']);
  }
}
