import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MessageService, SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService } from 'primeng/dynamicdialog';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ReporteService } from '../reporte.service';
import { MantenimientoService } from '../../mantenimiento/mantenimiento.service';
import { User } from 'app/core/user/user.types';

interface PivotProvincia {
  provincia: string;
  valoresPorMes: { [mes: string]: number };
  total: number;
}

interface PivotDepartamento {
  departamento: string;
  provincias: PivotProvincia[];
  totalesPorMes: { [mes: string]: number };
  total: number;
}

interface PivotCliente {
  cliente: string;
  departamentos: PivotDepartamento[];
  totalesPorMes: { [mes: string]: number };
  total: number;
}

interface PivotResult {
  tipo: string;
  meses: string[];
  totalesPorMes: { [mes: string]: number };
  totalGeneral: number;
  clientes: PivotCliente[];
}

@Component({
  selector: 'app-produccioncliente',
  templateUrl: './produccioncliente.component.html',
  styleUrls: ['./produccioncliente.component.css'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ButtonModule,
    MatIcon,
    DropdownModule,
    CalendarModule,
    ToastModule,
    ProgressSpinnerModule,
  ],
  providers: [DialogService, MessageService],
})
export class ProduccionclienteComponent implements OnInit {
  clientes: SelectItem[] = [];
  unidadesMedida: SelectItem[] = [];

  model: any = {};
  user: User;
  es: any;

  dateInicio: Date = new Date(Date.now());
  dateFin: Date = new Date(Date.now());

  loading = false;
  loadingExcel = false;
  loadingPdf = false;

  pivot: PivotResult | null = null;

  constructor(
    private reporteService: ReporteService,
    private mantenimientoService: MantenimientoService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('user'));

    this.unidadesMedida = [
      { value: 1, label: 'Bulto' },
      { value: 2, label: 'Peso' },
      { value: 3, label: 'Valor' },
    ];
    this.model.idunidadmedida = null;

    this.mantenimientoService.getAllClientes('', this.user?.id, true).subscribe((resp) => {
      this.clientes = [{ value: '0', label: 'TODOS LOS CLIENTES' }];
      (resp ?? []).forEach((c) => {
        this.clientes.push({ value: c.idCliente, label: c.razonSocial });
      });
      this.model.idcliente = '0';
    });

    this.es = {
      firstDayOfWeek: 1,
      dayNames: ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'],
      dayNamesShort: ['dom','lun','mar','mié','jue','vie','sáb'],
      dayNamesMin: ['D','L','M','X','J','V','S'],
      monthNames: ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'],
      monthNamesShort: ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'],
      today: 'Hoy',
      clear: 'Borrar',
    };
  }

  private validarFiltros(): boolean {
    if (!this.dateInicio || !this.dateFin) {
      this.messageService.add({ severity: 'warn', summary: 'Filtro de búsqueda', detail: 'Seleccione un rango de fechas (Inicio y Fin).' });
      return false;
    }
    const unidad = Number(this.model?.idunidadmedida);
    if (!Number.isFinite(unidad) || unidad <= 0) {
      this.messageService.add({ severity: 'warn', summary: 'Filtro de búsqueda', detail: 'Seleccione una unidad de medida.' });
      return false;
    }
    return true;
  }

  private getParametros(): { idcliente: number | null; fecini: string; fecfin: string; unidad: number } {
    const idclienteRaw = this.model?.idcliente;
    const idcliente =
      idclienteRaw === undefined || idclienteRaw === '0' || idclienteRaw === 0
        ? null
        : Number(idclienteRaw);
    return {
      idcliente,
      fecini: this.formatFecha(this.dateInicio),
      fecfin: this.formatFecha(this.dateFin),
      unidad: Number(this.model.idunidadmedida),
    };
  }

  private formatFecha(d: Date): string {
    const dd = ('0' + d.getDate()).slice(-2);
    const mm = ('0' + (d.getMonth() + 1)).slice(-2);
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  buscar(): void {
    if (!this.validarFiltros()) return;
    const { idcliente, fecini, fecfin, unidad } = this.getParametros();

    this.loading = true;
    this.pivot = null;

    this.reporteService.getProduccionPorCliente(idcliente, fecini, fecfin, unidad).subscribe({
      next: (data) => {
        this.pivot = data as unknown as PivotResult;
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Se encontraron ${this.pivot?.clientes?.length ?? 0} clientes.`,
        });
      },
      error: (err) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message || 'No se pudo obtener el reporte.',
        });
      },
    });
  }

  descargarExcel(): void {
    if (!this.validarFiltros()) return;
    const { idcliente, fecini, fecfin, unidad } = this.getParametros();
    this.loadingExcel = true;
    this.reporteService.descargarProduccionPorClienteExcel(idcliente, fecini, fecfin, unidad).subscribe({
      next: (blob) => {
        this.guardarArchivo(blob, `ProduccionPorCliente_${Date.now()}.xlsx`);
        this.loadingExcel = false;
        this.messageService.add({ severity: 'success', summary: 'Excel descargado', detail: 'El archivo se descargó correctamente.' });
      },
      error: () => {
        this.loadingExcel = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo generar el Excel.' });
      },
    });
  }

  descargarPdf(): void {
    if (!this.validarFiltros()) return;
    const { idcliente, fecini, fecfin, unidad } = this.getParametros();
    this.loadingPdf = true;
    this.reporteService.descargarProduccionPorClientePdf(idcliente, fecini, fecfin, unidad).subscribe({
      next: (blob) => {
        this.guardarArchivo(blob, `ProduccionPorCliente_${Date.now()}.pdf`);
        this.loadingPdf = false;
        this.messageService.add({ severity: 'success', summary: 'PDF descargado', detail: 'El archivo se descargó correctamente.' });
      },
      error: () => {
        this.loadingPdf = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo generar el PDF.' });
      },
    });
  }

  private guardarArchivo(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // Helpers usados desde el template
  valorMes(map: { [k: string]: number } | undefined, mes: string): number {
    if (!map) return 0;
    const v = map[mes];
    return v == null ? 0 : v;
  }

  rowSpanCliente(c: PivotCliente): number {
    // 1 fila de cabecera con totales del cliente +
    // para cada dpto: N provincias + 1 fila "Total" del dpto
    let n = 1;
    for (const d of c.departamentos) {
      n += d.provincias.length + 1;
    }
    return Math.max(n, 1);
  }

  rowSpanDpto(d: PivotDepartamento): number {
    return d.provincias.length + 1;
  }
}
