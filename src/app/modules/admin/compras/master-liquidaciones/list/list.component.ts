import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { forkJoin } from 'rxjs';
import { ComprasService } from '../../compras.service';
import { LiquidacionCajaDto, MasterLiquidacionResult } from '../../compras.types';
import { MantenimientoService } from 'app/modules/admin/mantenimiento/mantenimiento.service';
import { User } from 'app/core/user/user.types';

@Component({
  selector: 'app-master-liquidaciones-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, CalendarModule, TableModule, ButtonModule, ToastModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
})
export class MasterLiquidacionesListComponent implements OnInit {
  loading = false;
  rows: MasterLiquidacionResult[] = [];
  user: User | null = null;
  conceptosMap: Record<number, string> = {};
  tiposTransferenciaMap: Record<number, string> = {};

  filtros = {
    fechaInicio: null as Date | null,
    fechaFin: null as Date | null,
  };

  constructor(
    private comprasService: ComprasService,
    private mantenimientoService: MantenimientoService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.user = this.safeParse<User>('user');
    this.setDefaultFechas();
    this.loadMaps();
    this.load();
  }

  private safeParse<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  private getIdTipoLiquidacion(): number {
    const esTrafico = !!this.user?.estrafico;
    const esAlmacen = !!this.user?.esalmacen;
    return esTrafico ? 1 : esAlmacen ? 2 : 1;
  }

  private setDefaultFechas(): void {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const inicio = new Date(hoy);
    inicio.setDate(hoy.getDate() - 30);
    this.filtros.fechaInicio = inicio;
    this.filtros.fechaFin = hoy;
  }

  private loadMaps(): void {
    forkJoin({
      conceptos: this.mantenimientoService.getValorTabla(43),
      tiposTransferencia: this.mantenimientoService.getValorTabla(44),
    }).subscribe({
      next: ({ conceptos, tiposTransferencia }) => {
        this.conceptosMap = (conceptos ?? []).reduce((acc: Record<number, string>, v: any) => {
          const id = Number(v.idValorTabla ?? v.idvalortabla);
          if (!Number.isNaN(id)) acc[id] = String(v.valor ?? '').trim();
          return acc;
        }, {});
        this.tiposTransferenciaMap = (tiposTransferencia ?? []).reduce((acc: Record<number, string>, v: any) => {
          const id = Number(v.idValorTabla ?? v.idvalortabla);
          if (!Number.isNaN(id)) acc[id] = String(v.valor ?? '').trim();
          return acc;
        }, {});
      },
    });
  }

  get totalRegistros(): number {
    return (this.rows ?? []).length;
  }

  get totalMonto(): number {
    return (this.rows ?? []).reduce((acc, x) => acc + (Number((x as any)?.totalMonto ?? (x as any)?.TotalMonto) || 0), 0);
  }

  load(): void {
    this.loading = true;
    const idTipo = this.getIdTipoLiquidacion();
    this.comprasService.getMasterLiquidaciones(idTipo, this.filtros.fechaInicio, this.filtros.fechaFin).subscribe({
      next: (resp) => {
        this.rows = (resp ?? []) as MasterLiquidacionResult[];
      },
      error: (err) => {
        console.error('Error cargando master liquidaciones:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Compras',
          detail: 'No se pudo cargar el master de liquidaciones. Intente nuevamente.',
        });
      },
      complete: () => (this.loading = false),
    });
  }

  buscar(): void {
    const fi = this.filtros.fechaInicio ? new Date(this.filtros.fechaInicio) : null;
    const ff = this.filtros.fechaFin ? new Date(this.filtros.fechaFin) : null;
    if (fi && ff && fi.getTime() > ff.getTime()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Filtros',
        detail: 'La fecha inicio no puede ser mayor que la fecha fin.',
      });
      return;
    }
    this.load();
  }

  limpiar(): void {
    this.setDefaultFechas();
    this.load();
  }

  reimprimir(row: MasterLiquidacionResult): void {
    const id = Number((row as any).idMasterLiquidacion ?? (row as any).IdMasterLiquidacion);
    if (!id) return;
    this.loading = true;
    this.comprasService.getLiquidacionesByMaster(id).subscribe({
      next: (liquidaciones) => {
        this.loading = false;
        void this.generarPdfMaster(row, liquidaciones ?? []);
      },
      error: (err) => {
        this.loading = false;
        console.error('Error obteniendo liquidaciones del master:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Reimprimir',
          detail: 'No se pudieron obtener las liquidaciones del master.',
        });
      },
    });
  }

  private async generarPdfMaster(row: MasterLiquidacionResult, liquidaciones: LiquidacionCajaDto[]): Promise<void> {
    if (!liquidaciones || liquidaciones.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Reimprimir', detail: 'El master no tiene liquidaciones.' });
      return;
    }

    const [jspdfModule, autoTableModule] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
    const jsPDF: any = (jspdfModule as any)?.jsPDF ?? (jspdfModule as any)?.default ?? jspdfModule;

    const resolveAutoTableFn = (m: any): any => {
      if (typeof m === 'function') return m;
      if (m && typeof m.default === 'function') return m.default;
      if (m && typeof m.autoTable === 'function') return m.autoTable;
      if (m?.default && typeof m.default.default === 'function') return m.default.default;
      if (m?.default && typeof m.default.autoTable === 'function') return m.default.autoTable;
      return null;
    };

    if (typeof jsPDF !== 'function') {
      this.messageService.add({ severity: 'error', summary: 'Reimprimir', detail: 'No se pudo inicializar el generador PDF (jsPDF).' });
      return;
    }

    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const autoTable: any = resolveAutoTableFn(autoTableModule) ?? (doc as any)?.autoTable ?? (jsPDF as any)?.API?.autoTable ?? null;

    if (typeof autoTable !== 'function') {
      this.messageService.add({ severity: 'error', summary: 'Reimprimir', detail: 'No se pudo inicializar el export a PDF (autoTable).' });
      return;
    }

    const numeroMaster = (row as any).numeroMasterCaja ?? (row as any).NumeroMasterCaja ?? '';
    const fechaExportacion = new Date().toLocaleString('es-PE');

    doc.setFontSize(14);
    doc.text(`Master de Liquidación Caja Chica ${numeroMaster}`, 20, 28);
    doc.setFontSize(9);
    doc.text(`Exportado el: ${fechaExportacion}`, 20, 44);

    const head = [[
      '#',
      'NUM OT',
      'F. LIQ.',
      'USUARIO',
      'CONCEPTO',
      'TIPO TRANSF.',
      'DESTINATARIO',
      'CUENTA',
      'N° OPERACIÓN',
      'MONTO',
      'COMP',
      'TIPO COMP.',
      'RZ. SOCIAL DOC.',
      'PROV. DEST.',
      'OBS',
      'F. REG.'
    ]];

    const formatDate = (value: any, withTime: boolean = false): string => {
      if (!value) return '';
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return String(value);
      return withTime
        ? d.toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })
        : d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const body = liquidaciones.map((x: any) => [
      String(x?.numeroliquidacion ?? '').trim(),
      String(x?.numcp ?? x?.numCp ?? x?.NUMCP ?? '').trim(),
      formatDate(x?.fechaliquidacion, false),
      String(x?.usuarioregistro ?? '').trim(),
      String(x?.concepto ?? '').trim() || (this.conceptosMap[Number(x?.idconcepto)] ?? ''),
      String(x?.tipotransferencia ?? '').trim() || (this.tiposTransferenciaMap[Number(x?.idtipotransferencia)] ?? ''),
      String(x?.destinatariotransferencia ?? '').trim(),
      String(x?.cuentatransferencia ?? '').trim(),
      String(x?.numerooperacion ?? '').trim(),
      `S/ ${(Number(x?.monto) || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      String(x?.numerocomprobante ?? '').trim(),
      String(x?.tipocomprobante ?? '').trim(),
      String(x?.razonsocialdocumento ?? '').trim(),
      String(x?.provinciadestino ?? '').trim(),
      String(x?.observaciones ?? x?.observacion ?? '').trim(),
      formatDate(x?.fecharegistro, true),
    ]);

    autoTable(doc, {
      head,
      body,
      startY: 56,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
      headStyles: { fillColor: [55, 65, 81] },
      margin: { left: 36, right: 36 },
      columnStyles: {
        0: { cellWidth: 38 },
        1: { cellWidth: 38 },
        2: { cellWidth: 37 },
        3: { cellWidth: 44 },
        4: { cellWidth: 49 },
        5: { cellWidth: 49 },
        6: { cellWidth: 62 },
        7: { cellWidth: 46 },
        8: { cellWidth: 43 },
        9: { cellWidth: 37, halign: 'right' },
        10: { cellWidth: 44 },
        11: { cellWidth: 44 },
        12: { cellWidth: 70 },
        13: { cellWidth: 49 },
        14: { cellWidth: 70 },
        15: { cellWidth: 49 },
      },
    });

    const totalMonto = liquidaciones.reduce((acc, x: any) => acc + (Number(x?.monto) || 0), 0);
    const finalY = ((doc as any).lastAutoTable?.finalY ?? 56) + 18;
    doc.setFontSize(10);
    doc.text(`Registros: ${liquidaciones.length}   |   Total monto: S/ ${totalMonto.toFixed(2)}`, 20, finalY);

    doc.save(`MasterLiquidacion_${numeroMaster}_${new Date().getTime()}.pdf`);

    this.messageService.add({ severity: 'success', summary: 'Reimprimir', detail: 'PDF generado correctamente.' });
  }

  eliminar(row: MasterLiquidacionResult): void {
    const id = Number((row as any).idMasterLiquidacion ?? (row as any).IdMasterLiquidacion);
    const numero = (row as any).numeroMasterCaja ?? (row as any).NumeroMasterCaja ?? id;
    if (!id) return;

    this.confirmationService.confirm({
      header: 'Eliminar Master',
      icon: 'pi pi-exclamation-triangle',
      message: `¿Eliminar el master ${numero}? Las liquidaciones asociadas volverán a estado pendiente.`,
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.loading = true;
        this.comprasService.deleteMasterLiquidacion(id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Master Liquidación',
              detail: `El master ${numero} fue eliminado y sus liquidaciones volvieron a pendiente.`,
            });
            this.load();
          },
          error: (err) => {
            console.error('Error eliminando master liquidación:', err);
            this.loading = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Master Liquidación',
              detail: err?.error?.message ?? 'No se pudo eliminar el master. Intente nuevamente.',
            });
          },
        });
      },
    });
  }
}
