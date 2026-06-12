import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { User } from 'app/core/user/user.types';
import { OrdenTransporte } from '../../recepcion/ordentransporte/ordentransporte.types';
import { ES_LOCALE } from '../liquidacion.constants';
import { LiquidacionService } from '../liquidacion.service';
import { ModalVincularComponent } from './modal-vincular.component';

@Component({
  selector: 'app-vincularfactura',
  templateUrl: './vincularfactura.component.html',
  styleUrls: ['./vincularfactura.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatIcon,
    TableModule,
    ButtonModule,
    InputTextModule,
    CalendarModule,
    ToastModule,
    DynamicDialogModule,
  ],
  providers: [MessageService, DialogService],
})
export class VincularfacturaComponent implements OnInit {
  ordenes: OrdenTransporte[] = [];
  cols: any[] = [];
  loading = false;
  user!: User;
  model: any = { dni: '' };
  dateInicio: Date = new Date();
  dateFin: Date = new Date();
  readonly es = ES_LOCALE;

  constructor(
    private liquidacionService: LiquidacionService,
    private router: Router,
    private dialogService: DialogService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('user') ?? 'null');
    this.model.idusuario = this.user?.usr_int_id;

    const hoy = new Date();
    this.dateInicio = new Date();
    this.dateInicio.setDate(hoy.getDate() - 30);
    this.dateFin = new Date();

    this.cols = [
      { header: 'ACC', field: 'acc', width: '80px' },
      { header: 'HR', field: 'numhojaruta', width: '120px' },
      { header: 'F. REGISTRO', field: 'fecharegistro', width: '160px' },
      { header: 'CLIENTE', field: 'razonsocial', width: '220px' },
      { header: 'CONDUCTOR', field: 'nombrechofer', width: '180px' },
      { header: 'PLACA', field: 'placa', width: '120px' },
      { header: 'TIPO DE VEHÍCULO', field: 'tipo', width: '160px' },
    ];

    this.buscar();
  }

  buscar(): void {
    this.loading = true;
    this.liquidacionService.getAllPendienteFacturacion(this.model.dni ?? '').subscribe({
      next: (list: OrdenTransporte[]) => (this.ordenes = list ?? []),
      error: (err) => {
        console.error('Error al listar pendientes de facturación:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Vincular Factura',
          detail: err?.error?.message ?? 'No se pudo cargar la lista.',
        });
      },
      complete: () => (this.loading = false),
    });
  }

  vincular(numhojaruta: string): void {
    const ref = this.dialogService.open(ModalVincularComponent, {
      header: 'Vincular Factura',
      width: '60vw',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      data: { id: numhojaruta },
    });

    ref.onClose.subscribe((codigo: any) => {
      if (codigo) {
        this.messageService.add({ severity: 'success', summary: 'Facturación vs OS', detail: `Código de facturación: ${codigo}` });
        alert('Código de facturación: ' + codigo);
        this.buscar();
      }
    });
  }
}
