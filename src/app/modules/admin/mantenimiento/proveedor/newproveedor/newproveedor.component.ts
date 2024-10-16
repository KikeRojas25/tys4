import { Component, OnInit } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { PanelModule } from 'primeng/panel';
import { InputNumberModule } from 'primeng/inputnumber';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectItem } from 'primeng/api';
import { OrdenTransporteService } from 'app/modules/admin/recepcion/ordentransporte/ordentransporte.service';
import { DialogService, DynamicDialogModule, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';


@Component({
  selector: 'app-newproveedor',
  templateUrl: './newproveedor.component.html',
  styleUrls: ['./newproveedor.component.css'],
  standalone: true,
  imports:[
    MatIcon,
    RouterModule,
    ButtonModule,
    DropdownModule,
    InputNumberModule,
    ToastModule ,
    PanelModule,
    CommonModule,
    FormsModule,
    DynamicDialogModule,
    InputTextModule
  ],
  providers: [DialogService]
})
export class NewproveedorComponent implements OnInit {

  ref: DynamicDialogRef | undefined;

  
  model: any = [];
  tipos: SelectItem[] = [];
  ubigeo: SelectItem[] = [];

  constructor(private ordenTransporteService: OrdenTransporteService,
    public dialogService: DialogService
  ) { }

  ngOnInit() {

    this.tipos.push({ value: 21513 , label: 'Transportista' });
    this.tipos.push({ value: 21514 , label: 'Repartidor' });
    this.tipos.push({ value: 24669 , label: 'Agencia' });


    this.ordenTransporteService.getUbigeo('').subscribe(resp => {

      resp.forEach(element => {
          this.ubigeo.push({ value: element.idDistrito ,  label : element.ubigeo});
        });
    
    });


  }
 

}
