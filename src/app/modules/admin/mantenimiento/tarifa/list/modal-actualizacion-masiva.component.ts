import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MantenimientoService } from '../../mantenimiento.service';

@Component({
  selector: 'app-modal-actualizacion-masiva',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputNumberModule, ToastModule],
  providers: [MessageService],
  template: `
    <p-toast />

    <div class="flex flex-col gap-5 p-1">

      <p class="text-sm text-gray-500">
        Ingrese el porcentaje a aplicar sobre <strong>todos los campos de valor</strong>
        (Base, Mínimo, Desde, Hasta, Precio y Adicional) de todas las tarifas del cliente.
        Use un valor <strong>positivo</strong> para incrementar y <strong>negativo</strong> para reducir.
      </p>

      <!-- Input único -->
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-gray-700">Porcentaje de ajuste</label>
        <div class="flex items-center gap-2">
          <p-inputNumber
            [(ngModel)]="porcentaje"
            [showButtons]="true"
            [step]="0.5"
            mode="decimal"
            [minFractionDigits]="2"
            [maxFractionDigits]="2"
            [min]="-99.99"
            [max]="10000"
            placeholder="Ej: 5.00 o -3.50"
            styleClass="flex-1"
            inputStyleClass="text-right w-full text-lg font-semibold">
          </p-inputNumber>
          <span class="text-gray-600 text-xl font-bold">%</span>
        </div>

        <!-- Indicador visual -->
        <div *ngIf="porcentaje !== null && porcentaje !== 0"
             class="mt-1 px-3 py-1.5 rounded-md text-sm font-medium"
             [ngClass]="porcentaje > 0
               ? 'bg-green-50 text-green-700 border border-green-200'
               : 'bg-red-50 text-red-700 border border-red-200'">
          <span *ngIf="porcentaje > 0">↑ Incremento del {{ porcentaje | number:'1.2-2' }}%</span>
          <span *ngIf="porcentaje < 0">↓ Reducción del {{ porcentaje * -1 | number:'1.2-2' }}%</span>
        </div>
      </div>

      <!-- Aviso -->
      <div class="bg-amber-50 border border-amber-200 rounded-md px-3 py-2 text-xs text-amber-700">
        Esta operación actualizará <strong>todas las tarifas</strong> del cliente seleccionado.
        Los valores se redondearán a 4 decimales.
      </div>

      <!-- Botones -->
      <div class="flex justify-end gap-3 pt-2 border-t">
        <button pButton type="button" label="Cancelar" icon="pi pi-times" severity="secondary"
                (click)="cancelar()"></button>
        <button pButton type="button" icon="pi pi-check"
                [label]="porcentaje > 0 ? 'Incrementar' : porcentaje < 0 ? 'Reducir' : 'Aplicar'"
                [loading]="guardando"
                [ngClass]="porcentaje < 0
                  ? 'px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-md'
                  : 'px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-500 rounded-md'"
                (click)="aplicar()">
        </button>
      </div>

    </div>
  `,
})
export class ModalActualizacionMasivaComponent implements OnInit {
  idCliente: number;
  porcentaje: number | null = null;
  guardando = false;

  constructor(
    private mantenimientoService: MantenimientoService,
    private messageService: MessageService,
    public ref: DynamicDialogRef,
    private config: DynamicDialogConfig
  ) {}

  ngOnInit(): void {
    this.idCliente = this.config.data?.idCliente;
  }

  cancelar(): void {
    this.ref.close();
  }

  aplicar(): void {
    if (this.porcentaje === null || this.porcentaje === 0) {
      this.messageService.add({
        severity: 'warn', summary: 'Atención',
        detail: 'Ingrese un porcentaje distinto de cero.', life: 3000,
      });
      return;
    }

    this.guardando = true;
    this.mantenimientoService.actualizacionMasivaTarifas({
      idCliente:    this.idCliente,
      pctBase:      this.porcentaje,
      pctMinimo:    this.porcentaje,
      pctDesde:     this.porcentaje,
      pctHasta:     this.porcentaje,
      pctPrecio:    this.porcentaje,
      pctAdicional: this.porcentaje,
    }).subscribe({
      next: (res) => this.ref.close(res),
      error: (err) => {
        this.guardando = false;
        const msg = err?.error?.message || 'Error al aplicar la actualización masiva.';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: msg, life: 4000 });
      },
    });
  }
}
