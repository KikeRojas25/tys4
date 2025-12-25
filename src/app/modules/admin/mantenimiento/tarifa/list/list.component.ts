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
    this.tarifaService.getAllClientes('', 2).subscribe({
      next: (clientes) => {
        this.clientes = [];
        clientes.forEach(cliente => {
          this.clientes.push({ 
            value: cliente.idCliente, 
            label: `${cliente.razonSocial} - ${cliente.documento || '-'}`
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
}