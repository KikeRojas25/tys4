import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService, DynamicDialogModule, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';

import { MantenimientoService } from '../../mantenimiento.service';
import { EditComponent } from '../edit/edit.component';
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
    ButtonModule,
    ConfirmDialogModule,
    InputTextModule,
    MatIcon,
    DynamicDialogModule,
    ToastModule,
    TagModule,
    TooltipModule,
    CheckboxModule,
  ],
  providers: [ConfirmationService, DialogService, MessageService],
})
export class ListComponent implements OnInit {
  ref: DynamicDialogRef | undefined;
  clientes: any[] = [];
  busqueda = '';
  busquedaActiva = '';
  mostrarInactivos = false;
  soloClienteFactura = false;

  get clientesFiltrados(): any[] {
    let result = this.mostrarInactivos ? this.clientes : this.clientes.filter(c => c.activo);
    if (this.soloClienteFactura) {
      result = result.filter(c => c.tieneVentasUltimoAno);
    }
    if (this.busquedaActiva.trim()) {
      const q = this.busquedaActiva.toLowerCase();
      result = result.filter(c =>
        c.razonSocial?.toLowerCase().includes(q) ||
        c.ruc?.toLowerCase().includes(q) ||
        c.nombreCorto?.toLowerCase().includes(q)
      );
    }
    return result;
  }

  buscar() {
    this.busquedaActiva = this.busqueda;
    this.load();
  }

  constructor(
    private mantenimientoService: MantenimientoService,
    public dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.mantenimientoService.getClientesAdmin().subscribe({
      next: (resp) => (this.clientes = resp),
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los clientes.', life: 3000 }),
    });
  }

  nuevo() {
    this.ref = this.dialogService.open(NewComponent, {
      header: 'Nuevo Cliente',
      width: '560px',
      closable: true,
      modal: true,
      dismissableMask: true,
    });
    this.ref.onClose.subscribe((result) => {
      if (result) {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Cliente registrado correctamente.', life: 3000 });
        this.load();
      }
    });
  }

  edit(id: number) {
    this.ref = this.dialogService.open(EditComponent, {
      header: 'Editar Cliente',
      width: '560px',
      closable: true,
      modal: true,
      dismissableMask: true,
      data: { id },
    });
    this.ref.onClose.subscribe((result) => {
      if (result) {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Cliente actualizado correctamente.', life: 3000 });
        this.load();
      }
    });
  }

  confirm(id: number) {
    this.confirmationService.confirm({
      message: '¿Está seguro que desea eliminar este cliente?',
      header: 'Eliminar Cliente',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.mantenimientoService.deleteCliente(id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Cliente eliminado correctamente.', life: 3000 });
            this.load();
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el cliente.', life: 3000 }),
        });
      },
    });
  }

  getMoneda(id: number | null): string {
    if (id === 1) return 'PEN';
    if (id === 2) return 'USD';
    return '-';
  }
}
