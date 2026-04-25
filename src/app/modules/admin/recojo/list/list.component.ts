import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService, MenuItem, SelectItem } from 'primeng/api';
import { DialogService, DynamicDialogRef, DynamicDialogModule } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import { MatIconModule } from '@angular/material/icon';

import { RecojoService } from '../recojo.service';
import { MantenimientoService } from '../../mantenimiento/mantenimiento.service';

import { OrdenTransporte } from '../../recepcion/ordentransporte/ordentransporte.types';
import { User } from 'app/core/user/user.types';
import { Usuario } from '../recojo.types';
import { DetalleOrdenModalComponent } from './detalle-orden-modal.component';
import { ModalSeleccionarProveedorComponent } from './modal-seleccionar-proveedor.component';
import { forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ConfirmDialogModule,
    InputTextModule,
    MatIconModule,
    DynamicDialogModule,
    MessageModule,
    ToastModule,
    CalendarModule,
    DropdownModule,
    TooltipModule,
  ],
  providers: [ConfirmationService, DialogService, MessageService],
})
export class listarOrdenRecojoComponent implements OnInit {
  // ===========================
  // 🔹 Variables principales
  // ===========================
  clientes: SelectItem[] = [];
  ubigeo: SelectItem[] = [];
  estados: SelectItem[] = [];
  usuariosRol: SelectItem[] = [];

  ordenes: OrdenTransporte[] = [];
  selected: OrdenTransporte[] = [];

  model: any = {};
  user: User;

  // ===========================
  // 🔹 Configuración UI
  // ===========================
  cols: any[] = [];
  es: any;
  items: MenuItem[];
  loading = false;
  ref: DynamicDialogRef;
  imageToShow: any;

  // ===========================
  // 🔹 Fechas
  // ===========================
  dateInicio: Date = new Date();
  dateFin: Date = new Date();

  // ===========================
  // 🔹 Constructor
  // ===========================
  constructor(
    private orderRecojoService: RecojoService,
    private mantenimientoService: MantenimientoService,
    
    private router: Router,
    private dialogService: DialogService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  // ===========================
  // 🔹 Inicialización
  // ===========================
  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('user'));
    this.initFechas();
    this.initColumnas();
    this.initCalendario();
    this.initMenus();
    this.cargarDatosIniciales();
  }

  // ===========================
  // 📅 Inicialización de fechas
  // ===========================
  private initFechas(): void {
    this.dateInicio.setDate(new Date().getDate() - 7);
    this.dateFin = new Date();
  }

  // ===========================
  // 📋 Configuración de columnas
  // ===========================
  private initColumnas(): void {
    this.cols = [
      { header: 'ACC', field: '', width: '90px' },
      { header: 'OR', field: 'numcp', width: '90px' },
      { header: 'CLIENTE', field: 'razonsocial', width: '140px' },
      { header: 'F. REGISTRO', field: 'fecharegistro', width: '120px' },
      { header: 'F. CITA', field: 'fechahoracita', width: '120px' },
      { header: 'PROVINCIA', field: 'provinciaorigen', width: '110px' },
      { header: 'ESTADO', field: 'estado', width: '120px' },
      
      { header: 'PT. RECOJO', field: 'puntorecojo', width: '170px' },
      { header: 'CE. ACOPIO', field: 'centroacopio', width: '90px' },
      { header: 'BULTOS', field: 'bulto', width: '60px' },
      { header: 'PESO', field: 'peso', width: '60px' },
      { header: 'VOL', field: 'pesovol', width: '60px' },
      { header: 'OTR', field: 'otauxiliar', width: '120px' },
      { header: 'OBSERVACIÓN', field: 'observaciones', width: '280px' },
      { header: 'RESPONSABLE', field: 'responsable', width: '150px' },
      { header: 'PROVEEDOR', field: 'proveedor', width: '250px' },  
    ];
  }

  // ===========================
  // 🗓️ Configuración calendario
  // ===========================
  private initCalendario(): void {
    this.es = {
      firstDayOfWeek: 1,
      dayNames: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
      dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
      dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
      monthNames: [
        'enero',
        'febrero',
        'marzo',
        'abril',
        'mayo',
        'junio',
        'julio',
        'agosto',
        'septiembre',
        'octubre',
        'noviembre',
        'diciembre',
      ],
      today: 'Hoy',
      clear: 'Borrar',
    };
  }

  // ===========================
  // ⚙️ Menú contextual
  // ===========================
  private initMenus(): void {
    this.items = [
      { label: 'Actualizar', icon: 'pi pi-refresh' },
      { label: 'Eliminar', icon: 'pi pi-times' },
      { separator: true },
      { label: 'Setup', icon: 'pi pi-cog', routerLink: ['/setup'] },
    ];
  }

  // ===========================
  // 🚀 Cargar datos iniciales
  // ===========================
  private cargarDatosIniciales(): void {
    this.model.idusuario = this.user?.id;

    // Cargar estados (síncrono)
    this.cargarEstados();

    // Cargar datos asíncronos y luego ejecutar búsqueda
    forkJoin({
      clientes: this.mantenimientoService.getAllClientes('', this.model.idusuario, true),
      ubigeo: this.orderRecojoService.getUbigeo(''),
      usuarios: this.orderRecojoService.getUsuariosPorRol(14),
    }).subscribe({
      next: (resultados) => {
        // Procesar clientes
        this.clientes = [{ value: 0, label: 'TODOS LOS CLIENTES' }];
        resultados.clientes.forEach((c) => this.clientes.push({ value: c.idCliente, label: c.razonSocial }));
        this.model.idcliente = 0;
        this.model.numcp = '';

        // Procesar ubigeo
        this.ubigeo = [{ value: 0, label: 'TODOS LOS DESTINOS' }];
        resultados.ubigeo.forEach((u) => this.ubigeo.push({ value: u.idDistrito, label: u.ubigeo }));
        this.model.iddistrito = 0;

        // Procesar usuarios
        this.usuariosRol = resultados.usuarios.map((u) => ({
          value: u.usr_int_id,
          label: `${u.usr_str_nombre} ${u.usr_str_apellidos}`,
        }));

        // Ejecutar búsqueda automática después de cargar todos los datos
        this.buscar();
      },
      error: (err) => {
        console.error('Error cargando datos iniciales:', err);
        // Intentar búsqueda incluso si hay errores
        this.buscar();
      },
    });
  }

  private cargarEstados(): void {
    this.estados = [
      { value: 0, label: 'TODOS LOS ESTADOS' },
      { value: 26, label: 'Registrado' },
      { value: 27, label: 'Programado' },
      { value: 28, label: 'Liquidado' },
    ];
    this.model.idestado = 0;
  }

  // ===========================
  // 🔍 Buscar órdenes
  // ===========================
  buscar(): void {
    this.model.fec_ini = this.dateInicio;
    this.model.fec_fin = this.dateFin;

    this.loading = true;
    this.orderRecojoService.getAllOrderRecojo(this.model).subscribe({
      next: (resp) => (this.ordenes = resp),
      error: (err) => console.error(err),
      complete: () => (this.loading = false),
    });
  }

  // ===========================
  // 🧾 Exportar Excel
  // ===========================
  exportExcel(): void {
    if (!this.ordenes || this.ordenes.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Exportar Excel',
        detail: 'No hay datos para exportar.',
      });
      return;
    }

    import('xlsx').then((xlsx: any) => {
      const XLSX: any = xlsx?.default ?? xlsx;
      const exportData = this.ordenes.map((orden: any) => ({
        OR: orden.numcp || '',
        Cliente: orden.razonsocial || '',
        'F. Registro': orden.fecharegistro
          ? new Date(orden.fecharegistro).toLocaleString('es-PE', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })
          : '',
        'F. Cita': orden.fechahoracita
          ? new Date(orden.fechahoracita).toLocaleString('es-PE', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })
          : '',
        Estado: orden.estado || '',
        Contacto: orden.personarecojo || '',
        'Pt. Recojo': orden.puntorecojo || '',
        'Ce. Acopio': orden.centroacopio || '',
        Bultos: orden.bulto || 0,
        Peso: orden.peso ? Number(orden.peso).toFixed(2) : '0.00',
        Vol: orden.pesovol ? Number(orden.pesovol).toFixed(2) : '0.00',
        Observación: orden.observaciones || '',
        Responsable: orden.responsable || '',
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Establecer ancho de columnas
      const columnWidths = [
        { wch: 10 }, // OR
        { wch: 30 }, // Cliente
        { wch: 18 }, // F. Registro
        { wch: 18 }, // F. Cita
        { wch: 20 }, // Estado
        { wch: 20 }, // Contacto
        { wch: 30 }, // Pt. Recojo
        { wch: 20 }, // Ce. Acopio
        { wch: 10 }, // Bultos
        { wch: 12 }, // Peso
        { wch: 12 }, // Vol
        { wch: 40 }, // Observación
        { wch: 20 }, // Responsable
      ];
      worksheet['!cols'] = columnWidths;

      const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, 'ListadoRecojos');
    });
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    import('file-saver').then((FileSaver) => {
      const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
      const EXCEL_EXTENSION = '.xlsx';
      const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
      // En producción (build optimizado), `import('file-saver')` puede exponer `saveAs`
      // en `module.default` (o incluso `default.default`). Normalizamos para ambos casos.
      const saver: any =
        (FileSaver as any)?.saveAs
          ? FileSaver
          : (FileSaver as any)?.default?.saveAs
            ? (FileSaver as any).default
            : (FileSaver as any)?.default?.default?.saveAs
              ? (FileSaver as any).default.default
              : null;

      if (!saver?.saveAs) {
        console.error('No se encontró saveAs en file-saver (export inesperado).', FileSaver);
        return;
      }

      saver.saveAs(data, `${fileName}_${new Date().getTime()}${EXCEL_EXTENSION}`);
    });
  }

  // ===========================
  // ⚙️ Acciones CRUD
  // ===========================
  nuevo(): void {
    this.router.navigate(['/seguimiento/nuevaordenrecojo']);
  }

  editar(id: number): void {
    this.router.navigate(['/seguimiento/editarordenrecojo', id]);
  }

  verguias(id: number): void {
    this.router.navigate(['/seguimiento/verorden', id]);
  }

  verDetalleOrden(orden: any): void {
    this.dialogService.open(DetalleOrdenModalComponent, {
      header: `Detalle de Orden: ${orden.numcp}`,
      width: '900px',
      data: { orden },
      baseZIndex: 10000,
      styleClass: 'detalle-orden-modal',
    });
  }

  cambiarProveedor(rowData: any): void {
    this.ref = this.dialogService.open(ModalSeleccionarProveedorComponent, {
      header: `Cambiar Proveedor — ${rowData.numcp}`,
      width: '560px',
      closable: true,
      modal: true,
      dismissableMask: true,
      data: { idordentrabajo: rowData.idordentrabajo },
    });
    this.ref.onClose.subscribe((result) => {
      if (result?.proveedor) {
        this.messageService.add({
          severity: 'success',
          summary: 'Proveedor actualizado',
          detail: `Se asignó "${result.proveedor.razonSocial}" correctamente.`,
          life: 3000,
        });
        this.buscar();
      }
    });
  }

  eliminar(id: number): void {
    this.confirmationService.confirm({
      message: '¿Está seguro que desea eliminar esta OR?',
      accept: () => {
        this.model.idordentrabajo = id;
        this.model.responsablecomercialid = this.user.usr_int_id;

        this.orderRecojoService.eliminar(this.model).subscribe(() => {
          this.messageService.add({
            severity: 'success',
            summary: 'Orden Recojo',
            detail: 'Se ha eliminado con éxito.',
          });
          this.buscar();
        });
      },
    });
  }
}
