import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ToastModule } from 'primeng/toast';
import { TraficoService } from '../trafico.service';
import { ActualizarEtaManifiesto } from '../trafico.types';

@Component({
    template: `
        <div class="p-fluid p-3" [formGroup]="programadaForm">
            <div class="p-formgrid p-grid mb-3">
                <div class="p-field p-col-12 p-md-6">
                    <label for="horaProgramada"
                        >Hora Programada de recojo:</label
                    >
                    <p-calendar
                        id="horaProgramada"
                        formControlName="horaProgramada"
                        appendTo="body"
                        [timeOnly]="true"
                        [hourFormat]="24"
                        [showIcon]="true"
                        inputStyleClass="text-sm px-2 py-1"
                        class="w-full"
                    >
                    </p-calendar>
                </div>
                <div class="p-field p-col-12 p-md-6">
                    <label for="obsProgramada">Observación:</label>
                    <textarea
                        id="obsProgramada"
                        pInputTextarea
                        rows="3"
                        class="w-full"
                        formControlName="obsProgramada"
                        placeholder="Notas sobre la programación"
                    >
                    </textarea>
                </div>
            </div>

            <!-- Botones -->
            <div
                class="p-d-flex p-jc-end p-ai-center mt-4"
                style="gap: 0.5rem;"
            >
                <button
                    pButton
                    type="button"
                    icon="pi pi-save"
                    label="Guardar Programación"
                    class="p-button-danger"
                    style="width: auto;"
                    (click)="confirmarGuardar()"
                ></button>
                <button
                    pButton
                    type="button"
                    label="Cancelar"
                    class="p-button-primary"
                    style="width: auto;"
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
        CalendarModule,
        ToastModule,
        ReactiveFormsModule,
        ConfirmDialogModule,
    ],
    providers: [ConfirmationService],
})
export class DialogEtaLocalComponent implements OnInit {
    etaForm!: FormGroup;
    idmanifiesto!: number | string;
    horaProgramada!: string | Date;

    programadaForm = this.fb.group({
        horaProgramada: [null],
        obsProgramada: [''],
    });

    constructor(
        private fb: FormBuilder,
        private manifiestoService: TraficoService,
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit(): void {
        this.idmanifiesto = this.config.data.id;
        this.horaProgramada = this.config.data.horaProgramada;

        // si viene como string "12:00", conviértelo a Date para que el calendar lo entienda
        let horaAsDate: Date | null = null;
        if (this.horaProgramada) {
            const parts = this.horaProgramada.toString().split(':');
            if (parts.length >= 2) {
                horaAsDate = new Date();
                horaAsDate.setHours(Number(parts[0]), Number(parts[1]), 0);
            }
        }

        this.programadaForm.patchValue({
            horaProgramada: horaAsDate,
        });

  
    }
    ejecutarGuardar(): void {
    const raw = this.programadaForm.value;

    const ids: number[] =
        typeof this.idmanifiesto === 'string'
            ? this.idmanifiesto
                  .split(',')
                  .map((id) => Number(id.trim()))
                  .filter((id) => !isNaN(id))
            : [this.idmanifiesto];

    // convertir hora a string "HH:mm"
    let horaStr: string | null = null;
    if (raw.horaProgramada instanceof Date) {
        horaStr = raw.horaProgramada.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
        });
    } else if (typeof raw.horaProgramada === 'string') {
        horaStr = raw.horaProgramada;
    }

    const dtoParcial = {
        horaProgramada: horaStr,         // ⬅️ nueva hora
        obsProgramada: raw.obsProgramada // ⬅️ observación
    };

    let completadas = 0;
    let errores = 0;

    ids.forEach((id) => {
     
         const dto = {
            idOrdenTrabajo: id,
            horaProgramada: horaStr!,
            obsProgramada: raw.obsProgramada,
        };

        this.manifiestoService.actualizarHoraProgramada(dto).subscribe({
            next: () => {
                completadas++;
                if (completadas + errores === ids.length) {
                    this.ref.close(true); // cerrar cuando termina
                }
            },
            error: (err) => {
                console.error(`Error actualizando idManifiesto ${id}:`, err);
                errores++;
                if (completadas + errores === ids.length) {
                    this.ref.close(true);
                }
            },
        });
    });
}


    confirmarGuardar(): void {


       console.log('ID para actualizar:', this.idmanifiesto);

        this.confirmationService.confirm({
            message:
                '¿Está seguro que desea actualizar las fechas de llegada para los Manifiestos seleccionados?',
            header: 'Confirmación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, actualizar',
            rejectLabel: 'Cancelar',
            accept: () => {
                this.ejecutarGuardar();
            },
        });
    }

    cancelar(): void {
        this.ref.close();
    }
}
