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
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { TooltipModule } from 'primeng/tooltip';
import { DialogService, DynamicDialogRef, DynamicDialogModule } from 'primeng/dynamicdialog';
import { FacturacionService } from '../facturacion.service';
import { VerComprobanteModalComponent } from './ver-comprobante-modal.component';
import { ComprobanteResult } from '../facturacion.types';
import { MantenimientoService } from '../../mantenimiento/mantenimiento.service';
import { User } from 'app/core/user/user.types';

@Component({
  selector: 'app-listcomprobantes',
  templateUrl: './listcomprobantes.component.html',
  styleUrls: ['./listcomprobantes.component.css'],
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
    DropdownModule,
    CalendarModule,
    TooltipModule,
    DynamicDialogModule
  ],
  providers: [
    ConfirmationService,
    MessageService,
    DialogService
  ]
})
export class ListcomprobantesComponent implements OnInit {

  model: any = {};
  comprobantes: ComprobanteResult[] = [];
  filteredComprobantes: ComprobanteResult[] = [];
  loading: boolean = false;
  selectedItem: ComprobanteResult | null = null;

  cols: any[] = [];
  clientes: any[] = [];
  estados: any[] = [];
  user: User;

  constructor(
    private facturacionService: FacturacionService,
    private mantenimientoService: MantenimientoService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.inicializarColumnas();
    this.cargarUsuario();
    this.cargarClientes();
    this.cargarEstados();
    this.inicializarFechas();
    this.buscar();
  }

  inicializarFechas(): void {
    const hoy = new Date();
    const hace3Meses = new Date();
    hace3Meses.setMonth(hoy.getMonth() - 3);
    this.model.fechafin = hoy;
    this.model.fechainicio = hace3Meses;
  }

  cargarUsuario(): void {
    const userStorage = localStorage.getItem('user');
    if (userStorage) {
      this.user = JSON.parse(userStorage);
    }
  }

  cargarClientes(): void {
    const userId = this.user?.id || 2;
    this.mantenimientoService.getAllClientes('', userId, true).subscribe({
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
      }
    });
  }

  cargarEstados(): void {
    this.estados = [
      { label: 'Todos los estados', value: null },
      { label: 'Pend Facturar',     value: 22 },
      { label: 'Facturado',         value: 23 },
      { label: 'Anulado',           value: 24 }
    ];
  }

  inicializarColumnas(): void {
    this.cols = [
      { field: 'numeroComprobante', header: 'N° Comprobante', width: '150px' },
      { field: 'tipoComprobante', header: 'Tipo', width: '100px' },
      { field: 'numeroPreliquidacion', header: 'N° Preliquidación', width: '150px' },
      { field: 'nombreCliente', header: 'Cliente', width: '200px' },
      { field: 'fechaEmision', header: 'Fecha Emisión', width: '120px' },
      { field: 'usuarioRegistro', header: 'Usuario', width: '150px' },
      { field: 'subtotal', header: 'Subtotal', width: '100px' },
      { field: 'igv', header: 'IGV', width: '100px' },
      { field: 'total', header: 'Total', width: '120px' },
      { field: 'estado', header: 'Estado', width: '100px' }
    ];
  }

  buscar(): void {
    this.loading = true;
    const idCliente = this.model.idcliente || null;
    const idEstado = this.model.idestado || null;
    const fechainicio = this.model.fechainicio || null;
    const fechafin = this.model.fechafin || null;

    this.facturacionService.listarComprobantes(idCliente, idEstado, fechainicio, fechafin).subscribe({
      next: (comprobantes: ComprobanteResult[]) => {
        this.comprobantes = comprobantes;
        this.filteredComprobantes = [...this.comprobantes];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar comprobantes:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los comprobantes'
        });
        this.loading = false;
      }
    });
  }

  limpiarFiltros(): void {
    this.model = {};
    this.inicializarFechas();
    this.buscar();
  }

  verDetalle(comprobante: ComprobanteResult): void {
    this.dialogService.open(VerComprobanteModalComponent, {
      header: 'Detalle de Comprobante',
      width: '90%',
      styleClass: 'ver-comprobante-dialog',
      data: {
        idComprobante: comprobante.idComprobantePago
      }
    });
  }

  exportar(comprobante: ComprobanteResult): void {
    // TODO: Implementar exportación del comprobante
    this.messageService.add({
      severity: 'info',
      summary: 'Exportar',
      detail: `Exportar comprobante ${comprobante.numeroComprobante}`
    });
  }

  anular(comprobante: ComprobanteResult): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de anular el comprobante <strong>${comprobante.numeroComprobante}</strong>?<br>Se limpiarán los datos de facturación en todas las órdenes vinculadas.`,
      header: 'Confirmar Anulación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, anular',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.facturacionService.deleteComprobante(comprobante.idComprobantePago).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Anulado',
              detail: `Comprobante ${comprobante.numeroComprobante} anulado correctamente`
            });
            this.buscar();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error?.error?.message || 'No se pudo anular el comprobante'
            });
          }
        });
      }
    });
  }
}

