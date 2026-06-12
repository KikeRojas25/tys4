import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { RecojoService } from '../../recojo/recojo.service';


@Component({
  standalone: true,
  selector: 'app-ver-detalle-orden-recojo',
  imports: [CommonModule, TableModule, ButtonModule, DividerModule, TagModule],
  template: `
    <div class="p-1">
      <!-- Loading -->
      <div *ngIf="loading" class="space-y-3 py-6">
        <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/3"></div>
        <div class="grid grid-cols-2 gap-3">
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      </div>

      <ng-container *ngIf="!loading && cab">
        <!-- Identificación + métricas -->
        <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div class="flex items-center gap-2">
            <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-300">
              <i class="pi pi-id-card text-sm"></i>
            </div>
            <div>
              <div class="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 leading-none">
                Orden de recojo
              </div>
              <div class="text-sm font-semibold text-gray-900 dark:text-gray-100 font-mono">
                {{ cab.numcp || '—' }}
              </div>
            </div>
          </div>

          <div class="flex items-center gap-1.5">
            <p-tag
              *ngIf="cab.peso"
              [value]="(cab.peso || 0) + ' kg'"
              icon="pi pi-box"
              severity="info"
              styleClass="!text-xs"
            ></p-tag>
            <p-tag
              *ngIf="cab.bulto"
              [value]="cab.bulto + ' bultos'"
              icon="pi pi-inbox"
              severity="secondary"
              styleClass="!text-xs"
            ></p-tag>
          </div>
        </div>

        <!-- Grid 2-col: secciones lado a lado -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
          <!-- Cliente y contacto -->
          <section class="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/40 p-3">
            <h3 class="flex items-center gap-2 text-[11px] uppercase tracking-wide font-semibold text-gray-500 dark:text-gray-400 mb-2">
              <i class="pi pi-user text-xs"></i>
              <span>Cliente y contacto</span>
            </h3>
            <div class="grid grid-cols-2 gap-x-3 gap-y-2">
              <div>
                <div class="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Cliente</div>
                <div class="text-xs font-medium text-gray-800 dark:text-gray-200 truncate" [title]="cab.cliente">{{ (cab.cliente | titlecase) || cab.idcliente || '—' }}</div>
              </div>
              <div>
                <div class="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Persona recojo</div>
                <div class="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{{ (cab.personarecojo | titlecase) || '—' }}</div>
              </div>
              <div>
                <div class="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Teléfono</div>
                <div class="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{{ cab.telefonoContacto || '—' }}</div>
              </div>
              <div>
                <div class="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Responsable</div>
                <div class="text-xs font-medium text-gray-800 dark:text-gray-200 truncate" [title]="cab.responsable">{{ (cab.responsable | titlecase) || cab.responsablecomercialid || '—' }}</div>
              </div>
            </div>
          </section>

          <!-- Programación -->
          <section class="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/40 p-3">
            <h3 class="flex items-center gap-2 text-[11px] uppercase tracking-wide font-semibold text-gray-500 dark:text-gray-400 mb-2">
              <i class="pi pi-calendar text-xs"></i>
              <span>Programación</span>
            </h3>
            <div class="grid grid-cols-2 gap-x-3 gap-y-2">
              <div>
                <div class="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Cita</div>
                <div class="text-xs font-medium text-gray-800 dark:text-gray-200">{{ (cab.fechahoracita | date:'dd/MM/yy HH:mm') || '—' }}</div>
              </div>
              <div>
                <div class="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Cita fin</div>
                <div class="text-xs font-medium text-gray-800 dark:text-gray-200">{{ (cab.fechahoracitafin | date:'dd/MM/yy HH:mm') || '—' }}</div>
              </div>
              <div>
                <div class="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Llegada</div>
                <div class="text-xs font-medium text-gray-800 dark:text-gray-200">{{ cab.horallegada || '—' }}</div>
              </div>
              <div>
                <div class="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Salida</div>
                <div class="text-xs font-medium text-gray-800 dark:text-gray-200">{{ cab.horasalida || '—' }}</div>
              </div>
            </div>
          </section>

          <!-- Ubicación -->
          <section class="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/40 p-3">
            <h3 class="flex items-center gap-2 text-[11px] uppercase tracking-wide font-semibold text-gray-500 dark:text-gray-400 mb-2">
              <i class="pi pi-map-marker text-xs"></i>
              <span>Ubicación</span>
            </h3>
            <div class="grid grid-cols-1 gap-y-2">
              <div>
                <div class="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Punto origen</div>
                <div class="text-xs font-medium text-gray-800 dark:text-gray-200 truncate" [title]="cab.puntoOrigen">{{ cab.puntoOrigen || '—' }}</div>
              </div>
              <div>
                <div class="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Centro acopio</div>
                <div class="text-xs font-medium text-gray-800 dark:text-gray-200 truncate" [title]="cab.centroAcopio">{{ (cab.centroAcopio | titlecase) || '—' }}</div>
              </div>
            </div>
          </section>

          <!-- Observaciones -->
          <section class="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/40 p-3">
            <h3 class="flex items-center gap-2 text-[11px] uppercase tracking-wide font-semibold text-gray-500 dark:text-gray-400 mb-2">
              <i class="pi pi-comment text-xs"></i>
              <span>Observaciones</span>
            </h3>
            <p class="text-xs text-gray-700 dark:text-gray-300 leading-snug whitespace-pre-line line-clamp-3" [title]="cab.observaciones">
              {{ cab.observaciones || 'Sin observaciones.' }}
            </p>
          </section>
        </div>

        <!-- Destinos -->
        <section class="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="px-3 py-1.5 bg-gray-50 dark:bg-gray-800/40 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
            <i class="pi pi-list text-xs text-gray-500 dark:text-gray-400"></i>
            <h3 class="text-[11px] uppercase tracking-wide font-semibold text-gray-500 dark:text-gray-400">
              Destinos finales
            </h3>
            <span class="ml-auto text-[11px] text-gray-400" *ngIf="destinos?.length">
              {{ destinos.length }} {{ destinos.length === 1 ? 'destino' : 'destinos' }}
            </span>
          </div>

          <div *ngIf="!destinos?.length" class="py-4 text-center text-gray-400 dark:text-gray-500">
            <i class="pi pi-inbox text-xl block mb-1 opacity-50"></i>
            <p class="text-xs">No hay destinos registrados.</p>
          </div>

          <div *ngIf="destinos?.length" class="max-h-48 overflow-y-auto">
            <p-table
              [value]="destinos"
              [tableStyle]="{ 'min-width': '100%' }"
              styleClass="p-datatable-sm"
            >
              <ng-template pTemplate="header">
                <tr class="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700/40">
                  <th class="px-3 py-1 text-left font-medium">#</th>
                  <th class="px-3 py-1 text-left font-medium">Destino</th>
                  <th class="px-3 py-1 text-right font-medium">Cantidad</th>
                  <th class="px-3 py-1 text-right font-medium">Peso</th>
                  <th class="px-3 py-1 text-right font-medium">Volumen</th>
                  <th class="px-3 py-1 text-left font-medium">Fecha</th>
                </tr>
              </ng-template>

              <ng-template pTemplate="body" let-row let-i="rowIndex">
                <tr class="text-xs hover:bg-gray-50 dark:hover:bg-gray-700/40">
                  <td class="px-3 py-1 text-gray-500 dark:text-gray-400 tabular-nums">{{ i + 1 }}</td>
                  <td class="px-3 py-1 text-gray-800 dark:text-gray-200">{{ row.destino | titlecase }}</td>
                  <td class="px-3 py-1 text-right tabular-nums text-gray-700 dark:text-gray-200">{{ row.cantidad || 0 }}</td>
                  <td class="px-3 py-1 text-right tabular-nums text-gray-700 dark:text-gray-200">{{ (row.peso || 0) | number:'1.0-2' }}</td>
                  <td class="px-3 py-1 text-right tabular-nums text-gray-700 dark:text-gray-200">{{ (row.volumen || 0) | number:'1.0-2' }}</td>
                  <td class="px-3 py-1 text-gray-600 dark:text-gray-300">{{ row.fecharegistro | date:'dd/MM/yy HH:mm' }}</td>
                </tr>
              </ng-template>
            </p-table>
          </div>
        </section>
      </ng-container>

      <!-- Footer -->
      <div class="flex justify-end mt-3">
        <p-button
          label="Cerrar"
          icon="pi pi-times"
          severity="secondary"
          [text]="true"
          size="small"
          (click)="cerrar()"
        ></p-button>
      </div>
    </div>
  `
})
export class VerDetalleOrdenRecojoComponent implements OnInit {
  cab: any;
  destinos: any[] = [];
  loading = true;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private recojoService: RecojoService
  ) {}

  ngOnInit(): void {
    const id = this.config.data?.rowData.idordenrecojo;


    if (!id) {
      return;
    }

    this.recojoService.getOrdenRecojoById(id).subscribe({
      next: (resp) => {



        this.cab = resp.cabecera || resp.cabecera;
        this.destinos = resp.destinos || resp.destinos || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al obtener la orden de recojo:', err);
        this.loading = false;
      }
    });
  }

  cerrar() {
    this.ref.close();
  }
}
