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
import { MatIconModule } from '@angular/material/icon';

import { RecojoService } from '../recojo.service';
import { MantenimientoService } from '../../mantenimiento/mantenimiento.service';

import { OrdenTransporte } from '../../recepcion/ordentransporte/ordentransporte.types';
import { User } from 'app/core/user/user.types';
import { Usuario } from '../recojo.types';

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
      { header: 'ACC', field: '', width: '150px' },
      { header: 'OR', field: 'numcp', width: '80px' },
      { header: 'F. REGISTRO', field: 'fecharegistro', width: '120px' },
      { header: 'RESPONSABLE', field: 'responsable', width: '150px' },
      { header: 'CLIENTE', field: 'razonsocial', width: '180px' },
      { header: 'F. CITA', field: 'fechahoracita', width: '120px' },
      { header: 'ESTADO', field: 'estado', width: '120px' },
      { header: 'CONTACTO', field: 'personarecojo', width: '120px' },
      { header: 'PT. RECOJO', field: 'puntorecojo', width: '220px' },
      { header: 'CE. ACOPIO', field: 'centroacopio', width: '120px' },
      { header: 'BULTOS', field: 'bulto', width: '80px' },
      { header: 'PESO', field: 'peso', width: '80px' },
      { header: 'VOL', field: 'pesovol', width: '80px' },
      { header: 'OBSERVACIÓN', field: 'observaciones', width: '580px' },
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

    this.cargarClientes();
    this.cargarUbigeo();
    this.cargarEstados();
    this.cargarUsuariosPorRol(14); // 👈 Cargar usuarios de rol específico
  }

  private cargarClientes(): void {
    this.mantenimientoService.getAllClientes('', this.model.idusuario).subscribe((resp) => {
      this.clientes = [{ value: 0, label: 'TODOS LOS CLIENTES' }];
      resp.forEach((c) => this.clientes.push({ value: c.idCliente, label: c.razonSocial }));
      this.model.idcliente = 0;
    });
  }

  private cargarUbigeo(): void {
    this.orderRecojoService.getUbigeo('').subscribe((resp) => {
      this.ubigeo = [{ value: 0, label: 'TODOS LOS DESTINOS' }];
      resp.forEach((u) => this.ubigeo.push({ value: u.idDistrito, label: u.ubigeo }));
      this.model.iddistrito = 0;
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
  // 👥 Cargar usuarios (Rol específico)
  // ===========================
  private cargarUsuariosPorRol(rolId: number): void {
    this.orderRecojoService.getUsuariosPorRol(rolId).subscribe({
      next: (data: Usuario[]) => {
        this.usuariosRol = data.map((u) => ({
          value: u.usr_int_id,
          label: `${u.usr_str_nombre} ${u.usr_str_apellidos}`,
        }));
      },
      error: (err) => console.error('Error cargando usuarios de rol:', err),
    });
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
    import('xlsx').then((xlsx) => {
      const worksheet = xlsx.utils.json_to_sheet(this.ordenes);
      const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, 'ListaOT');
    });
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    import('file-saver').then((FileSaver) => {
      const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
      const EXCEL_EXTENSION = '.xlsx';
      const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
      FileSaver.saveAs(data, `${fileName}_export_${new Date().getTime()}${EXCEL_EXTENSION}`);
    });
  }

  // ===========================
  // ⚙️ Acciones CRUD
  // ===========================
  editar(id: number): void {
    this.router.navigate(['/seguimiento/editarordenrecojo', id]);
  }

  verguias(id: number): void {
    this.router.navigate(['/seguimiento/verorden', id]);
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
