import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MessageService, ConfirmationService, SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogModule, DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TimelineModule } from 'primeng/timeline';
import { ToastModule } from 'primeng/toast';
import { MantenimientoService } from '../../mantenimiento.service';
import { EditComponent } from '../edit/edit.component';
import { NewComponent } from '../new/new.component';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
  standalone: true,
  imports: [
        InputTextModule, 
        DropdownModule,
        FormsModule,
        ButtonModule,
        TableModule,
        CommonModule,
        DialogModule   ,
        TimelineModule ,
        CardModule ,
        DynamicDialogModule ,
        ToastModule,
        CalendarModule,
        ConfirmDialogModule,
        MatIcon,
        IconFieldModule,
        InputIconModule,
        InputMaskModule ,
        InputNumberModule
      ],
      providers: [
        DialogService ,
        MessageService ,
        ConfirmationService     
      ]
})
export class ListComponent implements OnInit {

proveedores: SelectItem[] = [];
cols: any[];
  model: any = {};
  choferes: any = [];
  cargandoProveedores = false;
  mostrarModal: boolean = false;
  marcas: SelectItem[] = [];
  tiposVehiculo:SelectItem[] = [];
  ref: DynamicDialogRef | undefined;

  constructor(private mantenimientoService: MantenimientoService,

        private messageService: MessageService,
        public dialogService: DialogService,
        private confirmationService: ConfirmationService ,
   ) { 

    

  }

  ngOnInit() {


    
    this.cols = [
      { field: 'id', header: 'ID',  width: '10%'},
      { field: 'nombreCompleto', header: 'Conductor' ,  width: '40%'},
      { field: 'dni', header: 'DNI' ,  width: '40%'},
      { field: 'brevete', header: 'DNI' ,  width: '40%'},
      { field: 'id', header: 'Acciones',  width: '20%' }
        ];



  //   this.cargandoProveedores = true;
  //   this.mantenimientoService.getProveedores('', 1).subscribe({
  //     next: (data) => {

     
  //       this.proveedores = data.map(p => ({
  //         label: p.razonSocial, // o lo que corresponda
  //         value: p.idProveedor
  //     }));



  //   },
  //   error: (err) => {
  //       console.error('Error al cargar proveedores', err);
  //   },
  //   complete: () => {
  //       this.cargandoProveedores = false;
  //   } 
  
  
  // });


  }

  buscar() {



    this.mantenimientoService.GetAllChoferes().subscribe({
      next: (data) => {
        this.choferes = data;

        console.log('choferes', data);
    },
    error: (err) => {
        console.error('Error al cargar proveedores', err);
    },
    complete: () => {
        this.cargandoProveedores = false;
    } 
  
  
  });



  } 
  editar(id: number) {  


    this.ref = this.dialogService.open(EditComponent, {
      header: '',
         width: '700px',
        height: '700px',
        data: {id:id}
      
  });

  this.ref.onClose.subscribe((actualizado) => {
    if (actualizado) {
      this.buscar(); // 👈 refresca tu tabla

      
      this.messageService.add({severity:'success', summary:'Conductor actualizado', detail:'El conductor se ha actualizado correctamente'});


    }
  });


  }
  nuevo() {

    this.ref = this.dialogService.open(NewComponent, {
      header: '',
         width: '700px',
        height: '700px',
        data: {codigo:''}
      
  });
  this.ref.onClose.subscribe((actualizado) => {
    if (actualizado) {
      this.buscar(); // 👈 refresca tu tabla


      this.messageService.add({severity:'success', summary:'Conductor registrado', detail:'El conductor se ha registrado correctamente'});



    }
  });


  }
  exportarExcel() {

  }
  
  eliminar(id: number): void {


    this.confirmationService.confirm({
      message: '¿Está seguro que desea eliminar el vehículo?',
      header: 'Eliminar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {

      this.mantenimientoService.eliminarVehiculo(id).subscribe({
        next: (res) => {
          
          
          this.buscar(); // refresca la lista
        },
        error: (err) => {
          console.error('Error al eliminar', err);
          alert('Error al eliminar el vehículo');
        }
      });
     },
  reject: () => {

  }
});
}
  validarPlaca() {
    // Convertir a mayúsculas
    this.model.placa = this.model.placa.toUpperCase();

    // Expresión regular para formato correcto (1 letra inicial + 5 caracteres alfanuméricos)
    const placaRegex = /^[A-Z]{1}[A-Z0-9]{5}$/;

    if (!placaRegex.test(this.model.placa)) {
        alert('La placa debe tener el formato: A6Q330 (1 letra inicial y 5 caracteres alfanuméricos).');
        this.model.placa = ''; // Limpiar input si no es válido
    }
}




}
