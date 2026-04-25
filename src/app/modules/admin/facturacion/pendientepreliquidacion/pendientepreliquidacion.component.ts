import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MessageService, SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { FacturacionService } from '../facturacion.service';
import { PendientePreliquidacion } from '../facturacion.types';
import { OrdenTransporteService } from '../../recepcion/ordentransporte/ordentransporte.service';
import { User } from 'app/core/user/user.types';

@Component({
  selector: 'app-pendientepreliquidacion',
  templateUrl: './pendientepreliquidacion.component.html',
  styleUrls: ['./pendientepreliquidacion.component.css'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    CheckboxModule,
    MatIcon,
    DropdownModule,
    CalendarModule,
    ToastModule,
    CardModule
  ],
  providers: [MessageService]
})
export class PendientepreliquidacionComponent implements OnInit {

  clientes: SelectItem[] = [];
  destinos: SelectItem[] = [];
  pendientes: PendientePreliquidacion[] = [];
  selected: PendientePreliquidacion[] = [];
  loading: boolean = false;
  model: any = {};
  cols: any[];
  user: User;

  // Dashboard stats
  cantidadSeleccionada: number = 0;
  totalSeleccionado: number = 0;
  todosMarcados: boolean = false;

  constructor(
    private facturacionService: FacturacionService,
    private ordenTransporteService: OrdenTransporteService,
    public messageService: MessageService
  ) { }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('user'));

    this.model.idcliente = null;
    this.model.iddestino = null;
    this.model.numcp = '';

    this.cols = [
      { header: 'SEL', field: 'selected', width: '60px' },
      { header: 'OT', field: 'numcp', width: '120px' },
      { header: 'F. REGISTRO', field: 'fecharegistro', width: '120px' },
      { header: 'REMITENTE', field: 'remitente', width: '200px' },
      { header: 'DESTINATARIO', field: 'destinatario', width: '200px' },
      { header: 'ORIGEN', field: 'origen', width: '150px' },
      { header: 'DESTINO', field: 'destino', width: '150px' },
      { header: 'MODO TRANSP.', field: 'modotransporte', width: '120px' },
      { header: 'TIPO OP.', field: 'tipooperacion', width: '100px' },
      { header: 'PESO (kg)', field: 'peso', width: '100px' },
      { header: 'VOL (m³)', field: 'volumen', width: '100px' },
      { header: 'BULTOS', field: 'bulto', width: '80px' },
      { header: 'PESO VOL', field: 'pesovol', width: '100px' },
      { header: 'TARIFA', field: 'tarifa', width: '100px' },
      { header: 'SUBTOTAL', field: 'subtotal', width: '100px' },
      { header: 'IGV', field: 'igv', width: '100px' },
      { header: 'TOTAL', field: 'total', width: '100px' },
      { header: 'RECARGO', field: 'recargo', width: '100px' },
      { header: 'GRR', field: 'guiatransportista', width: '120px' },
      { header: 'CONCEPTO COBRO', field: 'conceptocobro', width: '150px' }
    ];

    // Cargar clientes
    this.ordenTransporteService.getClientes(this.user.idscliente).subscribe(resp => {
      this.clientes.push({ value: null, label: 'TODOS LOS CLIENTES' });
      resp.forEach(element => {
        this.clientes.push({ value: element.idCliente, label: element.razonSocial });
      });
    });

    // Cargar destinos
    this.ordenTransporteService.getUbigeo('').subscribe(resp => {
      this.destinos.push({ value: null, label: 'TODOS LOS DESTINOS' });
      resp.forEach(element => {
        this.destinos.push({ value: element.idDistrito, label: element.ubigeo });
      });
    });

    // Cargar datos iniciales
    this.buscar();
  }

  buscar() {
    this.loading = true;
    this.facturacionService.getListarPendientePreliquidacion(
      this.model.idcliente,
      this.model.iddestino,
      this.model.numcp
    ).subscribe(
      list => {
        this.pendientes = list.map(item => ({ ...item, selected: false }));
        this.loading = false;
        this.selected = [];
        this.todosMarcados = false;
        this.calcularDashboard();
      },
      error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los pendientes de preliquidación'
        });
        this.loading = false;
      }
    );
  }

  onRowSelect(event: any) {
    this.calcularDashboard();
  }

  onRowUnselect(event: any) {
    this.calcularDashboard();
  }

  toggleSeleccion(rowData: PendientePreliquidacion & { selected?: boolean }) {
    rowData.selected = !rowData.selected;
    if (rowData.selected) {
      if (!this.selected.includes(rowData)) {
        this.selected = [...this.selected, rowData];
      }
    } else {
      this.selected = this.selected.filter(r => r !== rowData);
    }
    this.todosMarcados = this.pendientes.length > 0 && this.selected.length === this.pendientes.length;
    this.calcularDashboard();
  }

  seleccionarTodos() {
    if (this.todosMarcados) {
      this.pendientes.forEach((r: any) => r.selected = true);
      this.selected = [...this.pendientes];
    } else {
      this.pendientes.forEach((r: any) => r.selected = false);
      this.selected = [];
    }
    this.calcularDashboard();
  }

  calcularDashboard() {
    this.cantidadSeleccionada = this.selected.length;
    this.totalSeleccionado = this.selected.reduce((sum, item) => sum + (item.total || 0), 0);
  }

  limpiarFiltros() {
    this.model.idcliente = null;
    this.model.iddestino = null;
    this.model.numcp = '';
    this.buscar();
  }

  exportarExcel() {
    this.messageService.add({
      severity: 'info',
      summary: 'Exportar',
      detail: 'Funcionalidad de exportación en desarrollo'
    });
  }

  procesarSeleccionados() {
    if (this.selected.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debe seleccionar al menos una orden de trabajo'
      });
      return;
    }

    this.messageService.add({
      severity: 'success',
      summary: 'Procesando',
      detail: `Procesando ${this.selected.length} órdenes de trabajo`
    });

    // Aquí puedes agregar la lógica para procesar las órdenes seleccionadas
    console.log('Órdenes seleccionadas:', this.selected);
  }
}
