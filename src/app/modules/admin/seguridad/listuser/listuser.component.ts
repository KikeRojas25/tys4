import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { ChipsModule } from 'primeng/chips';
import { User } from 'app/core/user/user.types';
import { TableModule } from 'primeng/table';
import { SeguridadService } from '../seguridad.service';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { PickListModule } from 'primeng/picklist';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';

import { MantenimientoService } from '../../mantenimiento/mantenimiento.service';
import { UserForUpdateDto } from 'app/core/user/user.types';

@Component({
  selector: 'app-listuser',
  templateUrl: './listuser.component.html',
  styleUrls: ['./listuser.component.css'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatIcon,
    RouterModule,
    TableModule,
    ButtonModule,
    ChipModule  ,
    ConfirmDialogModule,
    InputTextModule,
    ToastModule,
    PickListModule,
    DialogModule,
    DropdownModule,
    MultiSelectModule
  ],
  providers: [
    DialogService,
    ConfirmationService,
    MessageService
  ]
})
export class ListuserComponent implements OnInit {

  model: any = {};
  users: User[]  = null; // Variable para almacenar el usuario
  displayDialog: boolean = false; // Para controlar el popup
  filteredUsers: any[];


  roles: any[] = []; // Lista de roles
  selectedRoles: any[] = []; // Roles seleccionados

  dialogAsignarVisible = false;
  usuarioSeleccionado: any = null;

  dialogClientesVisible = false;
  usuarioParaClientes: User | null = null;
  clientesParaSelect: SelectItem[] = [];
  clientesSeleccionados: number[] = [];

  listaEquipos = [
  { id: null, nombre: 'Sin equipo asignado' },
  { id: 21490, nombre: 'Operador 1' },
  { id: 21491, nombre: 'Operador 2' },
  { id: 21492, nombre: 'Operador 3' },
  { id: 24275, nombre: 'Operador 4' },
  { id: 24282, nombre: 'Supervisor' },
  { id: 28158, nombre: 'Operador 5' },
];



  constructor(
    private userService: SeguridadService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private mantenimientoService: MantenimientoService
  ) {}

  ngOnInit() {

  this.buscar();
      
  }

  buscar() {
    // Llama al método get() del servicio y suscríbete al observable
    this.userService.get( this.model.param ).subscribe((users: User[]) => {
      // Asigna los usuarios al array
      this.users = users;

      console.log('Usuarios cargados:', this.users);
  
      // Si no hay ningún valor en 'this.model.param', mostramos todos los usuarios
      if (!this.model.param || this.model.param.trim() === '') {
        this.filteredUsers = this.users; // Muestra todos los usuarios sin filtrar
      } else {
        // Aplica el filtro basado en el parámetro 'param' del modelo
        this.filteredUsers = this.users.filter(user =>
          user.usr_str_nombre.toLowerCase().includes(this.model.param.toLowerCase())
        );
      }
  
      // Muestra los usuarios (filtrados o no) en la consola
      console.log(this.filteredUsers);
    });
  }




  
getNombreEquipo(id: number): string {
  const mapaEquipos: { [key: number]: string } = {
    21490: 'Operador 1',
    21491: 'Operador 2',
    21492: 'Operador 3',
    24275: 'Operador 4',
    24282: 'Supervisor',
    28158: 'Operador 5'
  };
  return mapaEquipos[id] || 'Sin asignar';
}

  nuevo() {
    this.router.navigate(['/seguridad/newusuario']  );
  }
  editarUsuario(id:any) {
    this.router.navigate(['/seguridad/editusuario' , id ]  );
  }
  eliminarUsuario(id: any) {

    this.model.id = id;
    this.model.EstadoId = 2; // bloquearlo

  this.confirmationService.confirm({
    acceptLabel: 'Eliminar',                   // Texto del botón "Aceptar"
    rejectLabel: 'Cancelar',                  // Texto del botón "Rechazar"
    acceptIcon: 'pi pi-check',                // Icono del botón "Aceptar"
    rejectIcon: 'pi pi-times',                // Icono del botón "Rechazar"
    message: '¿Está seguro que desea eliminar al usuario?',
    header: 'Confirmar Eliminación',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {

      this.userService.updateUserStatus(this.model).subscribe(x=> {
        this.messageService.add({ severity: 'success', summary: 'Eliminación exitosa', detail: `Se ha eliminado correctamente al usuario` });

        this.buscar();
        


      })

    } ,
    reject: () => {
    }
  });




  }

guardarCambioEquipo() {
  if (!this.usuarioSeleccionado) return;

  const userId = this.usuarioSeleccionado.usr_int_id;
  const idEquipo = this.usuarioSeleccionado.idequipo;

  // 🔹 Llamada al backend para actualizar el equipo
  this.userService.updateEquipo(userId, idEquipo).subscribe({
    next: (res) => {
      // ✅ Actualizar en memoria la lista local
      const index = this.users.findIndex(u => u.usr_int_id === userId);
      if (index >= 0) {
        this.users[index].idequipo = idEquipo;
      }

      // ✅ Mensaje visual de éxito
      this.messageService.add({
        severity: 'success',
        summary: 'Equipo actualizado',
        detail: res.message || `El usuario ${this.users[index]?.usr_str_nombre || ''} fue asignado al nuevo equipo.`,
        life: 3000
      });

      // ✅ Cierra el modal
      this.dialogAsignarVisible = false;
    },
    error: (err) => {
      console.error('Error al actualizar equipo:', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo actualizar el equipo. Intenta nuevamente.',
        life: 3000
      });
    }
  });
}

  verRolesUsuario(id: any) {

    const usuario = this.users.find(u => u.usr_int_id === id);
    if (usuario) {
      this.usuarioSeleccionado = { ...usuario }; // copia para edición
      this.dialogAsignarVisible = true;
    }
  }

  saveRoles() {
    
  }

  abrirModalClientes(usuario: User) {
    this.usuarioParaClientes = usuario;
    this.clientesSeleccionados = this.parsearIdClientes(usuario.idclientes);
    this.mantenimientoService.getAllClientes('', 2, true).subscribe({
      next: (clientes) => {
        this.clientesParaSelect = clientes.map(c => ({
          value: c.idCliente,
          label: c.razonSocial
        }));
        this.dialogClientesVisible = true;
      },
      error: (err) => {
        console.error('Error al cargar clientes:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los clientes',
          life: 3000
        });
      }
    });
  }

  private parsearIdClientes(idclientes: string | null | undefined): number[] {
    if (idclientes == null || idclientes === '') {
      return [];
    }
    return idclientes
      .split(',')
      .map(s => Number(s.trim()))
      .filter(n => !isNaN(n) && n > 0);
  }

  guardarClientesUsuario() {
    if (!this.usuarioParaClientes) return;

    const payload: UserForUpdateDto = {
      Id: this.usuarioParaClientes.usr_int_id,
      Nombres: this.usuarioParaClientes.usr_str_nombre ?? '',
      Apellidos: this.usuarioParaClientes.usr_str_apellidos ?? '',
      Email: this.usuarioParaClientes.email ?? '',
      clientesids: this.clientesSeleccionados.map(id => String(id))
    };

    this.userService.updateUser(payload as any).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Clientes actualizados',
          detail: 'Los clientes vinculados al usuario se actualizaron correctamente.',
          life: 3000
        });
        this.dialogClientesVisible = false;
        this.usuarioParaClientes = null;
        this.buscar();
      },
      error: (err) => {
        console.error('Error al actualizar clientes:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron actualizar los clientes. Intenta nuevamente.',
          life: 3000
        });
      }
    });
  }

}
