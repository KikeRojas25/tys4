import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ToastModule } from 'primeng/toast';
import { TraficoService } from '../trafico.service';

interface MovilDestinoOption {
  idManifiestoDestino: number;
  idHojaRutaDestino: number;
  numHojaRutaDestino: string;
  idVehiculoDestino: number;
  placa: string;
}

@Component({
  template: `
    <div class="p-fluid p-3" [formGroup]="movilForm">
      <div class="p-formgrid p-grid mb-3">
        <div class="p-field p-col-12">
          <label for="movil">Seleccione Móvil/Placa:</label>
          <p-dropdown
            id="movil"
            formControlName="destino"
            [options]="listaMoviles"
            optionLabel="label"
            optionValue="value"
            placeholder="Seleccione una placa"
            class="w-full"
          ></p-dropdown>
        </div>
      </div>

      <div class="p-field p-col-12">
        <label for="obs">Observación:</label>
        <textarea
          id="obs"
          pInputTextarea
          rows="3"
          class="w-full"
          formControlName="observacion"
          placeholder="Notas sobre la reasignación"
        ></textarea>
      </div>

      <!-- Botones -->
      <div class="flex justify-end gap-2 mt-4">
        <button
          pButton
          type="button"
          icon="pi pi-save"
          label="Guardar"
          class="p-button-success"
          (click)="confirmarGuardar()"
        ></button>
        <button
          pButton
          type="button"
          label="Cancelar"
          class="p-button-secondary"
          (click)="cancelar()"
        ></button>
      </div>
    </div>

    <p-confirmDialog></p-confirmDialog>
  `,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    ToastModule,
    ReactiveFormsModule,
    ConfirmDialogModule
  ],
  providers: [ConfirmationService]
})
export class DialogReasignarMobileLocalComponent implements OnInit {
  movilForm!: FormGroup;
  idOrdenTrabajo!: number;
  listaMoviles: { label: string; value: MovilDestinoOption }[] = [];

  constructor(
    private fb: FormBuilder,
    private traficoService: TraficoService,
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private confirmationService: ConfirmationService
  ) {
    this.movilForm = this.fb.group({
      destino: [null],
      observacion: ['']
    });
  }


ngOnInit(): void {
  // El padre nos pasa el idordentrabajo seleccionado en la grilla.
  // El backend resuelve a qué manifiesto pertenece y reasigna ese manifiesto entero.
  this.idOrdenTrabajo = this.config.data.idordentrabajo;

    this.traficoService.VerHojasRutaTrocalLocal().subscribe({
      next: (list: any[]) => {
        // Dedup por placa: una placa puede aparecer en varios manifiestos de su HR.
        const unique = Array.from(
          new Map(list.map(item => [item.placa, item])).values()
        );

        this.listaMoviles = unique.map((item) => ({
          label: `${item.placa} — ${item.numHojaRuta ?? ''}`,
          value: {
            idManifiestoDestino: item.idManifiesto,
            idHojaRutaDestino:   item.idHojaRuta,
            numHojaRutaDestino:  item.numHojaRuta,
            idVehiculoDestino:   item.idVehiculo,
            placa:               item.placa,
          }
        }));
      },
      error: (err) => {
        console.error('Error al cargar móviles:', err);
      }
    });

}


  ejecutarGuardar(): void {
    const raw = this.movilForm.value;
    const destino: MovilDestinoOption | null = raw.destino;

    if (!destino) {
      console.warn('Debe seleccionar una placa destino');
      return;
    }

    const dto = {
      idOrdenTrabajo:      this.idOrdenTrabajo,
      idManifiestoDestino: destino.idManifiestoDestino,
      idVehiculoDestino:   destino.idVehiculoDestino,
      numHojaRutaDestino:  destino.numHojaRutaDestino,
      placaDestino:        destino.placa,
      observacion:         raw.observacion ?? null
    };

    this.traficoService.reasignarMovilManifiesto(dto).subscribe({
      next: () => {
        this.ref.close({ ok: true });
      },
      error: (err) => {
        console.error('Error al reasignar móvil:', err);
        // El backend responde con { success, message }. Si no, fallback al statusText.
        const backendMsg = err?.error?.message ?? err?.message ?? 'Error desconocido';
        this.ref.close({ ok: false, message: backendMsg });
      }
    });
  }

  confirmarGuardar(): void {
    this.confirmationService.confirm({
      message: '¿Está seguro que desea asignar/reasignar este móvil?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, asignar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.ejecutarGuardar();
      }
    });
  }

  cancelar(): void {
    this.ref.close();
  }
}
