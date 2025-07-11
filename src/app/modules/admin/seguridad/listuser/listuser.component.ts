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
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { PickListModule } from 'primeng/picklist';
import { DialogModule } from 'primeng/dialog';
import { throwIfEmpty } from 'rxjs';

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
    DialogModule
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


  constructor(private userService: SeguridadService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit() {

  this.buscar();
      
  }

  buscar() {
    // Llama al método get() del servicio y suscríbete al observable
    this.userService.get().subscribe((users: User[]) => {
      // Asigna los usuarios al array
      this.users = users;
  
      // Si no hay ningún valor en 'this.model.param', mostramos todos los usuarios
      if (!this.model.param || this.model.param.trim() === '') {
        this.filteredUsers = this.users; // Muestra todos los usuarios sin filtrar
      } else {
        // Aplica el filtro basado en el parámetro 'param' del modelo
        this.filteredUsers = this.users.filter(user =>
          user.nombreCompleto.toLowerCase().includes(this.model.param.toLowerCase())
        );
      }
  
      // Muestra los usuarios (filtrados o no) en la consola
      console.log(this.filteredUsers);
    });
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

  verRolesUsuario(id: any) {

    // this.userService.getRolesByUser(id).subscribe(roles=> {
    //   this.roles = roles;
    // })

    // this.userService.getRoles(id).subscribe(roles=> {
    //   this.selectedRoles = roles;
    // })


    this.displayDialog = true;
  }

  saveRoles() {
    
  }

}
