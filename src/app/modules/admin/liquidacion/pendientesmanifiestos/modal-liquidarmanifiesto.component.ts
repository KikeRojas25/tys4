import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ToastModule } from 'primeng/toast';
import { SUSTENTOS_LIQUIDACION } from '../liquidacion.constants';
import { LiquidacionService } from '../liquidacion.service';

@Component({
  selector: 'app-modal-liquidarmanifiesto',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule, InputTextareaModule, ButtonModule, ToastModule],
  template: `
    <div class="p-2">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div class="field flex flex-col">
          <label class="mb-1 font-medium">Sustento</label>
          <p-dropdown
            [options]="sustentos"
            [(ngModel)]="model.maestroincidenciaid"
            appendTo="body"
            placeholder="Seleccione un sustento"
            [style]="{'width':'100%'}">
          </p-dropdown>
        </div>

        <div class="field flex flex-col">
          <label class="mb-1 font-medium">Observación</label>
          <textarea
            pInputTextarea
            rows="3"
            [(ngModel)]="model.observacion"
            placeholder="Observación / documento"
            [style]="{'width':'100%'}">
          </textarea>
        </div>
      </div>

      <div class="flex justify-end gap-2 mt-4">
        <button pButton type="button" label="Liquidar" icon="pi pi-check" class="p-button-danger" [disabled]="loading" (click)="liquidar()"></button>
        <button pButton type="button" label="Cancelar" icon="pi pi-times" class="p-button-secondary" (click)="cancelar()"></button>
      </div>
    </div>
  `,
})
export class ModalLiquidarManifiestoComponent implements OnInit {
  model: any = { maestroincidenciaid: null, observacion: '' };
  id!: number;
  sustentos = SUSTENTOS_LIQUIDACION;
  loading = false;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private liquidacionService: LiquidacionService,
    private messageService: MessageService,
  ) {
    this.id = Number(config.data?.id ?? 0);
  }

  ngOnInit(): void {}

  liquidar(): void {
    if (!this.model.maestroincidenciaid) {
      this.messageService.add({ severity: 'warn', summary: 'Validación', detail: 'Debe seleccionar un sustento.' });
      return;
    }
    this.loading = true;
    this.liquidacionService
      .liquidarManifiesto(this.id, this.model.maestroincidenciaid, this.model.observacion ?? '')
      .subscribe({
        next: () => this.ref.close(true),
        error: (err) => {
          console.error('Error al liquidar manifiesto:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Liquidación',
            detail: err?.error?.message ?? 'No se pudo liquidar el manifiesto.',
          });
        },
        complete: () => (this.loading = false),
      });
  }

  cancelar(): void {
    this.ref.close();
  }
}
