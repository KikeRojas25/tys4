import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToastModule } from 'primeng/toast';

import { SeguridadService } from '../seguridad.service';
import { MantenimientoService } from '../../mantenimiento/mantenimiento.service';

@Component({
  selector: 'app-edituser',
  templateUrl: './edituser.component.html',
  styleUrls: ['./edituser.component.css'],
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
    ToastModule,
  ],
  providers: [MessageService, ConfirmationService],
})
export class EdituserComponent implements OnInit {
  userForm: FormGroup;
  listClientes: SelectItem[] = [];
  userId: number;
  usernameDisplay = '';
  guardando = false;

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private seguridadService: SeguridadService,
    private mantenimientoService: MantenimientoService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.userId = +this.activatedRoute.snapshot.params['uid'];

    this.userForm = this.fb.group({
      nombres:     ['', [Validators.required, Validators.maxLength(50)]],
      apellidos:   ['', [Validators.required, Validators.maxLength(50)]],
      email:       ['', [Validators.required, Validators.email]],
      clientesIds: [[]],
    });

    this.mantenimientoService.getAllClientes('', 2, true).subscribe({
      next: (clientes) => {
        this.listClientes = clientes.map(c => ({ label: c.razonSocial, value: c.idCliente }));
        this.cargarUsuario();
      },
    });
  }

  private cargarUsuario() {
    this.seguridadService.getUser(this.userId).subscribe({
      next: (user) => {
        this.usernameDisplay = user.usr_str_red ?? '';
        this.userForm.patchValue({
          nombres:     user.usr_str_nombre ?? '',
          apellidos:   user.usr_str_apellidos ?? '',
          email:       user.usr_str_email ?? '',
          clientesIds: this.parsearClientesIds(user.idclientes),
        });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el usuario.', life: 4000 });
      },
    });
  }

  private parsearClientesIds(idclientes: string | null | undefined): number[] {
    if (!idclientes) return [];
    return idclientes.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n) && n > 0);
  }

  onSubmit() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.confirmationService.confirm({
      message: '¿Está seguro que desea actualizar al usuario?',
      header: 'Confirmar Actualización',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Guardar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.guardando = true;
        const v = this.userForm.value;

        const dto = {
          userId:      this.userId,
          nombres:     v.nombres,
          apellidos:   v.apellidos,
          email:       v.email,
          clientesIds: (v.clientesIds as number[]).map(String),
        };

        this.seguridadService.actualizarUsuario(dto).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario actualizado correctamente.', life: 3000 });
            setTimeout(() => this.router.navigate(['/seguridad/listausuarios']), 1500);
          },
          error: (err) => {
            this.guardando = false;
            const msg = err?.error?.message || 'Ocurrió un error al actualizar el usuario.';
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
