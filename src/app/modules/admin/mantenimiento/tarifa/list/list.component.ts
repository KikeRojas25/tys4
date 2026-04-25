import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import {  Tarifa } from '../tarifa.types';

import { MantenimientoService } from '../../mantenimiento.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { NewComponent } from '../new/new.component';
import { ModalActualizacionMasivaComponent } from './modal-actualizacion-masiva.component';

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
      CardModule,
      ButtonModule,
      TooltipModule
    ],
    providers: [DialogService,ConfirmationService, MessageService  ]
})
export class ListComponent implements OnInit {
 tarifas: Tarifa[] = [];
  clientes: SelectItem[] = [];
  
  // Origen
  departamentosOrigen: SelectItem[] = [];
  provinciasOrigen: SelectItem[] = [];
  distritosOrigen: SelectItem[] = [];
  
  // Destino
  departamentosDestino: SelectItem[] = [];
  provinciasDestino: SelectItem[] = [];
  distritosDestino: SelectItem[] = [];
  
  // Tipos de Transporte
  tiposTransporte: SelectItem[] = [];
  
  filtroForm: FormGroup;
  loading = false;
  
  // Para paginación
  first = 0;
  rows = 40;
  totalRecords = 0;

  constructor(
    private fb: FormBuilder,
    private tarifaService: MantenimientoService,
    private messageService: MessageService,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService
  ) {
    this.filtroForm = this.fb.group({
      idCliente: [null],
      idorigendepartamento: [null],
      idorigenprovincia: [null],
      idorigendistrito: [null],
      iddepartamentodestino: [null],
      idprovinciadestino: [null],
      iddistritodestino: [null],
      idtipotransporte: [null]
    });
  }

  ngOnInit(): void {
    this.cargarClientes();
    this.cargarDepartamentos();
    this.cargarTiposTransporte();
    this.configurarCascadas();
  }

  cargarClientes(): void {
    this.tarifaService.getAllClientes('', 2, true).subscribe({
      next: (clientes) => {
        this.clientes = [];
        clientes.forEach(cliente => {
          this.clientes.push({ 
            value: cliente.idCliente, 
            label: `${cliente.razonSocial} `
          });
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los clientes'
        });
      }
    });
  }

  cargarDepartamentos(): void {
    this.tarifaService.getDepartamentos().subscribe({
      next: (departamentos) => {
        this.departamentosOrigen = departamentos.map(d => ({
          value: d.idDepartamento,
          label: d.departamento
        }));
        this.departamentosDestino = [...this.departamentosOrigen];
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los departamentos'
        });
      }
    });
  }

  cargarTiposTransporte(): void {
    // Tipo Transporte (TablaId = 4)
    this.tarifaService.getValorTabla(4).subscribe({
      next: (valores) => {
        this.tiposTransporte = valores.map(v => ({
          value: v.idValorTabla,
          label: v.valor
        }));
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los tipos de transporte'
        });
      }
    });
  }

  cargarProvinciasOrigen(iddepartamento: number): void {
    if (!iddepartamento) {
      this.provinciasOrigen = [];
      this.distritosOrigen = [];
      this.filtroForm.patchValue({
        idorigenprovincia: null,
        idorigendistrito: null
      });
      return;
    }

    this.tarifaService.getProvinciasByDepartamento(iddepartamento).subscribe({
      next: (provincias) => {
        this.provinciasOrigen = provincias.map(p => ({
          value: p.idProvincia,
          label: p.provincia
        }));
        this.distritosOrigen = [];
        this.filtroForm.patchValue({
          idorigenprovincia: null,
          idorigendistrito: null
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las provincias'
        });
      }
    });
  }

  cargarDistritosOrigen(idprovincia: number): void {
    if (!idprovincia) {
      this.distritosOrigen = [];
      this.filtroForm.patchValue({ idorigendistrito: null });
      return;
    }

    this.tarifaService.getDistritosByProvincia(idprovincia).subscribe({
      next: (distritos) => {
        this.distritosOrigen = distritos.map(d => ({
          value: d.idDistrito,
          label: d.distrito
        }));
        this.filtroForm.patchValue({ idorigendistrito: null });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los distritos'
        });
      }
    });
  }

  cargarProvinciasDestino(iddepartamento: number): void {
    if (!iddepartamento) {
      this.provinciasDestino = [];
      this.distritosDestino = [];
      this.filtroForm.patchValue({
        idprovinciadestino: null,
        iddistritodestino: null
      });
      return;
    }

    this.tarifaService.getProvinciasByDepartamento(iddepartamento).subscribe({
      next: (provincias) => {
        this.provinciasDestino = provincias.map(p => ({
          value: p.idProvincia,
          label: p.provincia
        }));
        this.distritosDestino = [];
        this.filtroForm.patchValue({
          idprovinciadestino: null,
          iddistritodestino: null
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las provincias'
        });
      }
    });
  }

  cargarDistritosDestino(idprovincia: number): void {
    if (!idprovincia) {
      this.distritosDestino = [];
      this.filtroForm.patchValue({ iddistritodestino: null });
      return;
    }

    this.tarifaService.getDistritosByProvincia(idprovincia).subscribe({
      next: (distritos) => {
        this.distritosDestino = distritos.map(d => ({
          value: d.idDistrito,
          label: d.distrito
        }));
        this.filtroForm.patchValue({ iddistritodestino: null });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los distritos'
        });
      }
    });
  }

  configurarCascadas(): void {
    // Cascada Origen: Departamento -> Provincia -> Distrito
    this.filtroForm.get('idorigendepartamento')?.valueChanges.subscribe(iddepartamento => {
      this.cargarProvinciasOrigen(iddepartamento);
    });

    this.filtroForm.get('idorigenprovincia')?.valueChanges.subscribe(idprovincia => {
      this.cargarDistritosOrigen(idprovincia);
    });

    // Cascada Destino: Departamento -> Provincia -> Distrito
    this.filtroForm.get('iddepartamentodestino')?.valueChanges.subscribe(iddepartamento => {
      this.cargarProvinciasDestino(iddepartamento);
    });

    this.filtroForm.get('idprovinciadestino')?.valueChanges.subscribe(idprovincia => {
      this.cargarDistritosDestino(idprovincia);
    });
  }

  buscarTarifas(): void {
    const filtro = this.filtroForm.value;
    
    if (!filtro.idCliente) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debe seleccionar un cliente'
      });
      return;
    }

    this.loading = true;
    this.tarifaService.obtenerTarifasPorCliente(
      filtro.idCliente,
      filtro.idorigendepartamento,
      filtro.idorigenprovincia,
      filtro.idorigendistrito,
      filtro.iddepartamentodestino,
      filtro.idprovinciadestino,
      filtro.iddistritodestino,
      filtro.idtipotransporte
    ).subscribe({
      next: (tarifas) => {
        this.tarifas = tarifas;
        console.log(this.tarifas);
        this.totalRecords = tarifas.length;
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Se encontraron ${tarifas.length} tarifas`
        });
      },
      error: (error) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las tarifas'
        });
      }
    });
  }

  abrirActualizacionMasiva(): void {
    const idCliente = this.filtroForm.value.idCliente;
    if (!idCliente) {
      this.messageService.add({
        severity: 'warn', summary: 'Atención',
        detail: 'Debe seleccionar un cliente antes de usar la actualización masiva.'
      });
      return;
    }

    const clienteLabel = this.clientes.find(c => c.value === idCliente)?.label ?? '';

    const ref = this.dialogService.open(ModalActualizacionMasivaComponent, {
      header: `Actualización Masiva — ${clienteLabel}`,
      width: '520px',
      closable: true,
      modal: true,
      dismissableMask: true,
      baseZIndex: 10000,
      data: { idCliente },
    });

    ref.onClose.subscribe((result) => {
      if (result?.cantidad != null) {
        this.messageService.add({
          severity: 'success',
          summary: 'Actualización Masiva',
          detail: result.message,
          life: 4000,
        });
        this.refrescar();
      }
    });
  }

  nuevaTarifa(): void {
    const idClienteSeleccionado = this.filtroForm.value.idCliente;
    
    const ref = this.dialogService.open(NewComponent, {
      header: 'Nueva Tarifa',
      width: '90vw',
      height: '90vh',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true,
      data: {
        idCliente: idClienteSeleccionado
      }
    });

    ref.onClose.subscribe((resultado) => {
      if (resultado) {
        // Si se guardó correctamente, refrescar la lista
        this.refrescar();
      }
    });
  }

  editarTarifa(tarifa: Tarifa): void {
    // Primero obtenemos todas las tarifas con el mismo origen/destino
    if (!tarifa.idtarifa) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo obtener el ID de la tarifa'
      });
      return;
    }

    this.loading = true;
    this.tarifaService.obtenerTarifasMismoOrigenDestino(tarifa.idtarifa).subscribe({
      next: (tarifas) => {
        this.loading = false;
        
        // Abrir el diálogo con todas las tarifas del mismo origen/destino
        const ref = this.dialogService.open(NewComponent, {
          header: 'Editar Tarifa',
          width: '90vw',
          height: '90vh',
          contentStyle: { overflow: 'auto' },
          baseZIndex: 10000,
          maximizable: true,
          data: {
            tarifas: tarifas, // Enviamos todas las tarifas (rangos)
            tarifa: tarifas[0] // También enviamos la primera para mantener compatibilidad
          }
        });

        ref.onClose.subscribe((resultado) => {
          if (resultado) {
            // Si se actualizó correctamente, refrescar la lista
            this.refrescar();
          }
        });
      },
      error: (error) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar la información de la tarifa'
        });
      }
    });
  }

  eliminarTarifa(tarifa: Tarifa): void {
    this.confirmationService.confirm({
      message: '¿Está seguro de eliminar esta tarifa?',
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        if (tarifa.idtarifa) {
          this.tarifaService.eliminarTarifa(tarifa.idtarifa).subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Tarifa eliminada correctamente'
              });
              this.refrescar();
            },
            error: () => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo eliminar la tarifa'
              });
            }
          });
        }
      }
    });
  }

  onPageChange(event: any): void {
    this.first = event.first;
    this.rows = event.rows;
  }

  refrescar(): void {
    if (this.filtroForm.value.idCliente) {
      this.buscarTarifas();
    }
  }

  getOrigenConcatenado(tarifa: Tarifa): string {
    const partes = [];
    if (tarifa.origendepartamento) partes.push(tarifa.origendepartamento);
    if (tarifa.origenprovincia) partes.push(tarifa.origenprovincia);
    if (tarifa.origendistrito) partes.push(tarifa.origendistrito);
    return partes.length > 0 ? partes.join(' - ') : '-';
  }

  getDestinoConcatenado(tarifa: Tarifa): string {
    const partes = [];
    if (tarifa.destinodepartamento) partes.push(tarifa.destinodepartamento);
    if (tarifa.destinoprovincia) partes.push(tarifa.destinoprovincia);
    if (tarifa.destinodistrito) partes.push(tarifa.destinodistrito);
    return partes.length > 0 ? partes.join(' - ') : '-';
  }

  exportarExcel(): void {
    if (this.tarifas.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'No hay tarifas para exportar'
      });
      return;
    }

    import('xlsx').then((xlsx: any) => {
      const XLSX: any = xlsx?.default ?? xlsx;
      const exportData = this.tarifas.map(tarifa => ({
        'Cliente': tarifa.razonsocial || '-',
        'Origen - Departamento': tarifa.origendepartamento || '-',
        'Origen - Provincia': tarifa.origenprovincia || '-',
        'Origen - Distrito': tarifa.origendistrito || '-',
        'Destino - Departamento': tarifa.destinodepartamento || '-',
        'Destino - Provincia': tarifa.destinoprovincia || '-',
        'Destino - Distrito': tarifa.destinodistrito || '-',
        'Fórmula': tarifa.formula || '-',
        'Tipo Transporte': tarifa.tipotransporte || '-',
        'Cobrar Por': tarifa.conceptos || '-',
        'Tipo Unidad': tarifa.tipounidad || '-',
        'Base': tarifa.montobase || 0,
        'Mínimo': tarifa.minimo || 0,
        'Desde': tarifa.desde || 0,
        'Hasta': tarifa.hasta || 0,
        'Precio': tarifa.precio || 0,
        'Adicional': tarifa.adicional || 0
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = { Sheets: { 'Tarifas': worksheet }, SheetNames: ['Tarifas'] };
      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, 'Tarifas');
    });
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    import('file-saver').then((FileSaver) => {
      const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
      const EXCEL_EXTENSION = '.xlsx';
      const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
      FileSaver.default.saveAs(data, fileName + '_' + new Date().getTime() + EXCEL_EXTENSION);
      
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Archivo Excel exportado correctamente'
      });
    });
  }

  exportarPDF(): void {
    if (this.tarifas.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'No hay tarifas para exportar'
      });
      return;
    }

    // Crear HTML para el PDF
    const fechaExportacion = new Date().toLocaleString('es-PE');
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Lista de Tarifas</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; font-size: 10px; }
          h1 { font-size: 18px; margin-bottom: 10px; }
          .fecha { font-size: 10px; margin-bottom: 15px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { background-color: #374151; color: white; padding: 8px; text-align: left; font-weight: bold; border: 1px solid #ddd; }
          td { padding: 6px; border: 1px solid #ddd; }
          tr:nth-child(even) { background-color: #f9fafb; }
          .text-right { text-align: right; }
          @media print {
            body { margin: 0; }
            @page { size: landscape; margin: 10mm; }
          }
        </style>
      </head>
      <body>
        <h1>Lista de Tarifas</h1>
        <div class="fecha">Exportado el: ${fechaExportacion}</div>
        <table>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Origen Dept</th>
              <th>Origen Prov</th>
              <th>Origen Dist</th>
              <th>Destino Dept</th>
              <th>Destino Prov</th>
              <th>Destino Dist</th>
              <th>Fórmula</th>
              <th>Tipo Transporte</th>
              <th>Cobrar Por</th>
              <th>Tipo Unidad</th>
              <th class="text-right">Base</th>
              <th class="text-right">Mínimo</th>
              <th class="text-right">Desde</th>
              <th class="text-right">Hasta</th>
              <th class="text-right">Precio</th>
              <th class="text-right">Adicional</th>
            </tr>
          </thead>
          <tbody>
    `;

    this.tarifas.forEach(tarifa => {
      htmlContent += `
        <tr>
          <td>${tarifa.razonsocial || '-'}</td>
          <td>${tarifa.origendepartamento || '-'}</td>
          <td>${tarifa.origenprovincia || '-'}</td>
          <td>${tarifa.origendistrito || '-'}</td>
          <td>${tarifa.destinodepartamento || '-'}</td>
          <td>${tarifa.destinoprovincia || '-'}</td>
          <td>${tarifa.destinodistrito || '-'}</td>
          <td>${tarifa.formula || '-'}</td>
          <td>${tarifa.tipotransporte || '-'}</td>
          <td>${tarifa.conceptos || '-'}</td>
          <td>${tarifa.tipounidad || '-'}</td>
          <td class="text-right">${(tarifa.montobase || 0).toFixed(2)}</td>
          <td class="text-right">${(tarifa.minimo || 0).toFixed(2)}</td>
          <td class="text-right">${(tarifa.desde || 0).toFixed(2)}</td>
          <td class="text-right">${(tarifa.hasta || 0).toFixed(2)}</td>
          <td class="text-right">${(tarifa.precio || 0).toFixed(2)}</td>
          <td class="text-right">${(tarifa.adicional || 0).toFixed(2)}</td>
        </tr>
      `;
    });

    htmlContent += `
          </tbody>
        </table>
      </body>
      </html>
    `;

    // Crear ventana nueva y abrir el PDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Esperar a que el contenido se cargue y luego imprimir/guardar como PDF
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'PDF generado. Use la opción "Guardar como PDF" en el diálogo de impresión.'
          });
        }, 250);
      };
    }
  }
}