import { Component, OnInit } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { MantenimientoService } from '../../mantenimiento.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogModule, DynamicDialogRef } from 'primeng/dynamicdialog';
import { NewproveedorComponent } from '../newproveedor/newproveedor.component';


@Component({
  selector: 'app-listproveedor',
  templateUrl: './listproveedor.component.html',
  styleUrls: ['./listproveedor.component.css'],
    standalone: true,
    imports:[
      MatIcon,
      RouterModule,
      TableModule,
      FormsModule,
      CommonModule,
      ButtonModule,
      DynamicDialogModule
    ],
    providers: [DialogService]
})
export class ListproveedorComponent implements OnInit {
  provedores: any[];
  model: any = {};
  ref: DynamicDialogRef | undefined;
   cols: any;


  constructor(private mantenimientoService: MantenimientoService,
    public dialogService: DialogService
  ) { }

  ngOnInit() {

    this.cols = [
      { field: 'idproveedor', header: 'Acciones',  width: '60px' },
      { field: 'Tipo', header: 'Tipo' ,  width: '40px'},
      { field: 'razonSocial', header: 'Razón Social' ,  width: '90px'},
      { field: 'ruc', header: 'RUC' ,  width: '60px'},
      { field: 'direccion', header: 'Dirección' ,  width: '120px'},
      { field: 'ubigeo', header: 'Ubigeo' ,  width: '120px'},
      { field: 'telefono', header: 'Teléfono' ,  width: '40px'},
 
    ];
    this.reload();

  }
  reload(){
    this.mantenimientoService.getProveedores('', 1).subscribe(resp => {


      this.provedores = resp;
  
    });
  }
  nuevo(){
    this.ref = this.dialogService.open(NewproveedorComponent, {
      header: 'Nuevo Proveedor',
      width: '50vw',
      modal:true,
      breakpoints: {
          '960px': '75vw',
          '640px': '90vw'
      },
  });
  }

}
