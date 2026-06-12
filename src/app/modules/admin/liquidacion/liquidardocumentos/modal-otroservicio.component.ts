import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ToastModule } from 'primeng/toast';
import { LiquidacionService } from '../liquidacion.service';

@Component({
  selector: 'app-modal-otroservicio',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextareaModule, ButtonModule, ToastModule],
  template: `
    <div class="p-2">
      <div class="grid grid-cols-1 gap-3">
        <div class="field flex flex-col">
          <label class="mb-1 font-medium">Número de GRT</label>
          <textarea
            pInputTextarea
            rows="3"
            [(ngModel)]="model.grt"
            placeholder="Número o referencia de la GRT en otro servicio"
            [style]="{'width':'100%'}">
          </textarea>
        </div>
      </div>

      <div class="flex justify-end gap-2 mt-4">
        <button pButton type="button" label="Registrar" icon="pi pi-check" class="p-button-danger" [disabled]="loading" (click)="registrar()"></button>
        <button pButton type="button" label="Cancelar" icon="pi pi-times" class="p-button-secondary" (click)="cancelar()"></button>
      </div>
    </div>
  `,
})
export class ModalOtroServicioComponent {
  model: any = { grt: '' };
  guiaId!: number;
  idordentrabajo!: number;
  loading = false;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private liquidacionService: LiquidacionService,
    private messageService: MessageService,
  ) {
    this.guiaId = Number(config.data?.id ?? 0);
    this.idordentrabajo = Number(config.data?.ot ?? 0);
  }

  registrar(): void {
    this.loading = true;
    this.liquidacionService.asignarGuiasBlanco(this.guiaId, this.idordentrabajo).subscribe({
      next: () => this.ref.close(true),
      error: (err) => {
        console.error('Error al registrar uso en otro servicio:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'GRT',
          detail: err?.error?.message ?? 'No se pudo registrar.',
        });
      },
      complete: () => (this.loading = false),
    });
  }

  cancelar(): void {
    this.ref.close();
  }
}
