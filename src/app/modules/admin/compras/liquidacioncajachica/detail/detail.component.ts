import { CommonModule } from '@angular/common';
import { Component, OnInit, Optional } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ComprasService } from '../../compras.service';
import { LiquidacionCajaDto } from '../../compras.types';
import { MantenimientoService } from 'app/modules/admin/mantenimiento/mantenimiento.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-liquidacion-caja-chica-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css'],
  standalone: true,
  imports: [CommonModule, MatIconModule, ButtonModule, TableModule, ToastModule],
  providers: [MessageService],
})
export class LiquidacionCajaChicaDetailComponent implements OnInit {
  loading = false;
  liquidacion: LiquidacionCajaDto | null = null;
  conceptoLabel: string = '';
  tipoTransferenciaLabel: string = '';
  isModal = false;

  constructor(
    private comprasService: ComprasService,
    private mantenimientoService: MantenimientoService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    @Optional() public dialogRef?: DynamicDialogRef,
    @Optional() public dialogConfig?: DynamicDialogConfig
  ) {}

  ngOnInit(): void {
    this.isModal = !!this.dialogConfig?.data?.modal;
    const modalId = this.dialogConfig?.data?.id;
    const routeId = this.route.snapshot.paramMap.get('id');
    const id = Number(modalId != null ? modalId : routeId);
    if (!id) {
      this.messageService.add({ severity: 'warn', summary: 'Compras', detail: 'ID inválido.' });
      if (this.isModal) {
        this.dialogRef?.close(false);
      } else {
        this.router.navigate(['/compras/liquidacioncajachica']);
      }
      return;
    }
    this.cargar(id);
  }

  cargar(id: number): void {
    this.loading = true;
    forkJoin({
      liquidacion: this.comprasService.getLiquidacionById(id),
      conceptos: this.mantenimientoService.getValorTabla(43),
      tiposTransferencia: this.mantenimientoService.getValorTabla(44),
    }).subscribe({
      next: ({ liquidacion, conceptos, tiposTransferencia }) => {
        this.liquidacion = liquidacion;
        const map = (conceptos ?? []).reduce((acc: Record<number, string>, v: any) => {
          const key = Number(v.idValorTabla ?? v.idvalortabla);
          if (!Number.isNaN(key)) acc[key] = String(v.valor ?? '').trim();
          return acc;
        }, {});
        const idConcepto = Number(liquidacion?.idconcepto);
        this.conceptoLabel = map?.[idConcepto] ?? String(liquidacion?.idconcepto ?? '');

        const mapTransfer = (tiposTransferencia ?? []).reduce((acc: Record<number, string>, v: any) => {
          const key = Number(v.idValorTabla ?? v.idvalortabla);
          if (!Number.isNaN(key)) acc[key] = String(v.valor ?? '').trim();
          return acc;
        }, {});
        const idTipo = Number((liquidacion as any)?.idtipotransferencia ?? (liquidacion as any)?.idTipoTransferencia);
        this.tipoTransferenciaLabel = mapTransfer?.[idTipo] ?? (Number.isFinite(idTipo) && idTipo > 0 ? String(idTipo) : '');

        // Si el backend no devuelve detalles en el GET por id, los pedimos aparte
        if (this.liquidacion && (!this.liquidacion.detalles || this.liquidacion.detalles.length === 0)) {
          this.comprasService.getDetallesByLiquidacionId(id).subscribe({
            next: (dets) => {
              if (this.liquidacion) this.liquidacion.detalles = dets ?? [];
            },
          });
        }
      },
      error: (err) => {
        console.error('Error cargando detalle:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Compras',
          detail: 'No se pudo cargar el detalle de la liquidación.',
        });
      },
      complete: () => (this.loading = false),
    });
  }

  volver(): void {
    if (this.isModal) {
      this.dialogRef?.close(false);
    } else {
      this.router.navigate(['/compras/liquidacioncajachica']);
    }
  }

  editar(): void {
    if (!this.liquidacion?.idliquidacion) return;
    if (this.isModal) {
      this.dialogRef?.close({ edit: true, id: this.liquidacion.idliquidacion });
    } else {
      this.router.navigate(['/compras/liquidacioncajachica/editar', this.liquidacion.idliquidacion]);
    }
  }
}

