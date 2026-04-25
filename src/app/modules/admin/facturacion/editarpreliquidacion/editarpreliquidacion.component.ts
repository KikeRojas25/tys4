import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef, DynamicDialogModule } from 'primeng/dynamicdialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TooltipModule } from 'primeng/tooltip';
import { FacturacionService } from '../facturacion.service';
import { PreliquidacionDetalle, OrdenPreliquidacion, AgregarCargoRequest, OrdenTrabajoRecargoUpdateDto, PendientePreliquidacion, OrdenTrabajoPreliquidacionResult } from '../facturacion.types';
import { MantenimientoService } from '../../mantenimiento/mantenimiento.service';
import { User } from 'app/core/user/user.types';

@Component({
  selector: 'app-editarpreliquidacion',
  templateUrl: './editarpreliquidacion.component.html',
  styleUrls: ['./editarpreliquidacion.component.css'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatIcon,
    RouterModule,
    TableModule,
    ButtonModule,
    ConfirmDialogModule,
    InputTextModule,
    ToastModule,
    DialogModule,
    DropdownModule,
    InputNumberModule,
    InputTextareaModule,
    DynamicDialogModule,
    TooltipModule
  ],
  providers: [
    DialogService,
    ConfirmationService,
    MessageService
  ]
})
export class EditarpreliquidacionComponent implements OnInit {
  idpreliquidacion: number;
  preliquidacion: PreliquidacionDetalle | null = null;
  ordenes: OrdenTrabajoPreliquidacionResult[] = [];
  loading: boolean = false;
  
  // Para agregar OTs
  displayAgregarOTs: boolean = false;
  pendientesDisponibles: PendientePreliquidacion[] = [];
  selectedOTs: PendientePreliquidacion[] = [];
  
  // Para agregar cargos
  displayAgregarCargo: boolean = false;
  ordenSeleccionadaParaCargo: OrdenTrabajoPreliquidacionResult | null = null;
  cargoModel: any = { monto: 0 };

  /** Recargo vía PUT ActualizarRecargoOrdenTrabajo */
  displayEditarRecargo = false;
  ordenParaRecargo: OrdenTrabajoPreliquidacionResult | null = null;
  recargoModel = 0;

  cols: any[] = [];
  user: User;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private facturacionService: FacturacionService,
    private mantenimientoService: MantenimientoService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private dialogService: DialogService
  ) {
    this.idpreliquidacion = Number(this.route.snapshot.paramMap.get('id'));
  }

  ngOnInit(): void {
    this.inicializarColumnas();
    this.cargarUsuario();
    this.cargarPreliquidacion();
  }

  cargarUsuario(): void {
    const userStorage = localStorage.getItem('user');
    if (userStorage) {
      this.user = JSON.parse(userStorage);
    }
  }

  inicializarColumnas(): void {
    this.cols = [
      { field: 'acciones', header: 'Acciones', width: '120px' },
      { field: 'numcp', header: 'Nro OT', width: '120px' },
      { field: 'fecharegistro', header: 'Fecha Registro', width: '130px' },
      { field: 'remitente', header: 'Remitente', width: '130px' },
      { field: 'destinatario', header: 'Destinatario', width: '130px' },
      { field: 'origen', header: 'Origen', width: '150px' },
      { field: 'destino', header: 'Destino', width: '150px' },
      { field: 'modotransporte', header: 'Modo', width: '100px' },
      { field: 'peso', header: 'Peso', width: '100px' },
      { field: 'volumen', header: 'Volumen', width: '100px' },
      { field: 'bulto', header: 'Bultos', width: '80px' },
      { field: 'pesovol', header: 'Peso Vol', width: '120px' },
      { field: 'tarifa', header: 'Tarifa', width: '100px' },
      { field: 'montobase', header: 'Monto Base', width: '120px' },
      { field: 'subtotal', header: 'Subtotal', width: '100px' },
      { field: 'recargo', header: 'Recargo', width: '100px' },
      { field: 'subtotalfinal', header: 'Subtotal Final', width: '120px' },
    ];
  }

  cargarPreliquidacion(): void {
    this.loading = true;
    // Solo hacer una llamada al endpoint - ambos métodos llaman al mismo endpoint
    // Usamos listarOrdenTrabajoPreliquidacion que devuelve el array de órdenes directamente
    this.facturacionService.listarOrdenTrabajoPreliquidacion(this.idpreliquidacion).subscribe({
      next: (ordenes: OrdenTrabajoPreliquidacionResult[]) => {
        this.ordenes = ordenes;
        
        // Obtener el idcliente de la primera orden si existe
        const idCliente = ordenes.length > 0 ? ordenes[0].idcliente : undefined;
        const numeropreliquidacion = ordenes.length > 0 ? ordenes[0].numeropreliquidacion : undefined;
        
        // Inicializar el detalle de la preliquidación con los datos disponibles
        this.preliquidacion = {
          idpreliquidacion: this.idpreliquidacion,
          idcliente: idCliente,
          numeropreliquidacion: numeropreliquidacion // Placeholder hasta tener endpoint correcto
        };
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar órdenes de trabajo:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las órdenes de trabajo'
        });
        this.loading = false;
      }
    });
  }

  getCantidadOTs(): number {
    return this.ordenes.length;
  }

  getSubtotalTotal(): number {
    return this.ordenes.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  }

  getIGVTotal(): number {
    return this.ordenes.reduce((sum, item) => sum + (item.igv || 0), 0);
  }

  getRecargoTotal(): number {
    return this.ordenes.reduce((sum, item) => sum + (item.recargo || 0), 0);
  }

  getTotalTotal(): number {
    return this.ordenes.reduce((sum, item) => sum + (item.total || 0), 0);
  }

  eliminarOT(orden: OrdenTrabajoPreliquidacionResult): void {
    this.confirmationService.confirm({
      message: `¿Está seguro que desea eliminar la OT ${orden.numcp} de esta preliquidación?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.loading = true;
        this.facturacionService.eliminarOrdenesDePreliquidacion(
          this.idpreliquidacion,
          [orden.idordentrabajo]
        ).subscribe({
          next: (response: any) => {
            this.messageService.add({
              severity: 'success',
              summary: 'OT Eliminada',
              detail: response?.message || 'La orden de trabajo se eliminó correctamente de la preliquidación'
            });
            this.cargarPreliquidacion();
          },
          error: (error) => {
            console.error('Error al eliminar OT:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.message || 'No se pudo eliminar la orden de trabajo'
            });
            this.loading = false;
          }
        });
      }
    });
  }

  abrirAgregarOTs(): void {
    this.displayAgregarOTs = true;
    this.selectedOTs = [];
    // Cargar pendientes disponibles (filtrar por cliente de la preliquidación)
    // Si no tenemos idcliente en preliquidacion, intentar obtenerlo de las órdenes
    let idCliente = this.preliquidacion?.idcliente;
    
    // Si no está en preliquidacion pero tenemos órdenes, obtenerlo de la primera orden
    if (!idCliente && this.ordenes.length > 0) {
      idCliente = this.ordenes[0].idcliente;
    }

    if (idCliente) {
      this.facturacionService.getListarPendientePreliquidacion(idCliente, null, null).subscribe({
        next: (pendientes: PendientePreliquidacion[]) => {
          // Filtrar las que ya están en la preliquidación
          const idsExistentes = this.ordenes.map(o => o.idordentrabajo);
          this.pendientesDisponibles = pendientes.filter(p => !idsExistentes.includes(p.idordentrabajo));
        },
        error: (error) => {
          console.error('Error al cargar pendientes:', error);
        }
      });
    }
  }

  agregarOTsSeleccionadas(): void {
    if (this.selectedOTs.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debe seleccionar al menos una orden de trabajo'
      });
      return;
    }

    const idsOrdenTrabajo = this.selectedOTs.map(ot => ot.idordentrabajo);
    this.loading = true;

    this.facturacionService.agregarOrdenesAPreliquidacion(
      this.idpreliquidacion,
      idsOrdenTrabajo
    ).subscribe({
      next: (response: any) => {
        this.messageService.add({
          severity: 'success',
          summary: 'OTs Agregadas',
          detail: response?.message || `Se agregaron ${this.selectedOTs.length} órdenes de trabajo correctamente`
        });
        this.displayAgregarOTs = false;
        this.selectedOTs = [];
        this.cargarPreliquidacion();
      },
      error: (error) => {
        console.error('Error al agregar OTs:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'No se pudieron agregar las órdenes de trabajo'
        });
        this.loading = false;
      }
    });
  }

  abrirEditarRecargo(orden: OrdenTrabajoPreliquidacionResult): void {
    this.ordenParaRecargo = orden;
    this.recargoModel = orden.recargo ?? 0;
    this.displayEditarRecargo = true;
  }

  actualizarRecargo(): void {
    if (!this.ordenParaRecargo) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Debe seleccionar una orden de trabajo'
      });
      return;
    }

    const dto: OrdenTrabajoRecargoUpdateDto = {
      IdOrdenTrabajo: this.ordenParaRecargo.idordentrabajo,
      Recargo: this.recargoModel
    };

    this.loading = true;
    this.facturacionService.actualizarRecargoOrdenTrabajo(dto).subscribe({
      next: (response: any) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Recargo actualizado',
          detail: response?.message || 'Recargo actualizado correctamente'
        });
        this.displayEditarRecargo = false;
        this.cargarPreliquidacion();
      },
      error: (error) => {
        console.error('Error al actualizar recargo:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'No se pudo actualizar el recargo'
        });
        this.loading = false;
      }
    });
  }

  abrirAgregarCargo(orden: OrdenTrabajoPreliquidacionResult): void {
    this.ordenSeleccionadaParaCargo = orden;
    this.cargoModel = { monto: 0 };
    this.displayAgregarCargo = true;
  }

  agregarCargo(): void {
    if (!this.cargoModel.monto || this.cargoModel.monto <= 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Debe ingresar un monto válido'
      });
      return;
    }

    if (!this.ordenSeleccionadaParaCargo) {
      return;
    }

    const request: AgregarCargoRequest = {
      idordentrabajo: this.ordenSeleccionadaParaCargo.idordentrabajo,
      concepto: '',
      monto: this.cargoModel.monto,
      descripcion: ''
    };

    this.loading = true;
    this.facturacionService.agregarCargoAOrden(request).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Cargo Agregado',
          detail: 'El cargo se agregó correctamente a la orden de trabajo'
        });
        this.displayAgregarCargo = false;
        this.cargarPreliquidacion();
      },
      error: (error) => {
        console.error('Error al agregar cargo:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'No se pudo agregar el cargo'
        });
        this.loading = false;
      }
    });
  }

  volver(): void {
    this.router.navigate(['/facturacion/listarpreliquidacion']);
  }
}
