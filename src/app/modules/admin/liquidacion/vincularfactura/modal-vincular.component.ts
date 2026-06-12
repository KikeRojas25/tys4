import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ES_LOCALE } from '../liquidacion.constants';
import { LiquidacionService } from '../liquidacion.service';

@Component({
  selector: 'app-modal-vincular',
  standalone: true,
  imports: [CommonModule, FormsModule, CalendarModule, InputTextModule, InputNumberModule, ButtonModule, ToastModule],
  template: `
    <div class="p-2">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div class="field flex flex-col">
          <label class="mb-1 font-medium">F. Documento</label>
          <p-calendar
            [(ngModel)]="model.fechadocumento"
            [locale]="es"
            dateFormat="dd/mm/yy"
            appendTo="body"
            [style]="{'width':'100%'}"
            [inputStyle]="{'width':'100%'}">
          </p-calendar>
        </div>

        <div class="field flex flex-col">
          <label class="mb-1 font-medium">Nro. Documento</label>
          <input pInputText [(ngModel)]="model.numero" placeholder="Número" [style]="{'width':'100%'}" />
        </div>

        <div class="field flex flex-col">
          <label class="mb-1 font-medium">Monto (sin IGV)</label>
          <p-inputNumber
            [(ngModel)]="model.monto"
            mode="decimal"
            [minFractionDigits]="2"
            [maxFractionDigits]="5"
            [showButtons]="true"
            [min]="0"
            [max]="30000"
            [style]="{'width':'100%'}">
          </p-inputNumber>
        </div>
      </div>

      <div class="flex justify-end gap-2 mt-4">
        <button pButton type="button" label="Vincular" icon="pi pi-check" class="p-button-danger" [disabled]="loading" (click)="vincular()"></button>
        <button pButton type="button" label="Cancelar" icon="pi pi-times" class="p-button-secondary" (click)="cancelar()"></button>
      </div>
    </div>
  `,
})
export class ModalVincularComponent implements OnInit {
  model: any = { fechadocumento: new Date(), numero: '', monto: null };
  numhojaruta!: string;
  loading = false;
  readonly es = ES_LOCALE;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private liquidacionService: LiquidacionService,
    private messageService: MessageService,
  ) {
    this.numhojaruta = String(config.data?.id ?? '');
  }

  ngOnInit(): void {}

  vincular(): void {
    if (!this.model.numero) {
      this.messageService.add({ severity: 'warn', summary: 'Validación', detail: 'Debe ingresar el número del documento.' });
      return;
    }
    this.loading = true;
    this.liquidacionService.vincularFactura(this.numhojaruta, this.model.numero).subscribe({
      next: (resp: any) => this.ref.close(resp),
      error: (err) => {
        console.error('Error al vincular factura:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Vincular',
          detail: err?.error?.message ?? 'No se pudo vincular la factura.',
        });
      },
      complete: () => (this.loading = false),
    });
  }

  cancelar(): void {
    this.ref.close();
  }
}
