import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { MantenimientoService } from '../../mantenimiento/mantenimiento.service';
import { RecojoService } from '../recojo.service';
import { Proveedor } from '../../mantenimiento/mantenimiento.types';

@Component({
  selector: 'app-modal-seleccionar-proveedor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
  ],
  providers: [MessageService],
  template: `
    <p-toast />

    <div class="flex flex-col gap-3 p-1">

      <!-- Búsqueda -->
      <div class="flex gap-2">
        <input pInputText [(ngModel)]="criterio" placeholder="Buscar repartidor..."
               class="flex-1" (keydown.enter)="buscar()" />
        <button pButton icon="pi pi-search" label="Buscar" (click)="buscar()"
                class="px-3 py-2 text-sm text-white bg-gray-700 hover:bg-gray-600 rounded-md">
        </button>
      </div>

      <!-- Tabla -->
      <p-table [value]="proveedores" [loading]="cargando"
               [scrollable]="true" scrollHeight="380px"
               styleClass="p-datatable-sm p-datatable-gridlines"
               [tableStyle]="{'min-width':'420px'}">

        <ng-template pTemplate="header">
          <tr class="bg-gray-50">
            <th class="text-xs font-semibold uppercase">Razón Social</th>
            <th style="width:120px" class="text-xs font-semibold uppercase">RUC</th>
            <th style="width:90px" class="text-center text-xs font-semibold uppercase">Acción</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-p>
          <tr class="hover:bg-gray-50 transition-colors">
            <td class="text-sm text-gray-800">{{ p.razonSocial }}</td>
            <td class="text-sm text-gray-600 font-mono">{{ p.ruc }}</td>
            <td class="text-center">
              <button pButton type="button" label="Seleccionar"
                      [loading]="guardandoId === p.idProveedor"
                      class="p-button-sm p-button-success"
                      (click)="seleccionar(p)">
              </button>
            </td>
          </tr>
        </ng-template>

        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="3" class="text-center text-gray-400 py-6">
              {{ cargando ? 'Cargando...' : 'No se encontraron repartidores.' }}
            </td>
          </tr>
        </ng-template>

      </p-table>

    </div>
  `,
})
export class ModalSeleccionarProveedorComponent implements OnInit {
  proveedores: Proveedor[] = [];
  criterio = '';
  cargando = false;
  guardandoId: number | null = null;

  idordentrabajo: number;

  constructor(
    private mantenimientoService: MantenimientoService,
    private recojoService: RecojoService,
    private messageService: MessageService,
    public ref: DynamicDialogRef,
    private config: DynamicDialogConfig
  ) {}

  ngOnInit(): void {
    this.idordentrabajo = this.config.data?.idordentrabajo;
    this.buscar();
  }

  buscar(): void {
    this.cargando = true;
    // TipoId 21514 = Repartidor
    this.mantenimientoService.getAllProveedores(this.criterio, 21514).subscribe({
      next: (data) => (this.proveedores = data),
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los repartidores.', life: 3000 });
      },
      complete: () => (this.cargando = false),
    });
  }

  seleccionar(proveedor: Proveedor): void {
    this.guardandoId = proveedor.idProveedor;
    this.recojoService.reasignarProveedor(this.idordentrabajo, proveedor.idProveedor).subscribe({
      next: () => this.ref.close({ proveedor }),
      error: (err) => {
        this.guardandoId = null;
        const msg = err?.error?.message || 'No se pudo reasignar el proveedor.';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: msg, life: 4000 });
      },
    });
  }
}
