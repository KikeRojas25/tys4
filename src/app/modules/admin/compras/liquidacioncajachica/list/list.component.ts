import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService, DynamicDialogModule, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ComprasService } from '../../compras.service';
import { DetalleLiquidadoResult, LiquidacionCajaDto } from '../../compras.types';
import { MantenimientoService } from 'app/modules/admin/mantenimiento/mantenimiento.service';
import { User } from 'app/core/user/user.types';
import { forkJoin } from 'rxjs';
import { LiquidacionCajaChicaFormComponent } from '../form/form.component';
import { LiquidacionCajaChicaDetailComponent } from '../detail/detail.component';

@Component({
  selector: 'app-liquidacion-caja-chica-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    CalendarModule,
    DropdownModule,
    TableModule,
    ButtonModule,
    ToastModule,
    ConfirmDialogModule,
    DynamicDialogModule,
    DialogModule,
  ],
  providers: [ConfirmationService, MessageService, DialogService],
})
export class LiquidacionCajaChicaListComponent implements OnInit {
  liquidaciones: LiquidacionCajaDto[] = [];
  private liquidacionesAll: LiquidacionCajaDto[] = [];
  loading = false;
  selectedLiquidaciones: LiquidacionCajaDto[] = [];
  showLiquidarModal = false;
  user: User | null = null;

  filtros = {
    fechaInicio: null as Date | null,
    fechaFin: null as Date | null,
    estado: 'todos' as 'todos' | 'liquidados' | 'no_liquidados',
    destinatario: '',
  };
  estadoOptions = [
    { label: 'Todos', value: 'todos' },
    { label: 'Solo liquidados', value: 'liquidados' },
    { label: 'Solo no liquidados', value: 'no_liquidados' },
  ];

  cols: any[] = [];
  conceptosMap: Record<number, string> = {};
  tiposTransferenciaMap: Record<number, string> = {};
  ref?: DynamicDialogRef;

  constructor(
    private comprasService: ComprasService,
    private mantenimientoService: MantenimientoService,
    private router: Router,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.user = this.safeParse<User>('user');
    this.setDefaultFechas();

    this.cols = [
      { header: 'ACC', field: '', width: '110px' },
      { header: '#', field: 'numeroliquidacion', width: '140px' },
      { header: 'NUM OT', field: 'numcp', width: '140px' },
      { header: 'F. LIQ.', field: 'fechaliquidacion', width: '140px' },
      { header: 'USUARIO', field: 'usuarioregistro', width: '140px' },
      { header: 'CONCEPTO', field: 'concepto', width: '160px' },
      { header: 'TIPO TRANSF.', field: 'tipotransferencia', width: '160px' },
      { header: 'DESTINATARIO', field: 'destinatariotransferencia', width: '200px' },
      { header: 'CUENTA', field: 'cuentatransferencia', width: '160px' },
      { header: 'N° OPERACIÓN', field: 'numerooperacion', width: '150px' },
      { header: 'MONTO', field: 'monto', width: '120px' },
      { header: 'COMP.', field: 'numerocomprobante', width: '160px' },
      { header: 'TIPO COMP.', field: 'tipocomprobante', width: '150px' },
      { header: 'RZ. SOCIAL DOC.', field: 'razonsocialdocumento', width: '220px' },
      { header: 'PROV. DEST.', field: 'provinciadestino', width: '160px' },
      { header: 'OBS.', field: 'observaciones', width: '220px' },
      { header: 'F. REG.', field: 'fecharegistro', width: '160px' },
    ];

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
    // Regla: prioridad Tráfico y fallback=1
    return esTrafico ? 1 : esAlmacen ? 2 : 1;
  }

  private getIdLiquidador(): number {
    // En este proyecto se usa tanto user.id como user.usr_int_id; priorizamos id.
    return Number(this.user?.id ?? this.user?.usr_int_id ?? 0);
  }

  private setDefaultFechas(): void {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const semanaAtras = new Date(hoy);
    semanaAtras.setDate(hoy.getDate() - 7);

    this.filtros.fechaFin = hoy;
    this.filtros.fechaInicio = semanaAtras;
  }

  load(): void {
    this.loading = true;

    forkJoin({
      liquidaciones: this.comprasService.getAllLiquidaciones(this.filtros.fechaInicio, this.filtros.fechaFin, this.getIdTipoLiquidacion()),
      conceptos: this.mantenimientoService.getValorTabla(43),
      tiposTransferencia: this.mantenimientoService.getValorTabla(44),
    }).subscribe({
      next: ({ liquidaciones, conceptos, tiposTransferencia }) => {
        this.liquidacionesAll = (liquidaciones ?? []) as LiquidacionCajaDto[];
        this.aplicarFiltroEstado(false);
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
      error: (err) => {
        console.error('Error cargando datos:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Compras',
          detail: 'No se pudieron cargar las liquidaciones. Intente nuevamente.',
        });
      },
      complete: () => (this.loading = false),
    });
  }

  buscar(): void {
    // Validación simple de rango de fechas
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

    this.limpiarSeleccion();
    this.load();
  }

  limpiarFiltros(): void {
    this.setDefaultFechas();
    this.filtros.estado = 'todos';
    this.filtros.destinatario = '';
    this.limpiarSeleccion();
    this.load();
  }

  aplicarFiltroEstado(resetSelection: boolean = true): void {
    if (resetSelection) this.limpiarSeleccion();

    let base = this.liquidacionesAll ?? [];

    if (this.filtros.estado === 'liquidados') {
      base = base.filter((x) => this.isRowLiquidado(x));
    } else if (this.filtros.estado === 'no_liquidados') {
      base = base.filter((x) => !this.isRowLiquidado(x));
    }

    const dest = (this.filtros.destinatario ?? '').trim().toLowerCase();
    if (dest) {
      base = base.filter((x) =>
        (x.destinatariotransferencia ?? '').toLowerCase().includes(dest)
      );
    }

    this.liquidaciones = base;
  }

  getConceptoLabel(idconcepto: number): string {
    const id = Number(idconcepto);
    return this.conceptosMap?.[id] ?? String(idconcepto ?? '');
  }

  getTipoTransferenciaLabel(idtipotransferencia: number | null): string {
    const id = Number(idtipotransferencia);
    if (!Number.isFinite(id) || id <= 0) return '';
    return this.tiposTransferenciaMap?.[id] ?? String(idtipotransferencia ?? '');
  }

  get totalRegistros(): number {
    return (this.liquidaciones ?? []).length;
  }

  get totalMonto(): number {
    return this.round2((this.liquidaciones ?? []).reduce((acc, x: any) => acc + (Number(x?.monto) || 0), 0));
  }

  get selectedCount(): number {
    return (this.selectedLiquidaciones ?? []).length;
  }

  get selectedTotalMonto(): number {
    return this.round2((this.selectedLiquidaciones ?? []).reduce((acc, x: any) => acc + (Number(x?.monto) || 0), 0));
  }

  private round2(n: number): number {
    return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
  }

  private formatMontoPEN(value: any): string {
    const n = Number(value);
    const safe = Number.isFinite(n) ? n : 0;
    // Formato simple en español (Perú) con símbolo Soles
    return `S/ ${safe.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  isRowLiquidado(row: any): boolean {
    const v = row?.liquidado ?? row?.Liquidado ?? row?.LIQUIDADO;
    return v === true || v === 1 || String(v).toLowerCase() === 'true';
  }

  private sanitizeSelection(): void {
    // Por seguridad, evita que queden seleccionadas filas ya liquidadas (por header checkbox, etc.)
    this.selectedLiquidaciones = (this.selectedLiquidaciones ?? []).filter((x) => !this.isRowLiquidado(x));
  }

  onRowSelect(): void {
    this.sanitizeSelection();
  }

  onRowUnselect(): void {
    this.sanitizeSelection();
  }

  limpiarSeleccion(): void {
    this.selectedLiquidaciones = [];
  }

  abrirLiquidarModal(): void {
    if (!this.selectedLiquidaciones || this.selectedLiquidaciones.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Liquidaciones',
        detail: 'Seleccione al menos una liquidación.',
      });
      return;
    }
    this.showLiquidarModal = true;
  }

  cerrarLiquidarModal(): void {
    this.showLiquidarModal = false;
  }

  liquidarSeleccionados(): void {
    if (!this.selectedLiquidaciones || this.selectedLiquidaciones.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Liquidaciones',
        detail: 'Seleccione al menos una liquidación.',
      });
      return;
    }

    // Mantener por compatibilidad: ahora abre el modal
    this.abrirLiquidarModal();
  }

  liquidarDesdeModal(): void {
    if (!this.selectedLiquidaciones || this.selectedLiquidaciones.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Liquidaciones',
        detail: 'Seleccione al menos una liquidación.',
      });
      return;
    }

    const ids = (this.selectedLiquidaciones ?? [])
      .map((x) => Number((x as any)?.idliquidacion))
      .filter((x) => Number.isFinite(x) && x > 0);

    if (ids.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Liquidaciones',
        detail: 'No se pudieron obtener los IDs seleccionados.',
      });
      return;
    }

    const IdTipoLiquidacion = this.getIdTipoLiquidacion();
    const IdLiquidador = this.getIdLiquidador();
    if (!Number.isFinite(IdLiquidador) || IdLiquidador <= 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Liquidaciones',
        detail: 'No se pudo identificar el usuario liquidador. Vuelva a iniciar sesión.',
      });
      return;
    }

    this.loading = true;
    this.comprasService.liquidarLiquidaciones({ Ids: ids, Liquidado: true, IdTipoLiquidacion, IdLiquidador }).subscribe({
      next: (resp) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Liquidaciones',
          detail: resp?.mensaje ?? `Se actualizaron ${resp?.cantidad ?? ids.length} liquidaciones.`,
        });
        this.cerrarLiquidarModal();
        this.limpiarSeleccion();
        this.load();
      },
      error: (err) => {
        console.error('Error liquidando liquidaciones:', err);
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Liquidaciones',
          detail: err?.error?.mensaje ?? err?.error?.message ?? 'No se pudo liquidar. Intente nuevamente.',
        });
      },
      complete: () => (this.loading = false),
    });
  }

  private formatDate(value: any, withTime: boolean = false): string {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return withTime
      ? d.toLocaleString('es-PE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      : d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  private formatDiaMesCorto(value: any): string {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    // Ej: "17-Ene" (similar al diseño)
    const day = d.toLocaleDateString('es-PE', { day: '2-digit' });
    let month = d.toLocaleDateString('es-PE', { month: 'short' }); // "ene." / "ene"
    month = month.replace('.', '').trim();
    month = month ? month.charAt(0).toUpperCase() + month.slice(1) : month;
    return `${day}-${month}`;
  }

  private buildExportRowsFor(list: LiquidacionCajaDto[]): any[] {
    return (list ?? []).map((x: any) => ({
      '#': String(x?.numeroliquidacion ?? '').trim(),
      'NUM OT': String(x?.numcp ?? x?.numCp ?? x?.NumCp ?? x?.NUMCP ?? '').trim(),
      'F. LIQ.': this.formatDate(x?.fechaliquidacion, false),
      USUARIO: String(x?.usuarioregistro ?? '').trim(),
      CONCEPTO: String(x?.concepto ?? '').trim() || this.getConceptoLabel(Number(x?.idconcepto)),
      'TIPO TRANSF.': String(x?.tipotransferencia ?? '').trim() || this.getTipoTransferenciaLabel(x?.idtipotransferencia ?? null),
      DESTINATARIO: String(x?.destinatariotransferencia ?? '').trim(),
      CUENTA: String(x?.cuentatransferencia ?? '').trim(),
      'N° OPERACIÓN': String(x?.numerooperacion ?? '').trim(),
      MONTO: this.round2(Number(x?.monto) || 0),
      COMP: String(x?.numerocomprobante ?? '').trim(),
      'TIPO COMP.': String(x?.tipocomprobante ?? x?.tipoComprobante ?? '').trim(),
      'RZ. SOCIAL DOC.': String(x?.razonsocialdocumento ?? x?.razonSocialDocumento ?? '').trim(),
      'PROV. DEST.': String(x?.provinciadestino ?? '').trim(),
      OBS: String(x?.observaciones ?? x?.observacion ?? '').trim(),
      'F. REG.': this.formatDate(x?.fecharegistro, true),
    }));
  }

  private sumMonto(list: LiquidacionCajaDto[]): number {
    return this.round2((list ?? []).reduce((acc, x: any) => acc + (Number(x?.monto) || 0), 0));
  }

  exportExcel(): void {
    if (!this.liquidaciones || this.liquidaciones.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Exportar Excel',
        detail: 'No hay datos para exportar.',
      });
      return;
    }

    import('xlsx-js-style').then((xlsx: any) => {
      const XLSX: any = xlsx?.default ?? xlsx;
      const exportData = this.buildExportRowsFor(this.liquidaciones ?? []);

      // Totalizado al final
      exportData.push({});
      exportData.push({
        '#': 'TOTAL',
        'NUM OT': '',
        'F. LIQ.': '',
        USUARIO: '',
        CONCEPTO: `Registros: ${this.totalRegistros}`,
        'TIPO TRANSF.': '',
        DESTINATARIO: '',
        CUENTA: '',
        'N° OPERACIÓN': '',
        MONTO: this.totalMonto,
        COMP: '',
        'TIPO COMP.': '',
        'RZ. SOCIAL DOC.': '',
        'PROV. DEST.': '',
        OBS: '',
        'F. REG.': '',
      });

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      this.applyExcelStyles(worksheet);
      worksheet['!cols'] = [
        { wch: 14 }, // #
        { wch: 14 }, // NUM OT
        { wch: 12 }, // F. LIQ.
        { wch: 16 }, // USUARIO
        { wch: 18 }, // CONCEPTO
        { wch: 18 }, // TIPO TRANSF.
        { wch: 24 }, // DESTINATARIO
        { wch: 18 }, // CUENTA
        { wch: 16 }, // N° OPERACIÓN
        { wch: 12 }, // MONTO
        { wch: 18 }, // COMP
        { wch: 16 }, // TIPO COMP.
        { wch: 28 }, // RZ. SOCIAL DOC.
        { wch: 16 }, // PROV. DEST.
        { wch: 28 }, // OBS
        { wch: 18 }, // F. REG.
      ];

      const workbook = { Sheets: { Liquidaciones: worksheet }, SheetNames: ['Liquidaciones'] };
      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, 'LiquidacionesCajaChica');
    });
  }

  exportExcelDetallesLiquidados(tipo: string): void {
    this.loading = true;

    this.comprasService.getDetallesLiquidados(this.filtros.fechaInicio, this.filtros.fechaFin, tipo).subscribe({
      next: (detalles: DetalleLiquidadoResult[]) => {
        const rows = (detalles ?? []).map((d: any) => ({
          NUM_LIQUIDACION: String(d?.numeroliquidacion ?? '').trim(),
          NUM_OT: String(d?.numcp ?? '').trim(),
          NUM_MANIFIESTO: String(d?.nummanifiesto ?? '').trim(),
          CLIENTE: String(d?.cliente ?? '').trim(),
          DESTINO: String(d?.destino ?? '').trim(),
          SUBTOTAL_ORDEN: Number(d?.subtotalorden ?? 0),
          MONTO_PRORRATEADO: Number(d?.montoprorrateado ?? 0),
          CONCEPTO: String(d?.concepto ?? '').trim(),
          FECHA_LIQUIDACION: d?.fechaliquidacion ? this.formatDate(d?.fechaliquidacion, false) : '',
        }));

        if (!rows || rows.length === 0) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Exportar Excel',
            detail: 'No hay detalles liquidados para exportar.',
          });
          return;
        }

        import('xlsx-js-style').then((xlsx: any) => {
          const XLSX: any = xlsx?.default ?? xlsx;
          const worksheet = XLSX.utils.json_to_sheet(rows);
          this.applyExcelStyles(worksheet);
          worksheet['!cols'] = [
            { wch: 18 }, // NUM_LIQUIDACION
            { wch: 16 }, // NUM_OT
            { wch: 18 }, // NUM_MANIFIESTO
            { wch: 30 }, // CLIENTE
            { wch: 24 }, // DESTINO
            { wch: 16 }, // SUBTOTAL_ORDEN
            { wch: 18 }, // MONTO_PRORRATEADO
            { wch: 26 }, // CONCEPTO
            { wch: 16 }, // FECHA_LIQUIDACION
          ];

          const workbook = { Sheets: { DetallesLiquidados: worksheet }, SheetNames: ['DetallesLiquidados'] };
          const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
          this.saveAsExcelFile(excelBuffer, `DetallesLiquidados_${tipo}`);
        });
      },
      error: (err) => {
        console.error('Error exportando detalles liquidados:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Exportar Excel',
          detail: err?.error?.mensaje ?? err?.error?.message ?? 'No se pudieron obtener los detalles liquidados.',
        });
      },
      complete: () => (this.loading = false),
    });
  }

  private applyExcelStyles(worksheet: any): void {
    if (!worksheet || !worksheet['!ref']) return;

    // Auto-filtro en la cabecera
    worksheet['!autofilter'] = { ref: worksheet['!ref'] };

    const range = worksheet['!ref'];
    // xlsx-js-style expone utils.decode_range / encode_cell
    // pero como lo importamos dinámico, evitamos depender del namespace aquí.
    // Implementamos un decode_range mínimo:
    const decodeCol = (col: string) => {
      let n = 0;
      for (let i = 0; i < col.length; i++) n = n * 26 + (col.charCodeAt(i) - 64);
      return n - 1;
    };
    const decodeCell = (addr: string) => {
      const m = addr.match(/^([A-Z]+)(\d+)$/);
      if (!m) return { c: 0, r: 0 };
      return { c: decodeCol(m[1]), r: Number(m[2]) - 1 };
    };
    const encodeCol = (n: number) => {
      let s = '';
      let x = n + 1;
      while (x > 0) {
        const m = (x - 1) % 26;
        s = String.fromCharCode(65 + m) + s;
        x = Math.floor((x - 1) / 26);
      }
      return s;
    };
    const encodeCell = (c: number, r: number) => `${encodeCol(c)}${r + 1}`;
    const [start, end] = String(range).split(':');
    const s = decodeCell(start);
    const e = decodeCell(end);

    const borderThin = {
      top: { style: 'thin', color: { rgb: 'FFBDBDBD' } },
      bottom: { style: 'thin', color: { rgb: 'FFBDBDBD' } },
      left: { style: 'thin', color: { rgb: 'FFBDBDBD' } },
      right: { style: 'thin', color: { rgb: 'FFBDBDBD' } },
    };

    for (let r = s.r; r <= e.r; r++) {
      for (let c = s.c; c <= e.c; c++) {
        const addr = encodeCell(c, r);
        const cell = worksheet[addr];
        if (!cell) continue;

        const isHeader = r === s.r;
        cell.s = {
          border: borderThin,
          alignment: { vertical: 'center', horizontal: isHeader ? 'center' : 'left', wrapText: true },
          font: isHeader
            ? { bold: true, color: { rgb: 'FFFFFFFF' }, sz: 11 }
            : { color: { rgb: 'FF111827' }, sz: 10 },
          fill: isHeader ? { patternType: 'solid', fgColor: { rgb: 'FF1F2937' } } : undefined,
        };
      }
    }
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    import('file-saver').then((FileSaver) => {
      const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
      const EXCEL_EXTENSION = '.xlsx';
      const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
      const saver: any = (FileSaver as any).default ?? FileSaver;
      saver.saveAs(data, `${fileName}_${new Date().getTime()}${EXCEL_EXTENSION}`);

      this.messageService.add({
        severity: 'success',
        summary: 'Exportar Excel',
        detail: 'Archivo Excel exportado correctamente.',
      });
    });
  }

  async exportPdf(): Promise<void> {
    if (!this.liquidaciones || this.liquidaciones.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Exportar PDF',
        detail: 'No hay datos para exportar.',
      });
      return;
    }

    const [jspdfModule, autoTableModule] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
    const jsPDF: any = (jspdfModule as any)?.jsPDF ?? (jspdfModule as any)?.default ?? jspdfModule;

    const resolveAutoTableFn = (m: any): any => {
      if (typeof m === 'function') return m;
      if (m && typeof m.default === 'function') return m.default;
      if (m && typeof m.autoTable === 'function') return m.autoTable;
      // Interop CommonJS -> ESM (a veces viene default dentro de default)
      if (m?.default && typeof m.default.default === 'function') return m.default.default;
      if (m?.default && typeof m.default.autoTable === 'function') return m.default.autoTable;
      return null;
    };

    if (typeof jsPDF !== 'function') {
      this.messageService.add({
        severity: 'error',
        summary: 'Exportar PDF',
        detail: 'No se pudo inicializar el generador PDF (jsPDF).',
      });
      return;
    }

    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    // Primero intentar tomar la función desde el módulo; si no, usar el plugin registrado en el doc
    const autoTable: any =
      resolveAutoTableFn(autoTableModule) ??
      (doc as any)?.autoTable ??
      (jsPDF as any)?.API?.autoTable ??
      null;

    if (typeof autoTable !== 'function') {
      this.messageService.add({
        severity: 'error',
        summary: 'Exportar PDF',
        detail: 'No se pudo inicializar el export a PDF (autoTable).',
      });
      return;
    }
    const fechaExportacion = new Date().toLocaleString('es-PE');

    doc.setFontSize(14);
    doc.text('Liquidaciones Caja Chica', 20, 28);
    doc.setFontSize(9);
    doc.text(`Exportado el: ${fechaExportacion}`, 20, 44);

    const rows = this.buildExportRowsFor(this.liquidaciones ?? []);
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
    const body = rows.map((r: any) => [
      r['#'],
      r['NUM OT'],
      r['F. LIQ.'],
      r['USUARIO'],
      r['CONCEPTO'],
      r['TIPO TRANSF.'],
      r['DESTINATARIO'],
      r['CUENTA'],
      r['N° OPERACIÓN'],
      this.formatMontoPEN(r['MONTO']),
      r['COMP'],
      r['TIPO COMP.'],
      r['RZ. SOCIAL DOC.'],
      r['PROV. DEST.'],
      r['OBS'],
      r['F. REG.'],
    ]);

    autoTable(doc, {
      head,
      body,
      startY: 56,
      theme: 'grid',
      // Fuente más chica + padding menor para dejar aire en bordes y evitar desbordes
      styles: { fontSize: 7, cellPadding: 2, overflow: 'linebreak' },
      headStyles: { fillColor: [55, 65, 81] },
      // Más margen lateral para que no se pegue a los bordes
      margin: { left: 36, right: 36 },
      columnStyles: {
        0: { cellWidth: 60 }, // #
        1: { cellWidth: 60 }, // NUM OT
        2: { cellWidth: 58 }, // F. LIQ.
        3: { cellWidth: 70 }, // USUARIO
        4: { cellWidth: 78 }, // CONCEPTO
        5: { cellWidth: 78 }, // TIPO TRANSF.
        6: { cellWidth: 98 }, // DESTINATARIO
        7: { cellWidth: 72 }, // CUENTA
        8: { cellWidth: 68 }, // N° OPERACIÓN
        9: { cellWidth: 58, halign: 'right' }, // MONTO
        10: { cellWidth: 70 }, // COMP
        11: { cellWidth: 70 }, // TIPO COMP.
        12: { cellWidth: 110 }, // RZ. SOCIAL DOC.
        13: { cellWidth: 78 }, // PROV. DEST.
        14: { cellWidth: 110 }, // OBS
        15: { cellWidth: 78 }, // F. REG.
      },
    });

    const finalY = ((doc as any).lastAutoTable?.finalY ?? 56) + 18;
    doc.setFontSize(10);
    doc.text(`Registros: ${this.totalRegistros}   |   Total monto: ${this.totalMonto.toFixed(2)}`, 20, finalY);

    doc.save(`LiquidacionesCajaChica_${new Date().getTime()}.pdf`);

    this.messageService.add({
      severity: 'success',
      summary: 'Exportar PDF',
      detail: 'Archivo PDF exportado correctamente.',
    });
  }

  async exportPdfSelected(): Promise<void> {
    if (!this.selectedLiquidaciones || this.selectedLiquidaciones.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Exportar PDF',
        detail: 'No hay liquidaciones seleccionadas.',
      });
      return;
    }

    const [jspdfModule, autoTableModule] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
    const jsPDF: any = (jspdfModule as any)?.jsPDF ?? (jspdfModule as any)?.default ?? jspdfModule;

    const resolveAutoTableFn = (m: any): any => {
      if (typeof m === 'function') return m;
      if (m && typeof m.default === 'function') return m.default;
      if (m && typeof m.autoTable === 'function') return m.autoTable;
      // Interop CommonJS -> ESM (a veces viene default dentro de default)
      if (m?.default && typeof m.default.default === 'function') return m.default.default;
      if (m?.default && typeof m.default.autoTable === 'function') return m.default.autoTable;
      return null;
    };

    if (typeof jsPDF !== 'function') {
      this.messageService.add({
        severity: 'error',
        summary: 'Exportar PDF',
        detail: 'No se pudo inicializar el generador PDF (jsPDF).',
      });
      return;
    }

    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const autoTable: any =
      resolveAutoTableFn(autoTableModule) ??
      (doc as any)?.autoTable ??
      (jsPDF as any)?.API?.autoTable ??
      null;

    if (typeof autoTable !== 'function') {
      this.messageService.add({
        severity: 'error',
        summary: 'Exportar PDF',
        detail: 'No se pudo inicializar el export a PDF (autoTable).',
      });
      return;
    }
    const fechaExportacion = new Date().toLocaleString('es-PE');

    doc.setFontSize(14);
    doc.text('Liquidaciones Caja Chica (Seleccionadas)', 20, 28);
    doc.setFontSize(9);
    doc.text(`Exportado el: ${fechaExportacion}`, 20, 44);

    // Debe incluir los mismos campos que el listado.
    const rows = this.buildExportRowsFor(this.selectedLiquidaciones ?? []);
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

    const body = rows.map((r: any) => [
      r['#'],
      r['NUM OT'],
      r['F. LIQ.'],
      r['USUARIO'],
      r['CONCEPTO'],
      r['TIPO TRANSF.'],
      r['DESTINATARIO'],
      r['CUENTA'],
      r['N° OPERACIÓN'],
      this.formatMontoPEN(r['MONTO']),
      r['COMP'],
      r['TIPO COMP.'],
      r['RZ. SOCIAL DOC.'],
      r['PROV. DEST.'],
      r['OBS'],
      r['F. REG.'],
    ]);

    autoTable(doc, {
      head,
      body,
      startY: 56,
      theme: 'grid',
      // Un poco más grande que el PDF general, manteniendo A4 landscape.
      styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
      headStyles: { fillColor: [55, 65, 81] },
      // Más margen lateral para que no se pegue a los bordes
      margin: { left: 36, right: 36 },
      columnStyles: {
        // Ajuste de anchos para que entre en A4 landscape (sin recortes)
        0: { cellWidth: 38 }, // #
        1: { cellWidth: 38 }, // NUM OT
        2: { cellWidth: 37 }, // F. LIQ.
        3: { cellWidth: 44 }, // USUARIO
        4: { cellWidth: 49 }, // CONCEPTO
        5: { cellWidth: 49 }, // TIPO TRANSF.
        6: { cellWidth: 62 }, // DESTINATARIO
        7: { cellWidth: 46 }, // CUENTA
        8: { cellWidth: 43 }, // N° OPERACIÓN
        9: { cellWidth: 37, halign: 'right' }, // MONTO
        10: { cellWidth: 44 }, // COMP
        11: { cellWidth: 44 }, // TIPO COMP.
        12: { cellWidth: 70 }, // RZ. SOCIAL DOC.
        13: { cellWidth: 49 }, // PROV. DEST.
        14: { cellWidth: 70 }, // OBS
        15: { cellWidth: 49 }, // F. REG.
      },
    });

    const totalMonto = this.sumMonto(this.selectedLiquidaciones ?? []);
    const finalY = ((doc as any).lastAutoTable?.finalY ?? 56) + 18;
    doc.setFontSize(10);
    doc.text(`Registros: ${this.selectedCount}   |   Total monto: ${totalMonto.toFixed(2)}`, 20, finalY);

    doc.save(`LiquidacionesCajaChica_Seleccionadas_${new Date().getTime()}.pdf`);

    this.messageService.add({
      severity: 'success',
      summary: 'Exportar PDF',
      detail: 'Archivo PDF exportado correctamente.',
    });
  }

  nueva(): void {
    this.ref = this.dialogService.open(LiquidacionCajaChicaFormComponent, {
      header: 'Nueva liquidación',
      width: '1100px',
      modal: true,
      dismissableMask: true,
      data: { modal: true },
    });

    this.ref.onClose.subscribe((result) => {
      if (result) this.load();
    });
  }

  editar(id: number): void {
    this.ref = this.dialogService.open(LiquidacionCajaChicaFormComponent, {
      header: 'Editar liquidación',
      width: '1100px',
      modal: true,
      dismissableMask: true,
      data: { modal: true, id },
    });

    this.ref.onClose.subscribe((result) => {
      if (result) this.load();
    });
  }

  detalle(id: number): void {
    this.ref = this.dialogService.open(LiquidacionCajaChicaDetailComponent, {
      header: 'Detalle de liquidación',
      width: '1100px',
      modal: true,
      dismissableMask: true,
      data: { modal: true, id },
    });

    this.ref.onClose.subscribe((result) => {
      if (result?.edit && result?.id) {
        this.editar(Number(result.id));
      }
    });
  }

  eliminar(id: number): void {
    this.confirmationService.confirm({
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      message: '¿Está seguro que desea eliminar esta liquidación?',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.comprasService.deleteLiquidacion(id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Compras',
              detail: 'Liquidación eliminada con éxito.',
            });
            this.load();
          },
          error: (err) => {
            console.error('Error eliminando liquidación:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Compras',
              detail: 'No se pudo eliminar la liquidación. Intente nuevamente.',
            });
          },
        });
      },
    });
  }
}

