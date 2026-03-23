import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { CheckboxModule } from 'primeng/checkbox';
import { MantenimientoService } from '../../mantenimiento.service';
import { Tarifa } from '../tarifa.types';

interface RangoTarifa {
  idtarifa?: number;
  montobase?: number;
  minimo?: number;
  desde?: number;
  hasta?: number;
  precio?: number;
  adicional?: number;
}

interface GuiaGRR {
  idguia?: number;
  nroGrr: string;
  nroDocumento: string;
  editando?: boolean;
}

@Component({
  selector: 'app-new',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    ButtonModule,
    ConfirmDialogModule,
    DropdownModule,
    InputTextModule,
    TableModule,
    ToastModule,
    CheckboxModule
  ],
  templateUrl: './new.component.html',
  styleUrls: ['./new.component.css'],
  providers: [ConfirmationService]
})
export class NewComponent implements OnInit {
  tarifaForm: FormGroup;
  esEdicion = false;
  loading = false;

  // Dropdowns
  clientes: SelectItem[] = [];
  centrosCosto: SelectItem[] = [];
  departamentosOrigen: SelectItem[] = [];
  provinciasOrigen: SelectItem[] = [];
  distritosOrigen: SelectItem[] = [];
  departamentosDestino: SelectItem[] = [];
  provinciasDestino: SelectItem[] = [];
  distritosDestino: SelectItem[] = [];
  formulas: SelectItem[] = [];
  tiposTransporte: SelectItem[] = [];
  tiposUnidad: SelectItem[] = [];
  conceptosCobro: SelectItem[] = [];

  // Rangos
  rangos: RangoTarifa[] = [];

  // Guías GRR
  guiasGrr: GuiaGRR[] = [];
  mostrarGuiasGrr = true;
  cantidadGuias = 0;

  // Variable para guardar el valor de fórmula que se debe establecer después de cargar las opciones
  idformulaPendiente: number | null = null;
  // Variable para setear centro de costo luego de cargar opciones
  idCentroCostoPendiente: number | null = null;

  constructor(
    private fb: FormBuilder,
    private mantenimientoService: MantenimientoService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {
    this.tarifaForm = this.fb.group({
      idcliente: [null, Validators.required],
      idcentrocosto: [null],
      idorigendepartamento: [null],
      idorigenprovincia: [null],
      idorigendistrito: [null],
      iddepartamentodestino: [null],
      idprovinciadestino: [null],
      iddistritodestino: [null],
      idformula: [null],
      idtipotransporte: [null],
      idtipounidad: [null],
      idconceptocobro: [null],
      consideraPesoVolumetrico: [false]
    });
  }

  ngOnInit(): void {
    this.cargarDatosIniciales();
    this.configurarCascadas();
    
    // Si se pasa data en config, es edición
    if (this.config.data?.tarifa) {
      this.esEdicion = true;
      // Si vienen múltiples tarifas (rangos), las cargamos todas
      if (this.config.data?.tarifas && this.config.data.tarifas.length > 0) {
        this.cargarTarifasParaEdicion(this.config.data.tarifas);
      } else {
        this.cargarTarifaParaEdicion(this.config.data.tarifa);
      }
    }

    // Pre-seleccionar cliente si viene del componente padre
    if (this.config.data?.idCliente) {
      this.tarifaForm.patchValue({ idcliente: this.config.data.idCliente });
    }
  }

  cargarDatosIniciales(): void {
    // Cargar clientes
    this.mantenimientoService.getAllClientes('', 2,true).subscribe({
      next: (clientes) => {
        this.clientes = clientes.map(c => ({
          value: c.idCliente,
          label: `${c.razonSocial} `
        }));
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los clientes'
        });
      }
    });

    // Cargar departamentos
    this.mantenimientoService.getDepartamentos().subscribe({
      next: (departamentos) => {
        this.departamentosOrigen = departamentos.map(d => ({
          value: d.idDepartamento,
          label: d.departamento
        }));
        this.departamentosDestino = [...this.departamentosOrigen];
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los departamentos'
        });
      }
    });

    // Cargar tablas de valores (Fórmulas, Tipos, etc.)
    this.cargarValoresTabla();
  }

  cargarValoresTabla(): void {
    // Cargar fórmulas desde el endpoint GetFormulas
    this.mantenimientoService.getFormulas().subscribe({
      next: (formulas) => {
        // Filtrar solo las fórmulas activas y mapear al formato SelectItem
        this.formulas = formulas
          .filter(f => f.activo)
          .map(f => ({
            value: f.idFormula,
            label: f.nombre || f.formula || `Fórmula ${f.idFormula}`
          }));
        // Si hay una fórmula pendiente de establecer, establecerla ahora que las opciones están cargadas
        if (this.idformulaPendiente !== null) {
          this.tarifaForm.patchValue({ idformula: this.idformulaPendiente });
          this.idformulaPendiente = null;
        }
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las fórmulas'
        });
      }
    });

    // Tipo Transporte (ejemplo: TablaId = 11)
    this.mantenimientoService.getValorTabla(4).subscribe({
      next: (valores) => {
        this.tiposTransporte = valores.map(v => ({
          value: v.idValorTabla,
          label: v.valor
        }));
      }
    });

    // Tipo Unidad (ejemplo: TablaId = 12)
    this.mantenimientoService.getValorTabla(7).subscribe({
      next: (valores) => {
        this.tiposUnidad = valores.map(v => ({
          value: v.idValorTabla,
          label: v.valor
        }));
      }
    });

    // Conceptos/Cobrar Por (ejemplo: TablaId = 13)
    this.mantenimientoService.getValorTabla(5).subscribe({
      next: (valores) => {
        this.conceptosCobro = valores.map(v => ({
          value: v.idValorTabla,
          label: v.valor
        }));
      }
    });
  }

  configurarCascadas(): void {
    // Centro de costo depende del cliente seleccionado
    this.tarifaForm.get('idcliente')?.valueChanges.subscribe((idCliente) => {
      // al cambiar cliente, limpiar selección y recargar lista
      this.tarifaForm.patchValue({ idcentrocosto: null }, { emitEvent: false });
      this.cargarCentroCosto(idCliente);
    });

    // Cascada Origen
    this.tarifaForm.get('idorigendepartamento')?.valueChanges.subscribe(idDep => {
      this.cargarProvinciasOrigen(idDep);
    });

    this.tarifaForm.get('idorigenprovincia')?.valueChanges.subscribe(idProv => {
      this.cargarDistritosOrigen(idProv);
    });

    // Cascada Destino
    this.tarifaForm.get('iddepartamentodestino')?.valueChanges.subscribe(idDep => {
      this.cargarProvinciasDestino(idDep);
    });

    this.tarifaForm.get('idprovinciadestino')?.valueChanges.subscribe(idProv => {
      this.cargarDistritosDestino(idProv);
    });
  }

  private cargarCentroCosto(idCliente: any): void {
    const id = Number(idCliente);
    if (!Number.isFinite(id) || id <= 0) {
      this.centrosCosto = [];
      return;
    }

    this.mantenimientoService.getAllCentroCosto(id).subscribe({
      next: (resp: any[]) => {
        this.centrosCosto = (resp ?? [])
          .map((x: any) => ({
            value: Number(x?.idCentroCosto ?? x?.IdCentroCosto ?? x?.idcentrocosto),
            label: String(x?.centroCostoNombre ?? x?.CentroCostoNombre ?? x?.nombre ?? '').trim()
          }))
          .filter((i: any) => Number.isFinite(Number(i.value)) && !!i.label);

        if (this.idCentroCostoPendiente !== null) {
          this.tarifaForm.patchValue({ idcentrocosto: this.idCentroCostoPendiente });
          this.idCentroCostoPendiente = null;
        }
      },
      error: () => {
        this.centrosCosto = [];
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los centros de costo'
        });
      }
    });
  }

  cargarProvinciasOrigen(iddepartamento: number): void {
    if (!iddepartamento) {
      this.provinciasOrigen = [];
      this.distritosOrigen = [];
      this.tarifaForm.patchValue({
        idorigenprovincia: null,
        idorigendistrito: null
      });
      return;
    }

    this.mantenimientoService.getProvinciasByDepartamento(iddepartamento).subscribe({
      next: (provincias) => {
        this.provinciasOrigen = provincias.map(p => ({
          value: p.idProvincia,
          label: p.provincia
        }));
        this.distritosOrigen = [];
        this.tarifaForm.patchValue({
          idorigenprovincia: null,
          idorigendistrito: null
        });
      }
    });
  }

  cargarDistritosOrigen(idprovincia: number): void {
    if (!idprovincia) {
      this.distritosOrigen = [];
      this.tarifaForm.patchValue({ idorigendistrito: null });
      return;
    }

    this.mantenimientoService.getDistritosByProvincia(idprovincia).subscribe({
      next: (distritos) => {
        this.distritosOrigen = distritos.map(d => ({
          value: d.idDistrito,
          label: d.distrito
        }));
        this.tarifaForm.patchValue({ idorigendistrito: null });
      }
    });
  }

  cargarProvinciasDestino(iddepartamento: number): void {
    if (!iddepartamento) {
      this.provinciasDestino = [];
      this.distritosDestino = [];
      this.tarifaForm.patchValue({
        idprovinciadestino: null,
        iddistritodestino: null
      });
      return;
    }

    this.mantenimientoService.getProvinciasByDepartamento(iddepartamento).subscribe({
      next: (provincias) => {
        this.provinciasDestino = provincias.map(p => ({
          value: p.idProvincia,
          label: p.provincia
        }));
        this.distritosDestino = [];
        this.tarifaForm.patchValue({
          idprovinciadestino: null,
          iddistritodestino: null
        });
      }
    });
  }

  cargarDistritosDestino(idprovincia: number): void {
    if (!idprovincia) {
      this.distritosDestino = [];
      this.tarifaForm.patchValue({ iddistritodestino: null });
      return;
    }

    this.mantenimientoService.getDistritosByProvincia(idprovincia).subscribe({
      next: (distritos) => {
        this.distritosDestino = distritos.map(d => ({
          value: d.idDistrito,
          label: d.distrito
        }));
        this.tarifaForm.patchValue({ iddistritodestino: null });
      }
    });
  }

  agregarRango(): void {
    this.rangos.push({
      montobase: 0,
      minimo: 0,
      desde: 0,
      hasta: 0,
      precio: 0,
      adicional: 0
    });
  }

  eliminarRango(index: number): void {
    const rango = this.rangos?.[index];
    if (!rango) return;

    this.confirmationService.confirm({
      message: '¿Está seguro de eliminar esta tarifa?',
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        const idTarifa = rango.idtarifa;

        // Si aún no existe en BD, solo quitar del arreglo
        if (!idTarifa) {
          this.rangos.splice(index, 1);
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Rango eliminado correctamente'
          });
          return;
        }

        // Si existe en BD, llamar al endpoint DELETE
        this.mantenimientoService.eliminarTarifa(idTarifa).subscribe({
          next: () => {
            this.rangos.splice(index, 1);
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: `Tarifa con ID ${idTarifa} eliminada`
            });
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
    });
  }

  cargarTarifasParaEdicion(tarifas: Tarifa[]): void {
    if (!tarifas || tarifas.length === 0) return;

    // Usar la primera tarifa para cargar los datos del formulario (origen, destino, etc.)
    const primeraTarifa = tarifas[0];
    
    // Guardar el valor de la fórmula para establecerlo después de que se carguen las opciones
    if (primeraTarifa.idformula) {
      this.idformulaPendiente = primeraTarifa.idformula;
    }
    
    // Cargar datos básicos primero
    this.tarifaForm.patchValue({
      idcliente: primeraTarifa.idcliente,
      idcentrocosto: (primeraTarifa as any)?.idcentrocosto ?? (primeraTarifa as any)?.idCentroCosto ?? (primeraTarifa as any)?.IdCentroCosto ?? null,
      idorigendepartamento: primeraTarifa.idorigendepartamento,
      iddepartamentodestino: primeraTarifa.iddepartamentodestino,
      idtipotransporte: primeraTarifa.idtipotransporte,
      idtipounidad: primeraTarifa.idtipounidad,
      idconceptocobro: primeraTarifa.idconceptocobro,
      consideraPesoVolumetrico: primeraTarifa.consideraPesoVolumetrico || false
    });

    // Cargar centros de costo para el cliente (y setear el valor si viene en edición)
    const cc = Number((primeraTarifa as any)?.idcentrocosto ?? (primeraTarifa as any)?.idCentroCosto ?? (primeraTarifa as any)?.IdCentroCosto);
    this.idCentroCostoPendiente = Number.isFinite(cc) ? cc : null;
    this.cargarCentroCosto(primeraTarifa.idcliente);

    // Si las fórmulas ya están cargadas, establecer el valor inmediatamente
    if (this.formulas.length > 0 && this.idformulaPendiente !== null) {
      this.tarifaForm.patchValue({ idformula: this.idformulaPendiente });
      this.idformulaPendiente = null;
    }

    // Cargar provincias y distritos de origen de forma secuencial
    if (primeraTarifa.idorigendepartamento) {
      this.cargarProvinciasOrigenParaEdicion(
        primeraTarifa.idorigendepartamento,
        primeraTarifa.idorigenprovincia,
        primeraTarifa.idorigendistrito
      );
    }

    // Cargar provincias y distritos de destino de forma secuencial
    if (primeraTarifa.iddepartamentodestino) {
      this.cargarProvinciasDestinoParaEdicion(
        primeraTarifa.iddepartamentodestino,
        primeraTarifa.idprovinciadestino,
        primeraTarifa.iddistritodestino
      );
    }

    // Cargar todos los rangos desde las tarifas recibidas
    this.rangos = tarifas.map(tarifa => ({
      idtarifa: tarifa.idtarifa, // Guardar el ID para poder actualizar
      montobase: tarifa.montobase,
      minimo: tarifa.minimo,
      desde: tarifa.desde,
      hasta: tarifa.hasta,
      precio: tarifa.precio,
      adicional: tarifa.adicional
    }));
  }

  cargarTarifaParaEdicion(tarifa: Tarifa): void {
    // Guardar el valor de la fórmula para establecerlo después de que se carguen las opciones
    if (tarifa.idformula) {
      this.idformulaPendiente = tarifa.idformula;
    }
    
    // Cargar datos básicos primero
    this.tarifaForm.patchValue({
      idcliente: tarifa.idcliente,
      idcentrocosto: (tarifa as any)?.idcentrocosto ?? (tarifa as any)?.idCentroCosto ?? (tarifa as any)?.IdCentroCosto ?? null,
      idorigendepartamento: tarifa.idorigendepartamento,
      iddepartamentodestino: tarifa.iddepartamentodestino,
      idtipotransporte: tarifa.idtipotransporte,
      idtipounidad: tarifa.idtipounidad,
      idconceptocobro: tarifa.idconceptocobro,
      consideraPesoVolumetrico: tarifa.consideraPesoVolumetrico || false
    });

    const cc = Number((tarifa as any)?.idcentrocosto ?? (tarifa as any)?.idCentroCosto ?? (tarifa as any)?.IdCentroCosto);
    this.idCentroCostoPendiente = Number.isFinite(cc) ? cc : null;
    this.cargarCentroCosto(tarifa.idcliente);

    // Si las fórmulas ya están cargadas, establecer el valor inmediatamente
    if (this.formulas.length > 0 && this.idformulaPendiente !== null) {
      this.tarifaForm.patchValue({ idformula: this.idformulaPendiente });
      this.idformulaPendiente = null;
    }

    // Cargar provincias y distritos de origen de forma secuencial
    if (tarifa.idorigendepartamento) {
      this.cargarProvinciasOrigenParaEdicion(
        tarifa.idorigendepartamento,
        tarifa.idorigenprovincia,
        tarifa.idorigendistrito
      );
    }

    // Cargar provincias y distritos de destino de forma secuencial
    if (tarifa.iddepartamentodestino) {
      this.cargarProvinciasDestinoParaEdicion(
        tarifa.iddepartamentodestino,
        tarifa.idprovinciadestino,
        tarifa.iddistritodestino
      );
    }

    // Cargar rangos
    if (tarifa.montobase !== undefined || tarifa.precio !== undefined) {
      this.rangos = [{
        idtarifa: tarifa.idtarifa, // Guardar el ID para poder actualizar
        montobase: tarifa.montobase,
        minimo: tarifa.minimo,
        desde: tarifa.desde,
        hasta: tarifa.hasta,
        precio: tarifa.precio,
        adicional: tarifa.adicional
      }];
    }
  }

  cargarProvinciasOrigenParaEdicion(iddepartamento: number, idprovincia?: number, iddistrito?: number): void {
    this.mantenimientoService.getProvinciasByDepartamento(iddepartamento).subscribe({
      next: (provincias) => {
        this.provinciasOrigen = provincias.map(p => ({
          value: p.idProvincia,
          label: p.provincia
        }));
        
        // Establecer la provincia si viene en los datos
        if (idprovincia) {
          this.tarifaForm.patchValue({ idorigenprovincia: idprovincia });
          
          // Cargar distritos si también viene el distrito
          if (iddistrito) {
            this.cargarDistritosOrigenParaEdicion(idprovincia, iddistrito);
          }
        }
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las provincias de origen'
        });
      }
    });
  }

  cargarDistritosOrigenParaEdicion(idprovincia: number, iddistrito?: number): void {
    this.mantenimientoService.getDistritosByProvincia(idprovincia).subscribe({
      next: (distritos) => {
        this.distritosOrigen = distritos.map(d => ({
          value: d.idDistrito,
          label: d.distrito
        }));
        
        // Establecer el distrito si viene en los datos
        if (iddistrito) {
          this.tarifaForm.patchValue({ idorigendistrito: iddistrito });
        }
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los distritos de origen'
        });
      }
    });
  }

  cargarProvinciasDestinoParaEdicion(iddepartamento: number, idprovincia?: number, iddistrito?: number): void {
    this.mantenimientoService.getProvinciasByDepartamento(iddepartamento).subscribe({
      next: (provincias) => {
        this.provinciasDestino = provincias.map(p => ({
          value: p.idProvincia,
          label: p.provincia
        }));
        
        // Establecer la provincia si viene en los datos
        if (idprovincia) {
          this.tarifaForm.patchValue({ idprovinciadestino: idprovincia });
          
          // Cargar distritos si también viene el distrito
          if (iddistrito) {
            this.cargarDistritosDestinoParaEdicion(idprovincia, iddistrito);
          }
        }
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las provincias de destino'
        });
      }
    });
  }

  cargarDistritosDestinoParaEdicion(idprovincia: number, iddistrito?: number): void {
    this.mantenimientoService.getDistritosByProvincia(idprovincia).subscribe({
      next: (distritos) => {
        this.distritosDestino = distritos.map(d => ({
          value: d.idDistrito,
          label: d.distrito
        }));
        
        // Establecer el distrito si viene en los datos
        if (iddistrito) {
          this.tarifaForm.patchValue({ iddistritodestino: iddistrito });
        }
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los distritos de destino'
        });
      }
    });
  }

  guardar(): void {
    if (this.tarifaForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Complete los campos requeridos'
      });
      this.tarifaForm.markAllAsTouched();
      return;
    }

    if (this.rangos.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debe agregar al menos un rango de precios'
      });
      return;
    }

    this.loading = true;

    // Preparar datos para guardar
    const tarifasAGuardar: Tarifa[] = this.rangos.map(rango => ({
      ...this.tarifaForm.value,
      ...rango,
      idtarifa: rango.idtarifa // Preservar el ID de la tarifa si existe
    }));

    // Guardar cada tarifa (cada rango es una tarifa independiente)
    const requests = tarifasAGuardar.map(tarifa => {
      // Si es edición y el rango tiene idtarifa, actualizar; sino crear
      if (this.esEdicion && tarifa.idtarifa) {
        return this.mantenimientoService.actualizarTarifa(tarifa.idtarifa, tarifa);
      } else {
        return this.mantenimientoService.crearTarifa(tarifa);
      }
    });

    // Ejecutar todas las peticiones
    Promise.all(requests.map(req => req.toPromise()))
      .then(() => {
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Tarifa${this.rangos.length > 1 ? 's' : ''} ${this.esEdicion ? 'actualizada' : 'creada'} correctamente`
        });
        this.ref.close(true);
      })
      .catch(error => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `No se pudo ${this.esEdicion ? 'actualizar' : 'crear'} la tarifa`
        });
      });
  }

  cancelar(): void {
    this.ref.close(false);
  }

  // ===== MÉTODOS PARA GUÍAS GRR =====
  
  generarGuiasMasivas(): void {
    if (this.cantidadGuias <= 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Ingrese una cantidad válida de guías a generar'
      });
      return;
    }

    // Generar las guías con números correlativos
    const nuevasGuias: GuiaGRR[] = [];
    const baseGrr = Date.now(); // Usar timestamp como base para generar números únicos
    
    for (let i = 0; i < this.cantidadGuias; i++) {
      nuevasGuias.push({
        nroGrr: `GRR-${baseGrr + i}`,
        nroDocumento: '',
        editando: false
      });
    }

    this.guiasGrr = [...this.guiasGrr, ...nuevasGuias];
    this.cantidadGuias = 0; // Resetear el contador
    this.mostrarGuiasGrr = true; // Asegurar que la tabla se muestre

    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: `Se generaron ${nuevasGuias.length} guías GRR`
    });
  }

  toggleMostrarGuias(): void {
    this.mostrarGuiasGrr = !this.mostrarGuiasGrr;
  }

  editarGuia(guia: GuiaGRR): void {
    // Desactivar edición en todas las guías
    this.guiasGrr.forEach(g => g.editando = false);
    // Activar edición en la guía seleccionada
    guia.editando = true;
  }

  actualizarGuia(guia: GuiaGRR): void {
    if (!guia.nroGrr || guia.nroGrr.trim() === '') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'El número de GRR no puede estar vacío'
      });
      return;
    }

    // Desactivar modo edición
    guia.editando = false;

    // Aquí podrías hacer una llamada al servicio para actualizar en backend
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Guía actualizada correctamente'
    });
  }

  cancelarEdicionGuia(guia: GuiaGRR): void {
    guia.editando = false;
  }

  eliminarGuia(index: number): void {
    this.guiasGrr.splice(index, 1);
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Guía eliminada correctamente'
    });
  }

  limpiarTodasLasGuias(): void {
    this.guiasGrr = [];
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Todas las guías han sido eliminadas'
    });
  }
}

