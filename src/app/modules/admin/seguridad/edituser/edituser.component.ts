import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { MessageService, ConfirmationService, SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { MultiSelectModule } from 'primeng/multiselect';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';

import { SeguridadService } from '../seguridad.service';
import { InputMaskModule } from 'primeng/inputmask';
import { MantenimientoService } from '../../mantenimiento/mantenimiento.service';

@Component({
  selector: 'app-edituser',
  templateUrl: './edituser.component.html',
  styleUrls: ['./edituser.component.css'],
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
    ToastModule,
    InputMaskModule 
  ],
  providers: [
    MessageService,
    ConfirmationService 
   ],
  standalone:true
})
export class EdituserComponent implements OnInit {

  userForm: FormGroup;
  jwtHelper = new JwtHelperService();
  decodedToken: any = {};
  public listClientes: SelectItem[] = [];

  passwordStrengthMessage: string;
  passwordStrengthClass: string;
  id:any;
  isSaveDisabled: boolean = false; // Inicialmente habilitado



  constructor(private fb: FormBuilder,
     private messageService: MessageService,
     private confirmationService: ConfirmationService,
     private seguridadService: SeguridadService,
     private mantenimientoService: MantenimientoService,

     private router: Router,
     private activatedRoute: ActivatedRoute
  ) { 
  

  }

  ngOnInit() {

    this.id  = this.activatedRoute.snapshot.params.uid;



    console.log(this.id);

  

    this.userForm = this.fb.group({
      username: [{ value: '', disabled: true }, Validators.required],
      nombrecompleto: ['', Validators.required],
      dni: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      clientesIds: [[], Validators.required],
   });


    
    const user  = localStorage.getItem('token');
    this.decodedToken = this.jwtHelper.decodeToken(user);
    
    this.mantenimientoService.getAllClientes('', 2).subscribe((clientes: any[]) => {

      this.listClientes = [{ value: 0, label: 'Todos los clientes' }, ...clientes.map(cliente => ({
        value: cliente.id,
        label: cliente.razon_social
      }))];



  } , (_error) => {}
  ,    () => {
      this.loadItems();
  });




  }
 loadItems(){
  this.seguridadService.getUser(this.id).subscribe(response=> { 


   
    let clientesIds;

    if (response.idclientes === null || response.idclientes === undefined) {
        clientesIds = [0]; // Asignar '0' si es null o undefined
    } else if (Array.isArray(response.idclientes)) {
        clientesIds = response.idclientes.map(value => Number(value)); // Convertir a números
    } else {
        clientesIds = [Number(response.idclientes)]; // Convertir a número si es un solo valor
    }

      console.log(clientesIds);

    this.userForm.patchValue({
      username: response.username,
      nombrecompleto: response.nombreCompleto,
      dni: response.dni,
      email: response.email,
      telefono: response.status,
      clientesIds: clientesIds ,// response.clientesIds ? response.clientesIds.map(value => value) : [0], // Asigna '0' si es null
      
    });
    

  })
 }

  onSubmit() {
    if (this.userForm.valid) {
    
    
        this.userForm.markAllAsTouched(); // E
  
  
        this.confirmationService.confirm({
          acceptLabel: 'Guardar',                   // Texto del botón "Aceptar"
          rejectLabel: 'Cancelar',                  // Texto del botón "Rechazar"
          acceptIcon: 'pi pi-check',                // Icono del botón "Aceptar"
          rejectIcon: 'pi pi-times',                // Icono del botón "Rechazar"
          message: '¿Está seguro que desea actualizar al usuario?',
          header: 'Confirmar Guardado',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {

            const user = this.userForm.value;

          

            const clientesIds = this.userForm.value.clientesIds.map(cliente => String(cliente)); 


            user.clientesIds = clientesIds;
            user.id = this.id;

            this.userForm.disable();

            this.seguridadService.updateUser(user).subscribe({
              next: () => {
                this.messageService.add({severity:'success', summary: 'Éxito', detail: 'Usuario registrado correctamente'});
               // this.userForm.reset();  // Reiniciar el formulario después de registrar
               this.isSaveDisabled = true; // Deshabilitar el botón después de guardar
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
