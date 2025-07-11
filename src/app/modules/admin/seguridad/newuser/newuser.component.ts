import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { MatIcon } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { ConfirmationService, MessageService, SelectItem, SelectItemGroup } from 'primeng/api';
import { MultiSelectModule } from 'primeng/multiselect';

import { JwtHelperService } from '@auth0/angular-jwt';
import { SeguridadService } from '../seguridad.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { MantenimientoService } from '../../mantenimiento/mantenimiento.service';


@Component({
  selector: 'app-newuser',
  templateUrl: './newuser.component.html',
  styleUrls: ['./newuser.component.css'],
  standalone: true,
  imports:[
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
    ToastModule
    
  ],
  providers: [
    MessageService,
    ConfirmationService 
   ]
})
export class NewuserComponent implements OnInit {
  userForm: FormGroup;
  jwtHelper = new JwtHelperService();
  decodedToken: any = {};
  public listClientes: SelectItem[] = [];

  passwordStrengthMessage: string;
  passwordStrengthClass: string;



  constructor(private fb: FormBuilder,
     private messageService: MessageService,
     private confirmationService: ConfirmationService,
     private seguridadService: SeguridadService,
     private comercialService: MantenimientoService,
     private router: Router
  ) { 
  

  }

  ngOnInit() {

    this.userForm = this.fb.group({
      username: ['', Validators.required],
      nombrecompleto: ['', Validators.required],
      dni: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      clientesids: [[], Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
  

    });


    
    const user  = localStorage.getItem('token');
    this.decodedToken = this.jwtHelper.decodeToken(user);
    
    this.comercialService.getAllClientes('', this.decodedToken.nameid ).subscribe((list) => {
      list.forEach((x) => {
          this.listClientes.push ({ label: x.razonSocial , value: x.idCliente });
      });
  } , (_error) => {}
  ,    () => {
     // this.loadItems();
  });




  }
 

  onSubmit() {
    if (this.userForm.valid) {
    
    
        this.userForm.markAllAsTouched(); // E
  
  
        this.confirmationService.confirm({
          acceptLabel: 'Guardar',                   // Texto del botón "Aceptar"
          rejectLabel: 'Cancelar',                  // Texto del botón "Rechazar"
          acceptIcon: 'pi pi-check',                // Icono del botón "Aceptar"
          rejectIcon: 'pi pi-times',                // Icono del botón "Rechazar"
          message: '¿Está seguro que desea guardar el nuevo usuario?',
          header: 'Confirmar Guardado',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {

            const user = this.userForm.value;

            const clientesIds = this.userForm.value.clientesids.map(cliente => String(cliente.value)); 

            user.clientesids = clientesIds;

            this.userForm.disable();

            this.seguridadService.registerUser(user).subscribe({
              next: () => {
                this.messageService.add({severity:'success', summary: 'Éxito', detail: 'Usuario registrado correctamente'});
                this.userForm.reset();  // Reiniciar el formulario después de registrar
              },
              error: (error) => {
                this.messageService.add({severity:'error', summary: 'Error', detail: 'Ocurrió un error al registrar el usuario'});
                console.error('Error al registrar usuario:', error);
              }
            });


          },
          reject: () => {
            // Acción opcional a realizar si el usuario rechaza
            this.messageService.add({ severity: 'info', summary: 'Cancelado', detail: 'El guardado fue cancelado' });
          }
        });




    }
  }

  onCancel() {
    this.router.navigate(['/seguridad/listausuarios']  );
    }
}
