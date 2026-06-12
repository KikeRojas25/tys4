import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { MessageService, SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { User } from 'app/core/user/user.types';
import { OrdenTransporte } from '../../recepcion/ordentransporte/ordentransporte.types';
import { ES_LOCALE } from '../liquidacion.constants';
import { LiquidacionService } from '../liquidacion.service';

@Component({
  selector: 'app-pendientesliquidacionrepartidores',
  templateUrl: './pendientesliquidacionrepartidores.component.html',
  styleUrls: ['./pendientesliquidacionrepartidores.component.css'],
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
    DropdownModule,
    ToastModule,
  ],
  providers: [MessageService],
})
export class PendientesliquidacionrepartidoresComponent implements OnInit {
  clientes: SelectItem[] = [];
  ubigeo: SelectItem[] = [];
  ordenes: OrdenTransporte[] = [];
  cols: any[] = [];
  loading = false;
  user!: User;
  model: any = { dni: '', idcliente: 0, iddistrito: 0 };
  dateInicio: Date = new Date();
  dateFin: Date = new Date();
  readonly es = ES_LOCALE;

  constructor(
    private liquidacionService: LiquidacionService,
    private router: Router,
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
      { header: 'OC', field: 'numcp', width: '120px' },
      { header: 'F. ENTREGA', field: 'fechaentregaconciliacion', width: '160px' },
      { header: 'CLIENTE', field: 'razonsocial', width: '220px' },
      { header: 'DIRECCIÓN', field: 'direccion', width: '260px' },
      { header: 'ESTADO', field: 'estado', width: '120px' },
      { header: 'CANT', field: 'bulto', width: '80px' },
      { header: 'PESO', field: 'peso', width: '80px' },
      { header: 'VOL', field: 'pesovol', width: '80px' },
    ];

    this.cargarCatalogos();
  }

  private cargarCatalogos(): void {
    this.liquidacionService.getClientes(this.user?.idclientes ?? '').subscribe({
      next: (resp: any[]) => {
        this.clientes = [{ value: 0, label: 'TODOS LOS CLIENTES' }];
        (resp ?? []).forEach((c: any) => {
          this.clientes.push({ value: c.idcliente, label: c.razonsocial });
        });
      },
    });

    this.liquidacionService.getUbigeo('').subscribe({
      next: (resp: any[]) => {
        this.ubigeo = [{ value: 0, label: 'TODOS LOS DESTINOS' }];
        (resp ?? []).forEach((u: any) => {
          this.ubigeo.push({ value: u.iddistrito, label: u.ubigeo });
        });
      },
    });
  }

  buscar(): void {
    this.model.fec_ini = this.dateInicio;
    this.model.fec_fin = this.dateFin;

    this.loading = true;
    this.liquidacionService.getAllLiquidacionRepartidorPendiente(this.model).subscribe({
      next: (list: OrdenTransporte[]) => (this.ordenes = list ?? []),
      error: (err) => {
        console.error('Error al listar pendientes repartidor:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Liquidación',
          detail: err?.error?.message ?? 'No se pudo cargar la lista.',
        });
      },
      complete: () => (this.loading = false),
    });
  }

  estadoClass(estado?: string): string {
    if (estado === 'Registrado') return 'badge-rojo';
    if (estado === 'Programado') return 'badge-amarillo';
    if (estado === 'Entregado') return 'badge-verde';
    return 'badge-gris';
  }
}
