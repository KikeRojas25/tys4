import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';

import { MantenimientoService } from '../mantenimiento.service';
import { User } from 'app/core/user/user.types';

@Component({
  selector: 'app-tarifa-ajustes',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatIconModule, TableModule, ButtonModule, TagModule,
    DropdownModule, CalendarModule, InputNumberModule, InputTextModule,
    ToastModule, ConfirmDialogModule, DialogModule, TooltipModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './tarifa-ajustes.component.html',
})
export class TarifaAjustesComponent implements OnInit {
  clientes: SelectItem[] = [];
  idClienteSeleccionado: number | null = null;
  ajustes: any[] = [];
  loading = false;
  dialogVisible = false;
  guardando = false;
  form: FormGroup;
  user: User;

  constructor(
    private fb: FormBuilder,
    private mantenimientoService: MantenimientoService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {}

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('user') || '{}');
    this.form = this.fb.group({
      porcentaje: [null, [Validators.required, Validators.min(-99.99), Validators.max(10000)]],
      motivo:     ['', Validators.maxLength(200)],
      fechaDesde: [new Date(), Validators.required],
      fechaHasta: [null],
    });
    this.cargarClientes();
  }

  cargarClientes(): void {
    this.mantenimientoService.getAllClientes('', 2, true).subscribe({
      next: (list) => {
        this.clientes = list.map(c => ({ value: c.idCliente, label: c.razonSocial }));
      },
    });
  }

  onClienteChange(): void {
    if (this.idClienteSeleccionado) this.cargarAjustes();
    else this.ajustes = [];
  }

  cargarAjustes(): void {
    this.loading = true;
    this.mantenimientoService.getTarifaAjustesByCliente(this.idClienteSeleccionado!).subscribe({
      next: (data) => (this.ajustes = data),
      error: () => this.mostrarError('No se pudieron cargar los ajustes.'),
      complete: () => (this.loading = false),
    });
  }

  abrirNuevo(): void {
    if (!this.idClienteSeleccionado) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Seleccione un cliente primero.' });
      return;
    }
    this.form.reset({ porcentaje: null, motivo: '', fechaDesde: new Date(), fechaHasta: null });
    this.dialogVisible = true;
  }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.guardando = true;
    const v = this.form.value;
    const factor = Math.round((1 + v.porcentaje / 100) * 1000000) / 1000000;
    this.mantenimientoService.createTarifaAjuste({
      idCliente:        this.idClienteSeleccionado!,
      factor:           factor,
      motivo:           v.motivo || null,
      fechaDesde:       this.toDateStr(v.fechaDesde),
      fechaHasta:       v.fechaHasta ? this.toDateStr(v.fechaHasta) : null,
      idUsuarioRegistro: this.user?.usr_int_id ?? null,
    }).subscribe({
      next: (res) => {
        this.dialogVisible = false;
        this.guardando = false;
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: res.message, life: 3000 });
        this.cargarAjustes();
      },
      error: (err) => {
        this.guardando = false;
        this.mostrarError(err?.error?.message || 'Error al guardar.');
      },
    });
  }

  inactivar(ajuste: any): void {
    this.confirmationService.confirm({
      message: `¿Inactivar el ajuste con factor ${ajuste.factor} (${ajuste.porcentajeAjuste > 0 ? '+' : ''}${ajuste.porcentajeAjuste}%)?`,
      header: 'Confirmar inactivación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Inactivar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.mantenimientoService.inactivarTarifaAjuste(ajuste.id).subscribe({
          next: (res) => {
            this.messageService.add({ severity: 'success', summary: 'Inactivado', detail: res.message, life: 3000 });
            this.cargarAjustes();
          },
          error: (err) => this.mostrarError(err?.error?.message || 'Error al inactivar.'),
        });
      },
    });
  }

  eliminar(ajuste: any): void {
    this.confirmationService.confirm({
      message: `¿Eliminar definitivamente el ajuste del ${this.formatDate(ajuste.fechaDesde)}?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.mantenimientoService.eliminarTarifaAjuste(ajuste.id).subscribe({
          next: (res) => {
            this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: res.message, life: 3000 });
            this.cargarAjustes();
          },
          error: (err) => this.mostrarError(err?.error?.message || 'Error al eliminar.'),
        });
      },
    });
  }

  get factorCalculado(): number {
    const p = this.form.get('porcentaje')?.value;
    return p !== null && p !== undefined
      ? Math.round((1 + p / 100) * 1000000) / 1000000
      : 1;
  }

  private toDateStr(d: Date): string {
    return d instanceof Date ? d.toISOString().split('T')[0] : d;
  }

  formatDate(d: string | Date): string {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  private mostrarError(msg: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: msg, life: 4000 });
  }
}
