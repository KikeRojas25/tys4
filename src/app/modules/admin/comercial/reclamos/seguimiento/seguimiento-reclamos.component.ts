import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import moment from 'moment';
import { MantenimientoService } from '../../../mantenimiento/mantenimiento.service';
import { ReclamoService } from '../reclamo.service';
import {
  CambiarEstadoPayload,
  Reclamo,
  ReclamoArea,
  ReclamoEstado,
  ReclamoEstadoCodigo,
  ReclamoHistorial,
} from '../reclamo.types';

@Component({
  selector: 'app-seguimiento-reclamos',
  standalone: true,
  templateUrl: './seguimiento-reclamos.component.html',
  styleUrls: ['./seguimiento-reclamos.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatIconModule,
    ButtonModule,
    CalendarModule,
    ConfirmDialogModule,
    DialogModule,
    DropdownModule,
    InputTextModule,
    InputTextareaModule,
    TableModule,
    TagModule,
    ToastModule,
    TooltipModule,
  ],
  providers: [MessageService, ConfirmationService],
})
export class SeguimientoReclamosComponent implements OnInit {
  /** Si se renderiza embebido en otra pantalla, oculta header y breadcrumb. */
  @Input() embedded = false;
  /** Cliente preseleccionado cuando se usa embebido. */
  @Input() idClienteEmbed: number | null = null;

  user: any;

  // ── Catálogos / filtros ──────────────────────────────────────
  clientes: SelectItem[] = [];
  areasOpts: SelectItem[] = [];
  estadosOpts: SelectItem[] = [];
  estadosCatalogo: ReclamoEstado[] = [];
  areasCatalogo: ReclamoArea[] = [];

  filtros = {
    idcliente: null as number | null,
    idarea:    null as number | null,
    idestado:  null as number | null,
    fechaDesde: null as Date | null,
    fechaHasta: null as Date | null,
  };

  // ── Listado ──────────────────────────────────────────────────
  reclamos: Reclamo[] = [];
  loading = false;

  // ── Detalle / historial ──────────────────────────────────────
  detalleVisible = false;
  loadingDetalle = false;
  reclamoSel: Reclamo | null = null;
  historial: ReclamoHistorial[] = [];

  // ── Diálogo cambio de estado ─────────────────────────────────
  cambioEstadoVisible = false;
  cambioEstadoModel: { estado_codigo: ReclamoEstadoCodigo | null; comentario: string } = {
    estado_codigo: null,
    comentario: '',
  };
  estadosDisponibles: SelectItem[] = [];
  cambiando = false;

  constructor(
    private reclamoService: ReclamoService,
    private mantenimientoService: MantenimientoService,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {}

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('user') ?? 'null');
    // Defaults: últimos 30 días
    this.filtros.fechaDesde = moment().subtract(30, 'days').startOf('day').toDate();
    this.filtros.fechaHasta = moment().endOf('day').toDate();

    // Pre-selección por @Input (modo embedded) o por query param (?idcliente=N)
    if (this.embedded && this.idClienteEmbed && this.idClienteEmbed > 0) {
      this.filtros.idcliente = this.idClienteEmbed;
    } else {
      const idClienteParam = Number(this.route.snapshot.queryParamMap.get('idcliente'));
      if (idClienteParam > 0) this.filtros.idcliente = idClienteParam;
    }

    this.cargarCatalogo();
    this.cargarClientes();
  }

  cargarCatalogo(): void {
    this.reclamoService.catalogo().subscribe({
      next: (cat) => {
        this.areasCatalogo = cat.areas;
        this.estadosCatalogo = cat.estados;
        this.areasOpts = [
          { value: null, label: 'Todas las áreas' },
          ...cat.areas.map(a => ({ value: a.idarea, label: a.nombre })),
        ];
        this.estadosOpts = [
          { value: null, label: 'Todos los estados' },
          ...cat.estados.map(e => ({ value: e.idestado, label: e.nombre })),
        ];
        this.buscar();
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el catálogo' }),
    });
  }

  cargarClientes(): void {
    this.mantenimientoService.getAllClientes('', this.user?.id ?? 2, true).subscribe({
      next: (cs) => {
        this.clientes = [
          { value: null, label: 'Todos los clientes' },
          ...cs.map((c: any) => ({ value: c.idCliente, label: c.razonSocial ?? '' })),
        ];
      },
      error: () => {},
    });
  }

  buscar(): void {
    this.loading = true;
    this.reclamoService.listar({
      idcliente:  this.filtros.idcliente,
      idarea:     this.filtros.idarea,
      idestado:   this.filtros.idestado,
      fechaDesde: this.filtros.fechaDesde ? moment(this.filtros.fechaDesde).format('YYYY-MM-DD') : null,
      fechaHasta: this.filtros.fechaHasta ? moment(this.filtros.fechaHasta).format('YYYY-MM-DD') : null,
    }).subscribe({
      next: (data) => { this.reclamos = data ?? []; this.loading = false; },
      error: () => { this.reclamos = []; this.loading = false;
                     this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el listado' }); },
    });
  }

  limpiarFiltros(): void {
    this.filtros = { idcliente: null, idarea: null, idestado: null,
                     fechaDesde: moment().subtract(30, 'days').startOf('day').toDate(),
                     fechaHasta: moment().endOf('day').toDate() };
    this.buscar();
  }

  verDetalle(r: Reclamo): void {
    this.reclamoSel = r;
    this.historial = [];
    this.detalleVisible = true;
    this.loadingDetalle = true;
    this.reclamoService.obtener(r.idreclamo).subscribe({
      next: (det) => {
        this.reclamoSel = det.reclamo;
        this.historial = det.historial ?? [];
        this.loadingDetalle = false;
      },
      error: () => {
        this.loadingDetalle = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el detalle' });
      },
    });
  }

  abrirCambioEstado(): void {
    if (!this.reclamoSel) return;
    const actual = this.reclamoSel.estado_codigo;
    this.estadosDisponibles = this.estadosCatalogo
      .filter(e => e.codigo !== actual)
      .map(e => ({ value: e.codigo, label: e.nombre }));
    this.cambioEstadoModel = { estado_codigo: null, comentario: '' };
    this.cambioEstadoVisible = true;
  }

  confirmarCambioEstado(): void {
    if (!this.reclamoSel) return;
    if (!this.cambioEstadoModel.estado_codigo) {
      this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'Seleccione el nuevo estado' });
      return;
    }
    const payload: CambiarEstadoPayload = {
      estado_codigo: this.cambioEstadoModel.estado_codigo,
      comentario:    (this.cambioEstadoModel.comentario || '').trim() || null,
      idusuario:     this.user?.id ?? 0,
    };
    this.cambiando = true;
    this.reclamoService.cambiarEstado(this.reclamoSel.idreclamo, payload).subscribe({
      next: () => {
        this.cambiando = false;
        this.cambioEstadoVisible = false;
        this.messageService.add({ severity: 'success', summary: 'Estado actualizado', detail: 'El reclamo cambió de estado correctamente' });
        // Refresh detalle + listado
        if (this.reclamoSel) this.verDetalle(this.reclamoSel);
        this.buscar();
      },
      error: () => {
        this.cambiando = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cambiar el estado' });
      },
    });
  }

  severidadEstado(codigo?: string | null): 'info' | 'warning' | 'success' | 'danger' | 'secondary' {
    switch (codigo) {
      case 'registrado':  return 'info';
      case 'en-atencion': return 'warning';
      case 'resuelto':    return 'success';
      case 'descartado':  return 'danger';
      default:             return 'secondary';
    }
  }
}
