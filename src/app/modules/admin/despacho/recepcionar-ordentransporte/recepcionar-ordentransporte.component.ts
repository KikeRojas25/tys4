import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessagesModule } from 'primeng/messages';
import { ToastModule } from 'primeng/toast';
import { Documento, Incidencia, OrdenTransporte, User } from '../../trafico/trafico.types';
import { Router, ActivatedRoute } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Carga } from '../../planning/planning.types';
import { OrdenTransporteService } from '../../recepcion/ordentransporte/ordentransporte.service';
import { DespachoService } from '../despacho.service';
import { TableModule } from 'primeng/table';
import { MatIcon } from '@angular/material/icon';
import { InputTextModule } from 'primeng/inputtext';
import { RecepcioanrOTRModalComponent } from './recepcionarotrmodal';

@Component({
  selector: 'app-recepcionar-ordentransporte',
  templateUrl: './recepcionar-ordentransporte.component.html',
  styleUrls: ['./recepcionar-ordentransporte.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ConfirmDialogModule,
    MessagesModule,
    ToastModule,
    TableModule,
    MatIcon,
    InputTextModule,
    
    
  ] ,
  providers: [
    MessageService,
    ConfirmationService ,
    DialogService 
  ]
})
export class RecepcionarOrdentransporteComponent implements OnInit {

  ordenes2: OrdenTransporte;
  despacho: any;

  id: any;
  ref: DynamicDialogRef;
  mensajeError: string | null = null; // Mensaje de error

  orden: OrdenTransporte = {};
  user: User ;
  model: any = {};
  selectedDepartaments: OrdenTransporte[];
  selectedOTs: OrdenTransporte= {};
  SelectedOrdenTransporte?: OrdenTransporte | undefined;
  SelectedOrdenTransporte2?: OrdenTransporte | undefined;

  constructor( private router: Router,
    private activatedRoute: ActivatedRoute,
    private messageService: MessageService,
    private confirmationService: ConfirmationService ,
    private despachoService: DespachoService ,
    public dialogService: DialogService,
    private ordenService: OrdenTransporteService) { }




ngOnInit() {

  this.user = JSON.parse(localStorage.getItem('user'));
  this.model.idusuariocreacion = this.user.usr_int_id;
  this.id  = this.activatedRoute.snapshot.params.uid;
  console.log(this.ordenes2);
}



reloadDetalles() {
    this.ordenService.GetOrdenTransporteByNumero (this.model.numcp).subscribe({
      next: (data) => {
        this.ordenes2 = data; // Muestra los datos de la orden
        this.mensajeError = null; // Limpia el mensaje de error
      },
      error: (error) => {
        this.ordenes2 = null; // Limpia los datos de la orden
        this.mensajeError = error.message; // Muestra el mensaje de error
      },
    });
}





   recepcionarOT() {

    let id = this.ordenes2.idordentrabajo;

    this.ref = this.dialogService.open(RecepcioanrOTRModalComponent, {
      header: 'Verificación de OTRs',
      width: '70%',

      contentStyle: { overflow: 'auto'},
      baseZIndex: 10000,
      data : {id: id }
  });

    this.ref.onClose.subscribe((product: any) => {

      //this.reloadDetalles();
      return ;
    });


  }



}

