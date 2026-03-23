import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ToastModule } from 'primeng/toast';
import { MantenimientoService } from '../../mantenimiento/mantenimiento.service';
import { OrdenTransporteService } from '../../recepcion/ordentransporte/ordentransporte.service';

@Component({
  selector: 'app-modal-reasignar-repartidor',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule, ButtonModule, ToastModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <div class="p-2">
      <div class="text-sm text-gray-700 mb-3">
        <div><span class="font-semibold">OT:</span> {{ numcp || idordentrabajo }}</div>
      </div>

      <div class="mb-3">
        <label class="block text-sm font-medium text-gray-700 mb-1">Nuevo repartidor</label>
        <p-dropdown
          [options]="repartidores"
          [(ngModel)]="idproveedorSeleccionado"
          optionLabel="label"
          optionValue="value"
          [filter]="true"
          placeholder="Seleccione un repartidor"
          appendTo="body"
          class="w-full">
        </p-dropdown>
      </div>

      <div class="flex justify-end gap-2 mt-4">
        <button pButton type="button" label="Cancelar" class="p-button-secondary" (click)="cerrar()"></button>
        <button pButton type="button" label="Guardar" icon="pi pi-check"
                [disabled]="loading || !idproveedorSeleccionado"
                (click)="confirmarGuardar()"></button>
      </div>
    </div>
  `,
})
export class ModalReasignarRepartidorComponent implements OnInit {
  loading = false;
  idordentrabajo!: number;
  numcp: string = '';

  repartidores: SelectItem[] = [];
  idproveedorSeleccionado: number | null = null;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private mantenimientoService: MantenimientoService,
    private ordenService: OrdenTransporteService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.idordentrabajo = Number(this.config?.data?.idordentrabajo);
    this.numcp = String(this.config?.data?.numcp ?? '').trim();
    this.cargarRepartidores();
  }

  private cargarRepartidores(): void {
    this.loading = true;
    this.mantenimientoService.getProveedores('', 21514).subscribe({
      next: (resp: any[]) => {
        this.repartidores = (resp ?? []).map((p: any) => ({
          value: Number(p?.idProveedor ?? p?.idproveedor),
          label: `${p?.razonSocial ?? p?.razon_social ?? ''} - ${p?.ruc ?? ''}`.trim(),
        }));
      },
      error: (err) => {
        console.error('Error cargando repartidores:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Repartidores',
          detail: 'No se pudo cargar el listado de repartidores.',
        });
      },
      complete: () => (this.loading = false),
    });
  }

  confirmarGuardar(): void {
    const idProv = Number(this.idproveedorSeleccionado);
    if (!Number.isFinite(idProv) || idProv <= 0) return;

    this.confirmationService.confirm({
      header: 'Confirmación',
      message: '¿Desea reasignar el repartidor de esta OT?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => this.guardar(idProv),
    });
  }

  private guardar(idproveedor: number): void {
    if (this.loading) return;
    this.loading = true;
    this.ordenService.reasignarProveedor(this.idordentrabajo, idproveedor).subscribe({
      next: (resp: any) => {
        if (resp?.success === false) {
          this.messageService.add({
            severity: 'error',
            summary: 'Reasignar',
            detail: resp?.message ?? 'No se pudo reasignar el proveedor.',
          });
          return;
        }
        this.ref.close({ success: true, message: resp?.message });
      },
      error: (err) => {
        console.error('Error reasignando proveedor:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Reasignar',
          detail: err?.error?.message ?? 'Error al reasignar el proveedor.',
        });
      },
      complete: () => (this.loading = false),
    });
  }

  cerrar(): void {
    this.ref.close({ success: false });
  }
}

