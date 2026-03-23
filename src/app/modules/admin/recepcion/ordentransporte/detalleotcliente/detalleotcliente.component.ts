import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { OrdenTransporte } from '../ordentransporte.types';
import { User } from 'app/core/user/user.types';
import { OrdenTransporteService } from '../ordentransporte.service';
import { DialogService } from 'primeng/dynamicdialog';
import { FileModalComponent } from '../seguimientoot/modalfiles';

interface EventItem {
  status?: string;
  dateRegister?: string;
  dateEvent?: string;
  user?: string;
  icon?: string;
  color?: string;
}

type EventActionType =
  | 'ot-creada'
  | 'ot-planificada'
  | 'manifiesto-hr'
  | 'ot-despachada'
  | 'en-zona'
  | 'en-reparto'
  | 'entrega-ok'
  | 'none';

interface EventRow {
  dateRegister?: string | Date;
  dateEvent?: string | Date;
  user?: string;
  status?: string;
}

interface ActionConfig {
  type: EventActionType;
  title: string;
  payload?: any;
}

@Component({
  selector: 'app-detalleotcliente',
  templateUrl: './detalleotcliente.component.html',
  styleUrls: ['./detalleotcliente.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    CalendarModule,
    DialogModule,
    ToastModule,
    MatIcon,
    RouterModule
  ],
  providers: [MessageService, DialogService]
})
export class DetalleotclienteComponent implements OnInit {

  ordenes: OrdenTransporte[] = [];
  loading = false;
  model: any = {};
  cols: any[] = [];
  user: User;
  idcliente: number;
  clienteNombre = '';
  dateInicio: Date = new Date(Date.now());
  dateFin: Date = new Date(Date.now());

  events: EventItem[] = [];
  ordenTransporte: any = {};
  guias: any[] = [];
  dialoglifecycle = false;
  actionDialogVisible = false;
  currentAction: ActionConfig | null = null;

  constructor(
    private ordenTransporteService: OrdenTransporteService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('user'));
    const qp = this.route.snapshot.queryParams;
    const idc = qp['idcliente'];
    this.clienteNombre = qp['cliente'] || '';

    if (idc == null || idc === '' || isNaN(Number(idc))) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Cliente no especificado',
        detail: 'No se encontró el cliente. Redirigiendo al integrado comercial.'
      });
      this.router.navigate(['/seguimientoot/integradocomercial']);
      return;
    }

    this.idcliente = Number(idc);
    this.model.idcliente = this.idcliente;
    this.model.idusuario = this.user?.usr_int_id ?? this.user?.id;
    this.model.idestado = '34,35'; // TODOS LOS ESTADOS
    this.model.numcp = '';
    this.model.referencia = '';
    this.model.nummanifiesto = '';
    this.model.numhojaruta = '';
    this.model.tipoorden = '';

    this.dateInicio.setDate((new Date()).getDate() - 7);
    this.dateFin.setDate((new Date()).getDate());

    this.cols = [
      { header: 'ACC', field: 'numcp', width: '120px' },
      { header: 'DESTINO / DEST.', field: 'destino', width: '200px' },
      { header: 'OT', field: 'numcp', width: '120px' },
      { header: 'F. RECOJO', field: 'fecharecojo', width: '100px' },
      { header: 'F. DESPACHO', field: 'fechadespacho', width: '100px' },
      { header: 'F. ENTREGA', field: 'fechaentrega', width: '100px' },
      { header: 'ESTACIÓN', field: 'estacionorigen', width: '140px' },
      { header: 'ESTADO', field: 'estado', width: '100px' },
      { header: 'SUB-ESTADO', field: 'subestado', width: '120px' },
      { header: 'ORIGEN', field: 'origen', width: '100px' },
      { header: 'SUB TOTAL', field: 'subtotal', width: '90px' },
      { header: 'MANIF.', field: 'nummanifiesto', width: '100px' },
      { header: 'HOJA RUTA', field: 'numhojaruta', width: '100px' },
      { header: 'CANT', field: 'cantidad', width: '70px' },
      { header: 'PESO', field: 'peso', width: '80px' },
      { header: 'VOL', field: 'pesovol', width: '80px' }
    ];

    this.buscar();
  }

  volver(): void {
    this.router.navigate(['/seguimientoot/integradocomercial']);
  }

  buscar(): void {
    if (this.dateInicio && this.dateFin) {
      const fechaInicio = new Date(this.dateInicio);
      const fechaFin = new Date(this.dateFin);
      const mesesDiferencia = (fechaFin.getFullYear() - fechaInicio.getFullYear()) * 12 +
        (fechaFin.getMonth() - fechaInicio.getMonth());
      if (mesesDiferencia > 2) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Rango de fechas inválido',
          detail: 'El rango de búsqueda no puede exceder 2 meses.'
        });
        return;
      }
      if (fechaInicio > fechaFin) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Rango de fechas inválido',
          detail: 'La fecha de inicio no puede ser mayor que la fecha de fin.'
        });
        return;
      }
    }

    this.model.fecinicio = this.dateInicio;
    this.model.fecfin = this.dateFin;
    this.loading = true;

    this.ordenTransporteService.getAllOrder(this.model).subscribe({
      next: (list) => {
        this.ordenes = list || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar el listado de OTs.'
        });
      }
    });
  }

  verot(id: number): void {
    this.router.navigate(['/seguimientoot/detalleot', id]);
  }

  verarchivos(id: number): void {
    this.dialogService.open(FileModalComponent, {
      header: 'Archivos de la OT',
      width: '90vw',
      data: { id }
    });
  }

  vertracking(idordentransporte: number): void {
    this.ordenTransporteService.getEventos(idordentransporte).subscribe(list => {
      const eventos = list || [];
      this.events = [];
      this.ordenTransporteService.getOrden(idordentransporte).subscribe(ot => {
        this.ordenTransporte = ot?.ordenTransporte || {};
        this.guias = ot?.guias || [];
        eventos.forEach(x => {
          this.events.push({
            status: x.evento,
            dateRegister: x.fechaRegistro,
            dateEvent: x.fechaEvento,
            user: x.usuario === 'ADMIN ADMIN' ? 'CHATBOT' : x.usuario,
            icon: 'pi pi-shopping-cart',
            color: '#9C27B0'
          });
        });
        this.dialoglifecycle = true;
      });
    });
  }

  vernummanifiesto(nummanifiesto: string): void {
    if (!nummanifiesto) return;
    const idmanifiesto = nummanifiesto.split('-')[1];
    const url = 'http://104.36.166.65/webreports/manifiesto.aspx?idmanifiesto=' + String(idmanifiesto);
    window.open(url);
  }

  private normalizeStatus(txt: string): EventActionType {
    if (!txt) return 'none';
    const t = txt.toLowerCase();
    if (t.includes('creada')) return 'ot-creada';
    if (t.includes('planificada')) return 'ot-planificada';
    if (t.includes('manifiesto') || t.includes('hoja ruta') || t.includes('hr generado')) return 'manifiesto-hr';
    if (t.includes('despachada')) return 'ot-despachada';
    if (t.includes('en zona')) return 'en-zona';
    if (t.includes('en reparto')) return 'en-reparto';
    if (t.includes('entrega') && (t.includes('conforme') || t.includes('(ok)'))) return 'entrega-ok';
    return 'none';
  }

  openEventAction(row: EventRow): void {
    const type = this.normalizeStatus(row.status || '');
    if (type === 'ot-creada') {
      const url = `http://104.36.166.65/webreports/ot.aspx?idorden=${this.ordenTransporte.idordentrabajo}`;
      window.open(url, '_blank');
      return;
    }
    if (type === 'manifiesto-hr') {
      const url = 'http://104.36.166.65/webreports/manifiesto.aspx?idmanifiesto=' + String(this.ordenTransporte.idManifiesto);
      window.open(url, '_blank');
      return;
    }
    if (type === 'entrega-ok') {
      this.dialogService.open(FileModalComponent, {
        header: 'Visor Fotos',
        width: '30%',
        data: { id: this.ordenTransporte.idordentrabajo }
      });
      return;
    }
    const baseTitle = row.status || 'Acción';
    const titleMap: Record<EventActionType, string> = {
      'ot-creada': 'Detalles de creación',
      'ot-planificada': 'Planificación',
      'manifiesto-hr': 'Manifiesto / Hoja de Ruta',
      'ot-despachada': 'Despacho',
      'en-zona': 'En Zona',
      'en-reparto': 'En Reparto',
      'entrega-ok': 'Entrega conforme',
      'none': baseTitle
    };
    this.currentAction = {
      type,
      title: titleMap[type] || baseTitle,
      payload: { row, ot: this.ordenTransporte }
    };
    this.actionDialogVisible = true;
  }

  executeAction(action: string): void {
    switch (action) {
      case 'view-basic':
        this.router.navigate(['/seguimientoot/detalleot', this.ordenTransporte?.idordentrabajo]);
        break;
      case 'open-pod':
      case 'download-evidence':
      case 'view-despacho':
      case 'open-map':
      case 'contact-driver':
      default:
        break;
    }
  }
}
