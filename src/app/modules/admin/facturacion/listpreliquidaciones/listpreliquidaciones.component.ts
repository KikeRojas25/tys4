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
import { DialogService, DynamicDialogRef, DynamicDialogModule } from 'primeng/dynamicdialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { GenerarFacturaModalComponent } from './generar-factura-modal.component';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { FacturacionService } from '../facturacion.service';
import { ListarPreliquidacionResult } from '../facturacion.types';
import { MantenimientoService } from '../../mantenimiento/mantenimiento.service';
import { User } from 'app/core/user/user.types';

@Component({
  selector: 'app-listpreliquidaciones',
  templateUrl: './listpreliquidaciones.component.html',
  styleUrls: ['./listpreliquidaciones.component.css'],
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
    CalendarModule,
    DynamicDialogModule
  ],
  providers: [
    DialogService,
    ConfirmationService,
    MessageService
  ]
})
export class ListpreliquidacionesComponent implements OnInit {

  model: any = {};
  preliquidaciones: ListarPreliquidacionResult[] = [];
  filteredPreliquidaciones: ListarPreliquidacionResult[] = [];
  loading: boolean = false;
  selectedItem: ListarPreliquidacionResult | null = null;
  ref: DynamicDialogRef | undefined;

  cols: any[] = [];
  clientes: any[] = [];
  estados: any[] = [];
  tiposComprobante: any[] = [];
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
    this.cargarTiposComprobante();
  }

  cargarUsuario(): void {
    const userStorage = localStorage.getItem('user');
    if (userStorage) {
      this.user = JSON.parse(userStorage);
    }
  }

  cargarClientes(): void {
    const userId = this.user?.id || 2;
    this.mantenimientoService.getAllClientes('', userId,true).subscribe({
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

  cargarEstados(): void {
    this.estados = [
      { label: 'Todos los estados', value: null },
      { label: 'Pendiente', value: 1 },
      { label: 'Aprobado', value: 2 },
      { label: 'Anulado', value: 3 }
    ];
  }

  cargarTiposComprobante(): void {
    this.tiposComprobante = [
      { label: 'Todos los tipos', value: null },
      { label: 'Factura', value: 1 },
      { label: 'Boleta', value: 2 },
      { label: 'Nota de Crédito', value: 3 },
      { label: 'Nota de Débito', value: 4 }
    ];
  }

  inicializarColumnas(): void {
    this.cols = [
      { field: 'numeropreliquidacion', header: 'Nro Preliquidación', width: '150px' },
      { field: 'numerocomprobante', header: 'Nro Comprobante', width: '150px' },
      { field: 'tipocomprobantepago', header: 'Tipo Comprobante', width: '150px' },
      { field: 'cliente', header: 'Cliente', width: '200px' },
      { field: 'fechaemision', header: 'Fecha Emisión', width: '130px' },
      { field: 'totalbulto', header: 'Total Bultos', width: '120px' },
      { field: 'totalpeso', header: 'Total Peso', width: '120px' },
      { field: 'totalvolumen', header: 'Total Volumen', width: '120px' },
      { field: 'subtotal', header: 'Subtotal', width: '120px' },
      { field: 'recargo', header: 'Recargo', width: '120px' },
      { field: 'total', header: 'Total', width: '120px' }
    ];
  }

  buscar(): void {
    this.loading = true;
    this.facturacionService.listarPreliquidacion(
      this.model.idestado,
      this.model.numerocomprobante,
      this.model.idtipocomprobante,
      this.model.idcliente,
      this.model.numeroliquidacion
    ).subscribe({
      next: (preliquidaciones: ListarPreliquidacionResult[]) => {
        this.preliquidaciones = preliquidaciones;
        this.filteredPreliquidaciones = preliquidaciones;
        this.loading = false;
        console.log('Preliquidaciones cargadas:', this.filteredPreliquidaciones);
      },
      error: (error) => {
        console.error('Error al cargar preliquidaciones:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las preliquidaciones'
        });
        this.loading = false;
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

  editarPreliquidacion(): void {
    if (!this.selectedItem || !this.selectedItem.idpreliquidacion) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debe seleccionar una preliquidación para editar'
      });
      return;
    }
    // Navegar a la ruta de edición con el ID de la preliquidación
    this.router.navigate(['/facturacion/editar', this.selectedItem.idpreliquidacion]);
  }

  verReporte(): void {
    if (!this.selectedItem || !this.selectedItem.idpreliquidacion) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debe seleccionar una preliquidación para ver el reporte'
      });
      return;
    }
    const url = `http://104.36.166.65/webreports/preliquidacion.aspx?idpreliquidacion=${this.selectedItem.idpreliquidacion}`;
    window.open(url, '_blank');
  }

  generarFactura(): void {
    if (!this.selectedItem || !this.selectedItem.idpreliquidacion) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debe seleccionar una preliquidación para generar la factura'
      });
      return;
    }

    this.ref = this.dialogService.open(GenerarFacturaModalComponent, {
      header: 'Generar Factura',
      width: '90%',
      styleClass: 'generar-factura-dialog',
      closable: true,
      modal: true,
      dismissableMask: true,
      data: {
        preliquidacion: this.selectedItem
      }
    });

    this.ref.onClose.subscribe((result) => {
      if (result) {
        console.log('Factura generada:', result);
        this.messageService.add({
          severity: 'success',
          summary: 'Factura Generada',
          detail: 'La factura se generó correctamente'
        });
        this.buscar(); // Refrescar la lista
      }
    });
  }
}
