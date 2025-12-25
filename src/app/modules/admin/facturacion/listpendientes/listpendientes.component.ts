import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { FacturacionService } from '../facturacion.service';
import { PendientePreliquidacion } from '../facturacion.types';
import { MantenimientoService } from '../../mantenimiento/mantenimiento.service';
import { User } from 'app/core/user/user.types';

@Component({
  selector: 'app-listpendientes',
  templateUrl: './listpendientes.component.html',
  styleUrls: ['./listpendientes.component.css'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatIcon,
    RouterModule,
    TableModule,
    ButtonModule,
    ChipModule,
    ConfirmDialogModule,
    InputTextModule,
    ToastModule,
    DialogModule,
    DropdownModule,
    CalendarModule
  ],
  providers: [
    DialogService,
    ConfirmationService,
    MessageService
  ]
})
export class ListpendientesComponent implements OnInit {

  model: any = {};
  pendientes: PendientePreliquidacion[] = [];
  filteredPendientes: PendientePreliquidacion[] = [];
  loading: boolean = false;
  displayDialog: boolean = false;
  selectedItems: PendientePreliquidacion[] = [];

  cols: any[] = [];
  clientes: any[] = [];
  destinos: any[] = [];
  user: User;

  constructor(
    private facturacionService: FacturacionService,
    private mantenimientoService: MantenimientoService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.inicializarColumnas();
    this.cargarUsuario();
    this.cargarClientes();
    this.cargarDestinos();
  }

  cargarUsuario(): void {
    const userStorage = localStorage.getItem('user');
    if (userStorage) {
      this.user = JSON.parse(userStorage);
    }
  }

  cargarClientes(): void {
    const userId = this.user?.id || 2; // 2 como ID por defecto si no hay usuario
    this.mantenimientoService.getAllClientes('', userId).subscribe({
      next: (clientes) => {
        this.clientes = [{ label: 'Todos los clientes', value: null }];
        clientes.forEach((cliente) => {
          this.clientes.push({
            label: cliente.razonSocial,
            value: cliente.idCliente
          });
        });
      },
      error: (error) => {
        console.error('Error al cargar clientes:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los clientes'
        });
      }
    });
  }

  cargarDestinos(): void {
    this.mantenimientoService.getAllEstaciones('').subscribe({
      next: (estaciones) => {
        this.destinos = [{ label: 'Todos los destinos', value: null }];
        estaciones.forEach((estacion) => {
          this.destinos.push({
            label: estacion.estacionOrigen,
            value: estacion.idEstacion
          });
        });
      },
      error: (error) => {
        console.error('Error al cargar destinos:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los destinos'
        });
      }
    });
  }

  inicializarColumnas(): void {
    this.cols = [
      { field: 'numcp', header: 'Nro OT', width: '120px' },
      { field: 'fecharegistro', header: 'Fecha Registro', width: '130px' },
      
      { field: 'destinatario', header: 'Destinatario', width: '200px' },
      { field: 'origen', header: 'Origen', width: '150px' },
      { field: 'destino', header: 'Destino', width: '150px' },
      { field: 'modotransporte', header: 'Modo', width: '100px' },
      { field: 'tipooperacion', header: 'Tipo Op.', width: '100px' },
      { field: 'peso', header: 'Peso', width: '100px' },
      { field: 'volumen', header: 'Volumen', width: '100px' },
      { field: 'bulto', header: 'Bultos', width: '80px' },
      // { field: 'tarifa', header: 'Tarifa', width: '100px' },
      { field: 'subtotal', header: 'Subtotal', width: '100px' },
      { field: 'igv', header: 'IGV', width: '100px' },
      { field: 'total', header: 'Total', width: '100px' },
      { field: 'guiatransportista', header: 'Guía', width: '120px' }
    ];
  }

  buscar(): void {
    this.loading = true;
    this.facturacionService.getListarPendientePreliquidacion(
      this.model.idcliente,
      this.model.iddestino,
      this.model.numcp
    ).subscribe({
      next: (pendientes: PendientePreliquidacion[]) => {
        this.pendientes = pendientes;
        this.filteredPendientes = pendientes;
        this.loading = false;
        console.log('Pendientes cargados:', this.filteredPendientes);
      },
      error: (error) => {
        console.error('Error al cargar pendientes:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los pendientes de preliquidación'
        });
        this.loading = false;
      }
    });
  }

  generarPreliquidacion(): void {
    if (!this.selectedItems || this.selectedItems.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debe seleccionar al menos un item para generar la preliquidación'
      });
      return;
    }

    this.confirmationService.confirm({
      acceptLabel: 'Generar',
      rejectLabel: 'Cancelar',
      acceptIcon: 'pi pi-check',
      rejectIcon: 'pi pi-times',
      message: `¿Está seguro que desea generar la preliquidación con ${this.selectedItems.length} items seleccionados?`,
      header: 'Confirmar Generación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const idsOrdenTrabajo = this.selectedItems.map(item => item.idordentrabajo);
        const idCliente = this.model.idcliente || 0;
        const fechaEmision = new Date();
        const idUsuarioRegistro = this.user?.id || 0;

        this.facturacionService.generarpreliquidacion(
          idCliente,
          idsOrdenTrabajo,
          fechaEmision,
          idUsuarioRegistro
        ).subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Preliquidación Generada',
              detail: response.message || `Se generó la preliquidación con ${this.selectedItems.length} items correctamente`
            });
            this.selectedItems = [];
            this.buscar();
          },
          error: (error) => {
            console.error('Error al generar preliquidación:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.message || 'No se pudo generar la preliquidación'
            });
          }
        });
      }
    });
  }

  limpiarFiltros(): void {
    this.model = {};
    this.buscar();
  }

  exportarExcel(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Exportar',
      detail: 'Funcionalidad de exportación en desarrollo'
    });
  }

  calcularTotales(): any {
    const selected = this.selectedItems.length > 0 ? this.selectedItems : this.filteredPendientes;
    return {
      subtotal: selected.reduce((sum, item) => sum + (item.subtotal || 0), 0),
      igv: selected.reduce((sum, item) => sum + (item.igv || 0), 0),
      total: selected.reduce((sum, item) => sum + (item.total || 0), 0)
    };
  }
}
