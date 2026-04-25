import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ListarPreliquidacionResult, DetalleFactura, ComprobanteForCreateDto, DetalleComprobanteForCreateDto, OrdenTrabajoPreliquidacionResult } from '../facturacion.types';
import { FacturacionService } from '../facturacion.service';
import { MantenimientoService } from '../../mantenimiento/mantenimiento.service';
import { User } from 'app/core/user/user.types';

@Component({
  selector: 'app-generar-factura-modal',
  templateUrl: './generar-factura-modal.component.html',
  styleUrls: ['./generar-factura-modal.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    InputTextareaModule,
    InputNumberModule,
    ButtonModule,
    CalendarModule,
    DropdownModule,
    TableModule,
    ConfirmDialogModule,
    ToastModule,
    TooltipModule
  ],
  providers: [ConfirmationService, MessageService]
})
export class GenerarFacturaModalComponent implements OnInit {
  facturaForm: FormGroup;
  preliquidacion: ListarPreliquidacionResult;
  detalles: DetalleFactura[] = [];
  series: any[] = [];
  documentos: any[] = []; // registros completos de facturacion.documento
  ordenes: OrdenTrabajoPreliquidacionResult[] = [];
  user: User;
  loading: boolean = false;
  readonly ID_TIPO_COMPROBANTE = 81; // tipo comprobante a usar para listar series
  
  cols: any[] = [
    { field: 'cantidad', header: 'Cantidad', width: '100px' },
    { field: 'conceptoCobro', header: 'Concepto Cobro', width: '130px' },
    { field: 'descripcion', header: 'Descripción', width: '300px' },
    { field: 'precioUnitario', header: 'Valor Unitario', width: '150px' },
    { field: 'acciones', header: 'Acciones', width: '120px' }
  ];

  conceptosCobro: any[] = [];

  constructor(
    private fb: FormBuilder,
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private facturacionService: FacturacionService,
    private mantenimientoService: MantenimientoService
  ) {
    this.preliquidacion = this.config.data.preliquidacion;
    this.facturaForm = this.fb.group({
      fechaEmision: [new Date(), Validators.required],
      senor: [this.preliquidacion.cliente || '', Validators.required],
      ruc: ['', Validators.required],
      direccion: [''],
      serie: ['', Validators.required],
      numero: ['', Validators.required],
      observacion: [''],
      ordenCompra: ['']
    });
  }

  ngOnInit(): void {
    // Cargar usuario del localStorage
    const userStorage = localStorage.getItem('user');
    if (userStorage) {
      this.user = JSON.parse(userStorage);
    }

    // Cargar series desde facturacion.documento
    this.cargarSeries();

    // Cargar conceptos de cobro desde valorTabla con id 6
    this.cargarConceptosCobro();

    // Cargar órdenes de la preliquidación para obtener totales y idCliente
    this.cargarOrdenes();

    // Inicializar con un item por defecto si la preliquidación tiene total
    if (this.preliquidacion.total) {
      this.detalles = [{
        item: 1,
        cantidad: 1,
        conceptoCobro: 65, // Concepto de cobro por defecto para "POR SERVICIO DE TRANSPORTE Y DISTRIBUCIÓN DE MERCADERIA."
        descripcion: 'POR SERVICIO DE TRANSPORTE Y DISTRIBUCIÓN DE MERCADERIA.',
        precioUnitario: this.preliquidacion.subtotal || 0,
        subtotal: this.preliquidacion.subtotal || 0,
        igv: this.preliquidacion.total && this.preliquidacion.subtotal 
          ? (this.preliquidacion.total - this.preliquidacion.subtotal) || 0 
          : 0,
        total: this.preliquidacion.total || 0
      }];
    }
  }

  cargarSeries(): void {
    this.facturacionService.getDocumentos(this.ID_TIPO_COMPROBANTE).subscribe({
      next: (docs) => {
        this.documentos = docs;
        this.series = docs.map(d => ({ label: d.serie, value: d.serie }));
      },
      error: (error) => {
        console.error('Error al cargar series:', error);
        this.messageService.add({
          severity: 'warn',
          summary: 'Advertencia',
          detail: 'No se pudieron cargar las series disponibles'
        });
      }
    });
  }

  onSerieChange(serie: string): void {
    if (!serie) return;
    const doc = this.documentos.find(d => d.serie === serie);
    const idtipo = doc?.idTipoComprobante ?? this.ID_TIPO_COMPROBANTE;
    this.facturacionService.getSiguienteNumeroDocumento(idtipo, serie).subscribe({
      next: (resp) => {
        this.facturaForm.patchValue({ numero: resp.siguienteNumero });
      },
      error: (error) => {
        console.error('Error al obtener siguiente número:', error);
        this.messageService.add({
          severity: 'warn',
          summary: 'Advertencia',
          detail: 'No se pudo obtener el siguiente número para la serie seleccionada'
        });
      }
    });
  }

  cargarConceptosCobro(): void {
    this.mantenimientoService.getValorTabla(5).subscribe({
      next: (valores: any[]) => {
        this.conceptosCobro = valores.map(v => ({
          label: v.valor,
          value: v.idValorTabla || v.idvalortabla
        }));
      },
      error: (error) => {
        console.error('Error al cargar conceptos de cobro:', error);
        this.messageService.add({
          severity: 'warn',
          summary: 'Advertencia',
          detail: 'No se pudieron cargar los conceptos de cobro'
        });
      }
    });
  }

  cargarOrdenes(): void {
    this.facturacionService.listarOrdenTrabajoPreliquidacion(this.preliquidacion.idpreliquidacion).subscribe({
      next: (ordenes: OrdenTrabajoPreliquidacionResult[]) => {
        this.ordenes = ordenes;
        // Si hay órdenes, cargar los datos del cliente
        if (ordenes.length > 0 && ordenes[0].idcliente) {
          this.cargarDatosCliente(ordenes[0].idcliente);
        }
      },
      error: (error) => {
        console.error('Error al cargar órdenes:', error);
      }
    });
  }

  cargarDatosCliente(idCliente: number): void {
    this.mantenimientoService.getClienteDetalle(idCliente).subscribe({
      next: (cliente) => {
        // Actualizar el formulario con los datos del cliente
        this.facturaForm.patchValue({
          senor: cliente.razonSocial || this.preliquidacion.cliente || '',
          ruc: cliente.ruc || '',
          direccion: cliente.direccionPrincipal?.direccion || ''
        });
      },
      error: (error) => {
        console.error('Error al cargar datos del cliente:', error);
        this.messageService.add({
          severity: 'warn',
          summary: 'Advertencia',
          detail: 'No se pudieron cargar los datos del cliente'
        });
      }
    });
  }

  getIdTipoComprobante(serie: string): number {
    const doc = this.documentos.find(d => d.serie === serie);
    return doc?.idTipoComprobante ?? this.ID_TIPO_COMPROBANTE;
  }

  agregarItem(): void {
    const nuevoItem: DetalleFactura = {
      item: this.detalles.length + 1,
      cantidad: 1,
      conceptoCobro: null,
      descripcion: '',
      precioUnitario: 0,
      subtotal: 0,
      igv: 0,
      total: 0
    };
    this.detalles.push(nuevoItem);
    this.calcularTotales();
  }

  eliminarItem(index: number): void {
    if (this.detalles.length > 1) {
      this.detalles.splice(index, 1);
      // Renumerar items
      this.detalles.forEach((detalle, idx) => {
        detalle.item = idx + 1;
      });
      this.calcularTotales();
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debe tener al menos un item en la factura'
      });
    }
  }

  editarItem(index: number): void {
    // Lógica para editar item (puede ser un modal o edición inline)
    this.messageService.add({
      severity: 'info',
      summary: 'Editar Item',
      detail: 'Funcionalidad de edición en desarrollo'
    });
  }

  verItem(index: number): void {
    // Lógica para ver detalles del item
    this.messageService.add({
      severity: 'info',
      summary: 'Ver Item',
      detail: 'Funcionalidad de visualización en desarrollo'
    });
  }

  calcularItem(index: number): void {
    const detalle = this.detalles[index];
    if (detalle.cantidad && detalle.precioUnitario) {
      detalle.subtotal = detalle.cantidad * detalle.precioUnitario;
      detalle.igv = detalle.subtotal * 0.18; // IGV 18%
      detalle.total = detalle.subtotal + detalle.igv;
    }
    this.calcularTotales();
  }

  calcularTotales(): void {
    // Los totales se calculan automáticamente desde los detalles
  }

  getSubtotal(): number {
    return this.detalles.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  }

  getIGV(): number {
    return this.detalles.reduce((sum, item) => sum + (item.igv || 0), 0);
  }

  getTotal(): number {
    return this.detalles.reduce((sum, item) => sum + (item.total || 0), 0);
  }

  generar(): void {
    if (this.facturaForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Por favor complete todos los campos requeridos'
      });
      return;
    }

    if (this.detalles.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Debe agregar al menos un item a la factura'
      });
      return;
    }

    // Validar que tenemos órdenes para obtener idCliente
    if (this.ordenes.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'No se encontraron órdenes en la preliquidación'
      });
      return;
    }

    this.confirmationService.confirm({
      message: '¿Está seguro que desea generar la factura?',
      header: 'Confirmar Generación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Generar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.loading = true;
        
        const formValue = this.facturaForm.value;
        const serie = formValue.serie?.value || formValue.serie;
        const numeroComprobante = `${serie}-${formValue.numero}`;
        
        // Obtener idCliente de la primera orden
        const idCliente = this.ordenes[0]?.idcliente;
        if (!idCliente) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo obtener el cliente de la preliquidación'
          });
          this.loading = false;
          return;
        }

        // Calcular totales de peso, volumen y bulto
        const totalPeso = this.ordenes.reduce((sum, o) => sum + (o.peso || 0), 0);
        const totalVolumen = this.ordenes.reduce((sum, o) => sum + (o.volumen || 0), 0);
        const totalBulto = this.ordenes.reduce((sum, o) => sum + (o.bulto || 0), 0);

        // Mapear detalles del formulario a DetalleComprobanteForCreateDto
        const detallesComprobante: DetalleComprobanteForCreateDto[] = this.detalles.map(detalle => ({
          idOrdenTrabajo: undefined, // Se puede mapear si hay relación con órdenes
          descripcion: detalle.descripcion,
          subtotal: detalle.subtotal || 0,
          igv: detalle.igv || 0,
          total: detalle.total || 0,
          recargo: 0 // Se puede calcular si es necesario
        }));

        // Crear objeto ComprobanteForCreateDto
        const comprobante: ComprobanteForCreateDto = {
          numeroComprobante: numeroComprobante,
          idTipoComprobante: this.getIdTipoComprobante(serie),
          emisionRapida: 0,
          idPreliquidacion: this.preliquidacion.idpreliquidacion,
          idCliente: idCliente,
          fechaEmision: formValue.fechaEmision,
          idUsuarioRegistro: this.user?.id || this.user?.usr_int_id || 0,
          subtotal: this.getSubtotal(),
          igv: this.getIGV(),
          total: this.getTotal(),
          totalPeso: totalPeso,
          totalVolumen: totalVolumen,
          totalBulto: totalBulto,
          motivo: formValue.observacion || undefined,
          descripcion: formValue.observacion || undefined,
          idFacturaVinculada: undefined,
          idEstado: 1, // Estado inicial (ajustar según valores del backend)
          ordenCompra: formValue.ordenCompra || undefined,
          detalles: detallesComprobante
        };

        // Llamar al servicio para crear el comprobante
        this.facturacionService.createComprobante(comprobante).subscribe({
          next: (response: any) => {
            this.loading = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Comprobante Creado',
              detail: response.message || 'El comprobante se creó correctamente'
            });
            this.ref.close({ success: true, idComprobante: response.idComprobante });
          },
          error: (error) => {
            this.loading = false;
            console.error('Error al crear comprobante:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.message || 'No se pudo crear el comprobante'
            });
          }
        });
      }
    });
  }

  cerrar(): void {
    this.ref.close();
  }
}
