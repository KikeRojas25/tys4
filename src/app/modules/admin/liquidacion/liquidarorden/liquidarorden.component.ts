import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { OrdenTransporte } from '../../recepcion/ordentransporte/ordentransporte.types';
import { WEBREPORTS_URL } from '../liquidacion.constants';
import { LiquidacionService } from '../liquidacion.service';

@Component({
  selector: 'app-liquidarorden',
  templateUrl: './liquidarorden.component.html',
  styleUrls: ['./liquidarorden.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatIcon,
    TableModule,
    ButtonModule,
    ConfirmDialogModule,
    ToastModule,
  ],
  providers: [ConfirmationService, MessageService],
})
export class LiquidarordenComponent implements OnInit {
  idmanifiesto = 0;
  numhojaruta = '';
  ordenes: OrdenTransporte[] = [];
  cols: any[] = [];
  loading = false;

  constructor(
    private liquidacionService: LiquidacionService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.idmanifiesto = Number(this.activatedRoute.snapshot.paramMap.get('uid'));
    this.numhojaruta = this.activatedRoute.snapshot.paramMap.get('uid2') ?? '';

    this.cols = [
      { header: 'ACC', field: 'acc', width: '80px' },
      { header: 'OR', field: 'numcp', width: '120px' },
      { header: 'F. REGISTRO', field: 'fecharegistro', width: '140px' },
      { header: 'RESPONSABLE', field: 'responsable', width: '160px' },
      { header: 'CLIENTE', field: 'razonsocial', width: '200px' },
      { header: 'F. CITA', field: 'fechahoracita', width: '140px' },
      { header: 'ESTADO', field: 'estado', width: '120px' },
      { header: 'CONTACTO', field: 'personarecojo', width: '160px' },
      { header: 'T. UNIDAD', field: 'tipounidad', width: '100px' },
      { header: 'PT. RECOJO', field: 'puntorecojo', width: '220px' },
      { header: 'CE. ACOPIO', field: 'centroacopio', width: '140px' },
      { header: 'CANT', field: 'bulto', width: '80px' },
      { header: 'PESO', field: 'peso', width: '80px' },
      { header: 'VOL', field: 'volumen', width: '80px' },
    ];

    this.buscar();
  }

  buscar(): void {
    this.loading = true;
    this.liquidacionService.getAllLiquidacionPendientexManifiesto(this.idmanifiesto).subscribe({
      next: (list: OrdenTransporte[]) => (this.ordenes = list ?? []),
      error: (err) => {
        console.error('Error al listar OTs:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Liquidación',
          detail: err?.error?.message ?? 'No se pudieron cargar las órdenes.',
        });
      },
      complete: () => (this.loading = false),
    });
  }

  verguias(idordentrabajo: any): void {
    this.router.navigate(['/seguimiento/liquidardocumentos', idordentrabajo, this.numhojaruta, this.idmanifiesto]);
  }

  liquidar(): void {
    this.confirmationService.confirm({
      header: 'Confirmación',
      message: '¿Está seguro que desea liquidar esta Hoja de Ruta?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        this.loading = true;
        this.liquidacionService.liquidarManifiesto(this.idmanifiesto, 1, '').subscribe({
          next: () => {
            window.open(`${WEBREPORTS_URL}/ordencompra.aspx?idmanifiesto=${this.idmanifiesto}`);
            this.messageService.add({
              severity: 'success',
              summary: 'Liquidación',
              detail: 'Hoja de Ruta liquidada.',
            });
            this.buscar();
          },
          error: (err) => {
            console.error('Error al liquidar HR:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Liquidación',
              detail: err?.error?.message ?? 'No se pudo liquidar la Hoja de Ruta.',
            });
            this.loading = false;
          },
        });
      },
    });
  }

  volver(): void {
    this.router.navigate(['/seguimiento/liquidaciondocumentaria']);
  }

  estadoClass(estado?: string): string {
    if (estado === 'Registrado') return 'badge-rojo';
    if (estado === 'Programado') return 'badge-amarillo';
    if (estado === 'Completado') return 'badge-verde';
    return 'badge-gris';
  }
}
