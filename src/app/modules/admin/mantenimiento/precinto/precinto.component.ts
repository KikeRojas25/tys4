import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogModule, DialogService } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { MantenimientoService } from '../mantenimiento.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-precinto',
  templateUrl: './precinto.component.html',
  styleUrls: ['./precinto.component.css'],
   standalone: true,
    imports:[
      MatIcon,
      RouterModule,
      TableModule,
      FormsModule,
      CommonModule,
      ButtonModule,
      InputTextModule,
      DynamicDialogModule,
      MessagesModule,
      ToastModule,
      ConfirmDialogModule
    ],
    providers: [DialogService,ConfirmationService, MessageService  ]
})
export class PrecintoComponent implements OnInit {
  
  model: any = {};
  precintos: any;


  constructor(private mantenimientoService : MantenimientoService,
     private confirmationService: ConfirmationService,
         private messageService: MessageService
  ) { }

  ngOnInit() {




  }

  buscar() {


    this.mantenimientoService.getPrecintos().subscribe({
      next: (res) => {
        this.precintos = res;
      },
      error: (err) => {
        console.error('Error al obtener precintos', err);
      }

    });
  }


  

  generar() {


    if (!this.model?.precinto || !this.model?.cantidad || this.model.cantidad <= 0) {



      this.messageService.add({
        severity: 'warn',
        summary: 'Gestión de precintos',
        detail: 'Debe ingresar un precinto y una cantidad válida.'
    });



      return;
    }


    this.confirmationService.confirm({
      message: '¿Esta seguro que desea agregar los precintos?',
      accept: () => {




    
            this.mantenimientoService.insertarPrecintos(this.model).subscribe({
              next: (res) => {
                console.log('Precintos insertados:', res.insertados);


                
                    this.messageService.add({
                      severity: 'success',
                      summary: 'Gestión de precintos',
                      detail: 'Los precintos han sido regristrados con éxito.'
                  });




                this.mantenimientoService.getPrecintos().subscribe({
                  next: (res) => {
                    this.precintos = res;
                  },
                  error: (err) => {
                    console.error('Error al obtener precintos', err);
                  }
            
                });
            




              },
              error: (err) => {
                console.error('Error al insertar precintos', err);
              }
            });
          
        },
        reject: () => {
            
        }
      

});

  


  }
  eliminar(precinto) {
    
    this.confirmationService.confirm({
      message: '¿Esta seguro que desea eliminar el precinto?',
      accept: () => {

        this.mantenimientoService.deletePrecinto(precinto.idprecinto).subscribe({
          next: (res) => {
            console.log('Precinto eliminado:', res);
            this.messageService.add({
              severity: 'success',
              summary: 'Gestión de precintos',
              detail: 'El precinto ha sido eliminado con éxito.'
          });

          this.mantenimientoService.getPrecintos().subscribe({
            next: (res) => {
              this.precintos = res;
            },
            error: (err) => {
              console.error('Error al obtener precintos', err);
            }
      
          });

          },
          error: (err) => {
            console.error('Error al eliminar precinto', err);
          }
        });
      },
      reject: () => {
          
      }
    
    });
  }
}
