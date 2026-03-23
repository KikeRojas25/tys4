import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService, SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { ComercialService } from '../../comercial.service';
import { MantenimientoService } from '../../../mantenimiento/mantenimiento.service';
import { LeadTime } from '../leadtimes.types';

@Component({
  selector: 'app-leadtimes-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownModule,
    InputNumberModule,
    ButtonModule,
    ToastModule,
  ],
  providers: [MessageService],
})
export class FormComponent implements OnInit {
  form: FormGroup;
  loading = false;
  esEdicion = false;
  clientes: SelectItem[] = [];
  departamentosOrigen: SelectItem[] = [];
  provinciasOrigen: SelectItem[] = [];
  departamentosDestino: SelectItem[] = [];
  provinciasDestino: SelectItem[] = [];

  constructor(
    private fb: FormBuilder,
    private comercialService: ComercialService,
    private mantenimientoService: MantenimientoService,
    private messageService: MessageService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {
    this.form = this.fb.group({
      idCliente: [null, Validators.required],
      idOrigenDepartamento: [null],
      idOrigenProvincia: [null, Validators.required],
      idDestinoDepartamento: [null],
      idDestinoProvincia: [null, Validators.required],
      horas: [null, [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit(): void {
    this.cargarClientes();
    this.cargarDepartamentos();
    this.configurarCascadas();

    const leadTime = this.config.data?.leadTime as LeadTime | undefined;
    if (leadTime) {
      this.esEdicion = true;
      this.form.patchValue({
        idCliente: leadTime.idCliente,
        idOrigenProvincia: leadTime.idOrigenProvincia,
        idDestinoProvincia: leadTime.idDestinoProvincia,
        horas: leadTime.horas,
      });
      // Cargar departamentos para origen/destino si tenemos datos
      if (leadTime.idOrigenDepartamento) {
        this.cargarProvinciasOrigen(leadTime.idOrigenDepartamento);
        this.form.patchValue({ idOrigenDepartamento: leadTime.idOrigenDepartamento });
      }
      if (leadTime.idDestinoDepartamento) {
        this.cargarProvinciasDestino(leadTime.idDestinoDepartamento);
        this.form.patchValue({ idDestinoDepartamento: leadTime.idDestinoDepartamento });
      }
    } else if (this.config.data?.idCliente) {
      this.form.patchValue({ idCliente: this.config.data.idCliente });
    }
  }

  cargarClientes(): void {
    this.mantenimientoService.getAllClientes('', 2, true).subscribe({
      next: (clientes) => {
        this.clientes = clientes.map((c) => ({
          value: c.idCliente,
          label: c.razonSocial ?? '',
        }));
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los clientes',
        });
      },
    });
  }

  cargarDepartamentos(): void {
    this.mantenimientoService.getDepartamentos().subscribe({
      next: (departamentos) => {
        const items = departamentos.map((d) => ({
          value: d.idDepartamento,
          label: d.departamento,
        }));
        this.departamentosOrigen = items;
        this.departamentosDestino = [...items];
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los departamentos',
        });
      },
    });
  }

  cargarProvinciasOrigen(idDepartamento: number): void {
    if (!idDepartamento) {
      this.provinciasOrigen = [];
      this.form.patchValue({ idOrigenProvincia: null });
      return;
    }
    this.mantenimientoService.getProvinciasByDepartamento(idDepartamento).subscribe({
      next: (provincias) => {
        this.provinciasOrigen = provincias.map((p) => ({
          value: p.idProvincia,
          label: p.provincia,
        }));
        this.form.patchValue({ idOrigenProvincia: null });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las provincias',
        });
      },
    });
  }

  cargarProvinciasDestino(idDepartamento: number): void {
    if (!idDepartamento) {
      this.provinciasDestino = [];
      this.form.patchValue({ idDestinoProvincia: null });
      return;
    }
    this.mantenimientoService.getProvinciasByDepartamento(idDepartamento).subscribe({
      next: (provincias) => {
        this.provinciasDestino = provincias.map((p) => ({
          value: p.idProvincia,
          label: p.provincia,
        }));
        this.form.patchValue({ idDestinoProvincia: null });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las provincias',
        });
      },
    });
  }

  configurarCascadas(): void {
    this.form.get('idOrigenDepartamento')?.valueChanges.subscribe((id) => {
      this.cargarProvinciasOrigen(id);
    });
    this.form.get('idDestinoDepartamento')?.valueChanges.subscribe((id) => {
      this.cargarProvinciasDestino(id);
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Complete todos los campos requeridos',
      });
      return;
    }

    this.loading = true;
    const v = this.form.value;
    const clienteLabel = this.clientes.find((c) => c.value === v.idCliente)?.label ?? '';
    const origenLabel = this.provinciasOrigen.find((p) => p.value === v.idOrigenProvincia)?.label ?? '';
    const destinoLabel = this.provinciasDestino.find((p) => p.value === v.idDestinoProvincia)?.label ?? '';

    const model: LeadTime = {
      id: this.config.data?.leadTime?.id,
      idCliente: v.idCliente,
      cliente: clienteLabel,
      idOrigenDepartamento: v.idOrigenDepartamento,
      idOrigenProvincia: v.idOrigenProvincia,
      origenProvincia: origenLabel,
      idDestinoDepartamento: v.idDestinoDepartamento,
      idDestinoProvincia: v.idDestinoProvincia,
      destinoProvincia: destinoLabel,
      horas: v.horas,
    };

    this.comercialService.guardarLeadTime(model).subscribe({
      next: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: this.esEdicion ? 'Lead time actualizado correctamente' : 'Lead time creado correctamente',
        });
        this.ref.close(true);
      },
      error: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo guardar el lead time',
        });
      },
    });
  }

  cancelar(): void {
    this.ref.close(false);
  }
}
