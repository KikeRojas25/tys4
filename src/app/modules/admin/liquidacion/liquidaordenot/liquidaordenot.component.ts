import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { OrdenTransporte } from '../../recepcion/ordentransporte/ordentransporte.types';
import { LiquidacionService } from '../liquidacion.service';
import { ModalLiquidarOtComponent } from './modal-liquidarot.component';

@Component({
  selector: 'app-liquidaordenot',
  templateUrl: './liquidaordenot.component.html',
  styleUrls: ['./liquidaordenot.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatIcon,
    TableModule,
    ButtonModule,
    ToastModule,
    DynamicDialogModule,
  ],
  providers: [DialogService, MessageService],
})
export class LiquidaordenotComponent implements OnInit {
  idmanifiesto = 0;
  numhojaruta = '';
  ordenes: OrdenTransporte[] = [];
  cols: any[] = [];
  loading = false;

  constructor(
    private liquidacionService: LiquidacionService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.idmanifiesto = Number(this.activatedRoute.snapshot.paramMap.get('uid'));
    this.numhojaruta = this.activatedRoute.snapshot.paramMap.get('uid2') ?? '';

    this.cols = [
      { header: 'ACC', field: 'acc', width: '80px' },
      { header: 'OT', field: 'numcp', width: '120px' },
      { header: 'F. REGISTRO', field: 'fecharegistro', width: '140px' },
      { header: 'CLIENTE', field: 'razonsocial', width: '220px' },
      { header: 'DESTINO', field: 'destino', width: '160px' },
      { header: 'ESTADO', field: 'estado', width: '120px' },
      { header: 'T. TRANSPORTE', field: 'tipotransporte', width: '130px' },
      { header: 'T. OPERACIÓN', field: 'tipooperacion', width: '160px' },
      { header: 'CANT', field: 'bulto', width: '80px' },
      { header: 'PESO', field: 'peso', width: '80px' },
      { header: 'VOL', field: 'pesovol', width: '80px' },
    ];

    this.buscar();
  }

  buscar(): void {
    this.loading = true;
    this.liquidacionService.getAllOrdersxManifiesto(this.idmanifiesto).subscribe({
      next: (list: OrdenTransporte[]) => (this.ordenes = list ?? []),
      error: (err) => {
        console.error('Error al listar OTs:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'OTs',
          detail: err?.error?.message ?? 'No se pudieron cargar las órdenes.',
        });
      },
      complete: () => (this.loading = false),
    });
  }

  verguias(idordentrabajo: any): void {
    this.router.navigate(['/seguimiento/liquidardocumentos', idordentrabajo, this.numhojaruta, this.idmanifiesto]);
  }

  liquidarOt(idordentrabajo: number, numcp: string): void {
    const ref = this.dialogService.open(ModalLiquidarOtComponent, {
      header: 'Liquidar Orden de Transporte',
      width: '60vw',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      data: { id: idordentrabajo, ot: numcp },
    });

    ref.onClose.subscribe((ok) => {
      if (ok) {
        this.messageService.add({ severity: 'success', summary: 'Liquidación', detail: 'OT liquidada.' });
        this.buscar();
      }
    });
  }

  volver(): void {
    this.router.navigate(['/seguimiento/pendientesmanifiestos', this.numhojaruta]);
  }

  estadoClass(estado?: string): string {
    if (estado === 'Registrado') return 'badge-rojo';
    if (estado === 'Programado') return 'badge-amarillo';
    if (estado === 'Completado') return 'badge-verde';
    return 'badge-gris';
  }
}
