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
import { WEBREPORTS_URL } from '../liquidacion.constants';
import { LiquidacionService } from '../liquidacion.service';
import { ModalLiquidarManifiestoComponent } from './modal-liquidarmanifiesto.component';

@Component({
  selector: 'app-pendientesmanifiestos',
  templateUrl: './pendientesmanifiestos.component.html',
  styleUrls: ['./pendientesmanifiestos.component.css'],
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
  providers: [MessageService, DialogService],
})
export class PendientesmanifiestosComponent implements OnInit {
  numhojaruta = '';
  ordenes: OrdenTransporte[] = [];
  cols: any[] = [];
  selectedRow: OrdenTransporte | null = null;
  loading = false;
  liquidado = false;

  constructor(
    private liquidacionService: LiquidacionService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.numhojaruta = this.activatedRoute.snapshot.paramMap.get('uid') ?? '';

    this.cols = [
      { header: 'ACC', field: 'acc', width: '80px' },
      { header: 'N° MANIFIESTO', field: 'nummanifiesto', width: '140px' },
      { header: 'F. REGISTRO', field: 'fecharegistro', width: '140px' },
      { header: 'RESPONSABLE', field: 'nombrechofer', width: '180px' },
      { header: 'DESTINO', field: 'destino', width: '140px' },
      { header: 'TIPO OPERACIÓN', field: 'tipooperacion', width: '140px' },
      { header: 'TIPO TRANSPORTE', field: 'tipotransporte', width: '140px' },
      { header: 'PROVEEDOR', field: 'proveedor', width: '200px' },
      { header: 'ESTADO', field: 'estado', width: '120px' },
      { header: 'BULTOS', field: 'bulto', width: '90px' },
      { header: 'PESO', field: 'peso', width: '90px' },
      { header: 'VOLUMEN', field: 'volumen', width: '90px' },
    ];

    this.buscar();
  }

  buscar(): void {
    this.loading = true;
    this.liquidacionService.getAllManifiestoPendientes(this.numhojaruta).subscribe({
      next: (list: OrdenTransporte[]) => {
        this.ordenes = list ?? [];
        this.liquidado = this.ordenes.some((o) => o.estado === 'Completado');
      },
      error: (err) => {
        console.error('Error al cargar manifiestos pendientes:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Manifiestos',
          detail: err?.error?.message ?? 'No se pudieron cargar los manifiestos.',
        });
      },
      complete: () => (this.loading = false),
    });
  }

  verguias(idmanifiesto: any): void {
    this.router.navigate(['/seguimiento/liquidarordenot', idmanifiesto, this.numhojaruta]);
  }

  imprimirOC(): void {
    if (!this.numhojaruta) return;
    window.open(`${WEBREPORTS_URL}/ordencompra.aspx?idmanifiesto=${this.numhojaruta}`);
  }

  liquidar(): void {
    if (!this.selectedRow) {
      this.messageService.add({
        severity: 'info',
        summary: 'No puede continuar',
        detail: 'Debe seleccionar un manifiesto.',
      });
      return;
    }

    const ref = this.dialogService.open(ModalLiquidarManifiestoComponent, {
      header: 'Liquidar Orden de Transporte',
      width: '60vw',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      data: { id: this.selectedRow.idmanifiesto },
    });

    ref.onClose.subscribe((ok) => {
      if (ok) {
        this.messageService.add({ severity: 'success', summary: 'Liquidación', detail: 'Manifiesto liquidado.' });
        this.buscar();
      }
    });
  }

  volver(): void {
    this.router.navigate(['/seguimiento/liquidaciondocumentaria']);
  }

  estadoClass(estado?: string): string {
    if (estado === 'Registrado') return 'badge-rojo';
    if (estado === 'Completado') return 'badge-verde';
    return 'badge-gris';
  }
}
