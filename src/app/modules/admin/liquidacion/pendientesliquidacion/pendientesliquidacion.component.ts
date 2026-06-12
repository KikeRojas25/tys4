import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { User } from 'app/core/user/user.types';
import { OrdenTransporte } from '../../recepcion/ordentransporte/ordentransporte.types';
import { ES_LOCALE } from '../liquidacion.constants';
import { LiquidacionService } from '../liquidacion.service';

@Component({
  selector: 'app-pendientesliquidacion',
  templateUrl: './pendientesliquidacion.component.html',
  styleUrls: ['./pendientesliquidacion.component.css'],
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
  ],
  providers: [MessageService],
})
export class PendientesliquidacionComponent implements OnInit {
  ordenes: OrdenTransporte[] = [];
  cols: any[] = [];
  loading = false;
  user!: User;
  model: any = { dni: '', numcp: '', docreferencia: '', grr: '' };
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
      { header: 'ACC', field: 'acc', width: '80px' },
      { header: 'HR', field: 'numhojaruta', width: '100px' },
      { header: 'F. REGISTRO', field: 'fecharegistro', width: '140px' },
      { header: 'CONDUCTOR', field: 'nombrechofer', width: '180px' },
      { header: 'ESTADO', field: 'estado', width: '120px' },
      { header: 'CANT', field: 'bulto', width: '80px' },
      { header: 'PESO', field: 'peso', width: '80px' },
      { header: 'VOL', field: 'pesovol', width: '80px' },
      { header: 'PLACA', field: 'placa', width: '100px' },
    ];
  }

  buscar(): void {
    this.model.fec_ini = this.dateInicio;
    this.model.fec_fin = this.dateFin;

    this.loading = true;
    this.liquidacionService.getAllLiquidacionPendiente(this.model).subscribe({
      next: (list: OrdenTransporte[]) => {
        this.ordenes = list ?? [];
      },
      error: (err) => {
        console.error('Error al listar pendientes de liquidación:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Liquidación',
          detail: err?.error?.message ?? 'No se pudo cargar la lista.',
        });
      },
      complete: () => (this.loading = false),
    });
  }

  irAPlacasProgramadas(): void {
    this.router.navigate(['/seguimiento/listadoplacasprogramadas']);
  }

  editarOT(row: OrdenTransporte): void {
    if (row.tipoorden === '2') {
      this.router.navigate(['/seguimiento/liquidarorden', row.idmanifiesto, row.numhojaruta]);
    } else {
      this.router.navigate(['/seguimiento/pendientesmanifiestos', row.numhojaruta]);
    }
  }

  estadoClass(estado?: string): string {
    if (estado === 'Registrado') return 'badge-rojo';
    if (estado === 'Programado') return 'badge-amarillo';
    return 'badge-gris';
  }
}
