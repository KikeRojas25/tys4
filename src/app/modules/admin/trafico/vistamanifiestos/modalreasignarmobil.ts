import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ToastModule } from 'primeng/toast';
import { TraficoService } from '../trafico.service';

@Component({
  template: `
    <div class="p-fluid p-3" [formGroup]="movilForm">
      <div class="p-formgrid p-grid mb-3">
        <div class="p-field p-col-12">
          <label for="movil">Seleccione Móvil/Placa:</label>
          <p-dropdown
            id="movil"
            formControlName="placa"
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
export class DialogReasignarMobileComponent implements OnInit {
  movilForm!: FormGroup;
  idOrdenTrabajo!: number;
  listaMoviles: { label: string; value: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private traficoService: TraficoService,
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private confirmationService: ConfirmationService
  ) {
    this.movilForm = this.fb.group({
      placa: [null],
      observacion: ['']
    });
  }


ngOnInit(): void {
  this.idOrdenTrabajo = this.config.data.id;

    this.traficoService.VerHojasRutaTrocalLocal().subscribe({
      next: (list: any[]) => {
        console.log('ordenes', list);

        // Usamos Map para quedarnos solo con la primera ocurrencia de cada placa
        const unique = Array.from(
          new Map(list.map(item => [item.placa, item])).values()
        );

        this.listaMoviles = unique.map((item) => ({
          label: `${item.placa} `,
          value: item.idManifiesto   // 👈 mejor usar id único para guardar
        }));

        // Preselecciona si ya hay un valor asignado
        if (this.config.data?.idVehiculoActual) {
          this.movilForm.patchValue({ placa: this.config.data.idVehiculoActual });
        }
      },
      error: (err) => {
        console.error('Error al cargar móviles:', err);
      }
    });

}


  ejecutarGuardar(): void {
    const raw = this.movilForm.value;

    const dto = {
      idOrdenTrabajo: this.idOrdenTrabajo,
      placa: raw.placa,
      observacion: raw.observacion
    };

    this.traficoService.asignarMovil(dto).subscribe({
      next: () => {
        this.ref.close(true);
      },
      error: (err) => {
        console.error('Error al asignar móvil:', err);
        this.ref.close(false);
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
