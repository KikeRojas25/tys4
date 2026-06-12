import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';

import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputMaskModule } from 'primeng/inputmask';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';

import { OrdenTransporteService } from '../../recepcion/ordentransporte/ordentransporte.service';
import { MantenimientoService } from '../../mantenimiento/mantenimiento.service';
import { UploadModalComponent } from '../../recepcion/ordentransporte/seguimientoot/modal.upload';
import { FileModalComponent } from '../../recepcion/ordentransporte/seguimientoot/modalfiles';

interface RetornoRow {
  // Provenientes del SP liquidacion.pa_listarliquidaciondocumentaria
  idordentrabajo: number;
  numcp?: string;
  guiatransportista?: string;
  fecharecojo?: string | Date | null;
  remitente?: string;
  destinatario?: string;
  destino?: string;
  UltimaIncidencia?: string;
  fechadespacho?: string | Date | null;
  iddestino?: number | null;
  conceptocobro?: string;
  idruta?: number | null;
  LeadDocumentario?: number | null;
  fechaentregaconciliacion?: string | Date | null;
  fechaentregareal?: string | Date | null;          // del liquidador (existente)
  fechaentrega?: string | Date | null;              // del conductor (campo)
  idestado?: number | null;                          // estado actual de la OT
  DiasTranscurridos?: number | null;
  Coordinador?: string;
  proveedor?: string;
  estado?: string;

  // Editables localmente
  cam?: string;
  fechaentregarealdocumentario?: Date | string;
  horaentregarealdocumentario?: string;
  estadoentregarealdocumentario?: string;

  /** Switch: el documento no tiene fecha/hora → tomar `fechaentrega` del conductor */
  sinFechaEnDoc?: boolean;
}

@Component({
  selector: 'app-retorno-otspendientes',
  templateUrl: './otspendientes.component.html',
  styleUrls: ['./otspendientes.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIcon,
    ButtonModule,
    CalendarModule,
    ConfirmDialogModule,
    DialogModule,
    DropdownModule,
    DynamicDialogModule,
    InputMaskModule,
    InputSwitchModule,
    InputTextModule,
    TableModule,
    ToastModule,
    TooltipModule
  ],
  providers: [ConfirmationService, MessageService, DialogService]
})
export class OtsPendientesComponent implements OnInit {

  /** Estados en los que la OT ya fue entregada por el conductor en campo. */
  private readonly ESTADOS_ENTREGADA = [12, 21, 34, 35, 38];

  clientes: SelectItem[] = [];
  repartidores: SelectItem[] = [];

  ordenes: RetornoRow[] = [];
  clonedOrdenes: { [k: string]: RetornoRow } = {};

  model: any = {};
  user: any;

  dateInicio: Date = new Date();
  dateFin: Date = new Date();

  tiposEntrega: SelectItem[] = [
    { label: 'Entrega Perfecta', value: 'Entrega Perfecta' },
    { label: 'Entrega Sin Cargo', value: 'Entrega Sin Cargo' },
    { label: 'Rechazo Parcial', value: 'Rechazo Parcial' },
    { label: 'No Entrega', value: 'No Entrega' }
  ];

  constructor(
    private ordenTransporteService: OrdenTransporteService,
    private mantenimientoService: MantenimientoService,
    private messageService: MessageService,
    private dialogService: DialogService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('user') || '{}');

    this.dateInicio = new Date();
    this.dateInicio.setMonth(this.dateInicio.getMonth() - 1);
    this.dateFin = new Date();

    this.model.idcliente = 0;
    this.model.idrepartidor = 0;
    this.model.numcp = '';
    this.model.grr = '';

    this.cargarClientes();
    this.cargarRepartidores();
  }

  private cargarClientes(): void {
    this.clientes = [{ value: 0, label: 'TODOS LOS CLIENTES' }];
    this.mantenimientoService.getAllClientes('', this.user?.usr_int_id ?? 0, true).subscribe({
      next: (resp) => {
        resp.forEach((c: any) => {
          this.clientes.push({ value: c.idCliente, label: c.razonSocial });
        });
      }
    });
  }

  private cargarRepartidores(): void {
    this.repartidores = [{ value: 0, label: 'TODOS LOS REPARTIDORES' }];
    this.mantenimientoService.getAllProveedores('', null).subscribe({
      next: (resp: any[]) => {
        (resp || []).forEach((p: any) => {
          this.repartidores.push({
            value: p.id ?? p.idProveedor,
            label: p.razonSocial ?? p.nombre
          });
        });
      }
    });
  }

  private formatearFecha(d: Date | null | undefined): string | null {
    if (!d) return null;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  buscar(): void {
    this.ordenTransporteService.getRetornoDocumentario({
      grr:               this.model.grr?.trim() || null,
      numcp:             this.model.numcp?.trim() || null,
      idcliente:         this.model.idcliente && this.model.idcliente !== 0 ? this.model.idcliente : null,
      fecini:            this.formatearFecha(this.dateInicio),
      fecfin:            this.formatearFecha(this.dateFin),
      iddestinatario:    null,
      idproveedor:       this.model.idrepartidor && this.model.idrepartidor !== 0 ? this.model.idrepartidor : null,
      diastranscurridos: null
    }).subscribe({
      next: (list: any[]) => {
        this.ordenes = (list || []) as RetornoRow[];
      },
      error: () => {
        this.messageService.add({
          severity: 'error', summary: 'Error',
          detail: 'No se pudieron cargar las órdenes.', life: 3000
        });
      }
    });
  }

  // ===== Cámara (click directo, sin row-edit) =====
  setearCamara(row: RetornoRow, valor: string): void {
    if (!row?.idordentrabajo) return;
    if (row.cam === valor) return;

    this.ordenTransporteService.setCamaraOt(row.idordentrabajo, valor).subscribe({
      next: () => {
        row.cam = valor;
        this.messageService.add({
          severity: 'success', summary: 'Cámara asignada',
          detail: `OT ${row.numcp} ahora usa M${valor}.`, life: 2000
        });
      },
      error: (err) => {
        const msg = err?.error?.message || 'No se pudo asignar la cámara.';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: msg, life: 3500 });
      }
    });
  }

  /**
   * Indica si la OT puede auto-completar fecha/hora desde `fechaentrega` del conductor:
   * - debe estar en uno de los estados ya entregados (12, 21, 34, 35, 38)
   * - y `fechaentrega` debe tener valor.
   */
  puedeAutoCompletarFecha(row: RetornoRow): boolean {
    if (!row) return false;
    if (!row.fechaentrega) return false;
    if (row.idestado == null) return false;
    return this.ESTADOS_ENTREGADA.includes(row.idestado);
  }

  // ===== Edición inline de fila =====
  onRowEditInit(row: RetornoRow): void {
    this.clonedOrdenes[String(row.idordentrabajo)] = { ...row };
    if (row.fechaentregarealdocumentario && typeof row.fechaentregarealdocumentario === 'string') {
      row.fechaentregarealdocumentario = new Date(row.fechaentregarealdocumentario);
    }
    if (row.sinFechaEnDoc === undefined) {
      row.sinFechaEnDoc = false;
    }
  }

  onRowEditCancel(row: RetornoRow, ri: number): void {
    const original = this.clonedOrdenes[String(row.idordentrabajo)];
    if (original) {
      this.ordenes[ri] = original;
      delete this.clonedOrdenes[String(row.idordentrabajo)];
    }
  }

  onRowEditSave(row: RetornoRow): void {
    if (!row?.idordentrabajo) return;

    if (!row.estadoentregarealdocumentario) {
      this.messageService.add({ severity: 'warn', summary: 'Validación', detail: 'Seleccione el tipo de entrega.', life: 3000 });
      return;
    }

    let fecha: Date;

    if (row.sinFechaEnDoc) {
      // Switch ON: tomamos la fecha+hora que registró el conductor.
      // Defensa por si el switch quedó marcado y la OT ya no califica.
      if (!this.puedeAutoCompletarFecha(row)) {
        this.messageService.add({
          severity: 'warn', summary: 'Validación',
          detail: 'La OT aún no está entregada por el conductor; ingrese fecha y hora manualmente.',
          life: 3500
        });
        return;
      }
      fecha = new Date(row.fechaentrega as any);
    } else {
      if (!row.fechaentregarealdocumentario) {
        this.messageService.add({ severity: 'warn', summary: 'Validación', detail: 'Indique la fecha de entrega real.', life: 3000 });
        return;
      }
      if (!row.horaentregarealdocumentario || !/^\d{2}:\d{2}$/.test(row.horaentregarealdocumentario)) {
        this.messageService.add({ severity: 'warn', summary: 'Validación', detail: 'Indique la hora de entrega real (HH:mm).', life: 3000 });
        return;
      }
      fecha = new Date(row.fechaentregarealdocumentario as any);
      const [h, m] = row.horaentregarealdocumentario.split(':').map(Number);
      fecha.setHours(h, m, 0, 0);
    }

    this.ordenTransporteService.setEntregaRealDocumentaria({
      idordentrabajo: row.idordentrabajo,
      fechaentregaReal: fecha,
      estadoentregaReal: row.estadoentregarealdocumentario,
      idusuario: this.user?.id ?? this.user?.usr_int_id ?? 0
    }).subscribe({
      next: () => {
        row.fechaentregarealdocumentario = fecha;
        row.fechaentregaconciliacion = fecha;   // backend actualiza ambos; reflejamos en grilla
        row.horaentregarealdocumentario =
          String(fecha.getHours()).padStart(2, '0') + ':' + String(fecha.getMinutes()).padStart(2, '0');
        row.cam = undefined;
        delete this.clonedOrdenes[String(row.idordentrabajo)];
        this.messageService.add({
          severity: 'success', summary: 'Entrega registrada',
          detail: `OT ${row.numcp} actualizada.`, life: 2500
        });
      },
      error: (err) => {
        const msg = err?.error?.message || 'No se pudo registrar la entrega real.';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: msg, life: 3500 });
      }
    });
  }

  // ===== Utilidades =====
  verot(id: number | null | undefined): void {
    if (!id) return;
    const url = `http://104.36.166.65/webreports/ot.aspx?idorden=${id}`;
    window.open(url, '_blank');
  }

  cargarfiles(id: number | null | undefined): void {
    if (!id) return;
    this.dialogService.open(UploadModalComponent, {
      header: 'Cargar Fotos', width: '70%', data: { id }
    });
  }

  verarchivos(id: number | null | undefined): void {
    if (!id) return;
    this.dialogService.open(FileModalComponent, {
      header: 'Visor Fotos', width: '30%', data: { id }
    });
  }

  exportarExcel(): void {
    if (!this.ordenes?.length) {
      this.messageService.add({ severity: 'warn', summary: 'Sin datos', detail: 'No hay órdenes para exportar.', life: 3000 });
      return;
    }

    import('xlsx').then((xlsx: any) => {
      const XLSX: any = xlsx?.default ?? xlsx;
      const data = this.ordenes.map(r => ({
        OT: r.numcp,
        'Guía Transp.': r.guiatransportista || '',
        Remitente: r.remitente || '',
        Destinatario: r.destinatario || '',
        Destino: r.destino || '',
        Estado: r.estado || '',
        Cámara: r.cam ? 'M' + r.cam : '',
        'F. Recojo':           r.fecharecojo            ? new Date(r.fecharecojo).toLocaleDateString('es-PE') : '',
        'F. Despacho':         r.fechadespacho          ? new Date(r.fechadespacho).toLocaleDateString('es-PE') : '',
        'F. Entrega (Conductor)': r.fechaentrega ? new Date(r.fechaentrega).toLocaleString('es-PE') : '',
        'F. Entrega Doc (Liquidador)': r.fechaentregareal ? new Date(r.fechaentregareal).toLocaleDateString('es-PE') : '',
        'F. Conciliación':     r.fechaentregaconciliacion ? new Date(r.fechaentregaconciliacion).toLocaleDateString('es-PE') : '',
        'F. Entrega Real Doc': r.fechaentregarealdocumentario ? new Date(r.fechaentregarealdocumentario as any).toLocaleString('es-PE') : '',
        'Tipo Entrega Doc': r.estadoentregarealdocumentario || '',
        'Sin Fecha en Doc': r.sinFechaEnDoc ? 'Sí' : 'No',
        'Lead Documentario': r.LeadDocumentario ?? '',
        'Días Transcurridos': r.DiasTranscurridos ?? '',
        Coordinador: r.Coordinador || '',
        Repartidor: r.proveedor || '',
        'Última Incidencia': r.UltimaIncidencia || ''
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = { Sheets: { OTsPendientes: ws }, SheetNames: ['OTsPendientes'] };
      const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      import('file-saver').then((FileSaver: any) => {
        const saver = FileSaver?.default ?? FileSaver;
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
        saver.saveAs(blob, `OTsPendientesCargo_${new Date().getTime()}.xlsx`);
      });
    });
  }
}
