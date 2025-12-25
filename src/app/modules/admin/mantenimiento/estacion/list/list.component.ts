import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DynamicDialogModule, DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { SidebarModule } from 'primeng/sidebar';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Estacion } from '../../mantenimiento.types';
import { MantenimientoService } from '../../mantenimiento.service';
import { EditComponent } from '../edit/edit.component';
import { NewComponent } from '../new/new.component';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ConfirmDialogModule,
    InputTextModule,
    MatIcon,
    DynamicDialogModule,
    ReactiveFormsModule,
    MessageModule,
    ToastModule,
    ButtonModule,
    RouterModule,
    SidebarModule
  ],
  providers: [
    ConfirmationService,
    DialogService,
    MessageService
  ]
})
export class ListComponent implements OnInit {

  ref: DynamicDialogRef | undefined;

  estaciones: Estacion[];
  cols: any[];
  sidebarVisible: boolean = false;
  manualUrl: SafeResourceUrl;

  constructor(
    private mantenimientoService: MantenimientoService,
    public dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {
    // Sanitizar la URL del manual para seguridad
    this.manualUrl = this.sanitizer.bypassSecurityTrustResourceUrl('/manuales/estacion/MANUAL_USUARIO.html');
  }

  ngOnInit() {
    this.cols = [
      { field: 'idEstacion', header: 'ID', width: '10%' },
      { field: 'estacionOrigen', header: 'Estación Origen', width: '30%' },
      { field: 'distrito', header: 'Distrito', width: '20%' },
      { field: 'flujoRegular', header: 'Flujo Regular', width: '15%' },
      { field: 'acciones', header: 'Acciones', width: '20%' }
    ];

    this.load();
  }

  load() {
    this.mantenimientoService.getAllEstaciones('').subscribe(resp => {
      this.estaciones = resp;
    });
  }

  nuevo() {
    this.ref = this.dialogService.open(NewComponent, {
      header: 'Nueva Estación',
      width: '50%',
      closable: true,
      modal: true,
      dismissableMask: true,
      data: {},
    });

    this.ref.onClose.subscribe((result) => {
      if (result) {
        console.log('Datos del formulario recibidos:', result);
        this.messageService.add({ severity: 'success', summary: 'Mantenimiento de estaciones', detail: 'Se ha registrado la estación de manera correcta.' });
        this.load();
      }
    });
  }

  edit(id: number) {
    this.ref = this.dialogService.open(EditComponent, {
      header: 'Editar Estación',
      width: '50%',
      closable: true,
      modal: true,
      dismissableMask: true,
      data: { id: id },
    });

    this.ref.onClose.subscribe((result) => {
      if (result) {
        console.log('Datos del formulario recibidos:', result);
        this.messageService.add({ severity: 'success', summary: 'Mantenimiento de estaciones', detail: 'Se ha actualizado la estación de manera correcta.' });
        this.load();
      }
    });
  }

  confirm(id: number) {
    this.confirmationService.confirm({
      message: '¿Está seguro que desea eliminar esta estación?',
      header: 'Eliminar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.mantenimientoService.eliminarEstacion(id).subscribe(x => {
          this.messageService.add({ severity: 'success', summary: 'Mantenimiento de estaciones', detail: 'Se ha eliminado la estación de manera correcta.' });
          this.load();
        });
      },
      reject: () => {
      }
    });
  }

  inhabilitar(id: number) {
    this.confirmationService.confirm({
      message: '¿Está seguro que desea inhabilitar esta estación?',
      header: 'Inhabilitar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.mantenimientoService.inhabilitarEstacion(id).subscribe(x => {
          this.messageService.add({ severity: 'success', summary: 'Mantenimiento de estaciones', detail: 'Se ha inhabilitado la estación de manera correcta.' });
          this.load();
        });
      },
      reject: () => {
      }
    });
  }

  irAlManual() {
    this.sidebarVisible = true;
  }
}

