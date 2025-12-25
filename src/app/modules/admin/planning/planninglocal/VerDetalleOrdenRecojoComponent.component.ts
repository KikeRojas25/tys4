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
    <div class="p-4">
      <h2 class="text-xl font-bold mb-3 text-blue-700">Detalle de Orden de Recojo</h2>

      <div *ngIf="loading" class="text-center py-10 text-gray-500">
        <i class="pi pi-spin pi-spinner text-2xl"></i>
        <p>Cargando información...</p>
      </div>

      <ng-container *ngIf="!loading && cab">
        <!-- CABECERA -->
        <div class="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg shadow-sm mb-4">
         <div><strong>OR:</strong> {{ cab.numcp }}</div>
          <div><strong>Cliente:</strong> {{ cab.idcliente }}</div>
          <div><strong>Centro Acopio:</strong> {{ cab.centroAcopio || '—' }}</div>
          <div><strong>Responsable Comercial:</strong> {{ cab.responsablecomercialid || '—' }}</div>
          <div><strong>Teléfono Contacto:</strong> {{ cab.telefonoContacto || '—' }}</div>
          <div><strong>Persona Recojo:</strong> {{ cab.personarecojo || '—' }}</div>
          <div><strong>Punto Origen:</strong> {{ cab.puntoOrigen || '—' }}</div>
          <div><strong>Peso Total:</strong> {{ cab.peso || 0 }} kg</div>
          <div><strong>Bultos:</strong> {{ cab.bulto || 0 }}</div>
          <div><strong>Fecha Cita:</strong> {{ cab.fechahoracita | date:'short' }}</div>
          <div><strong>Fecha Fin:</strong> {{ cab.fechahoracitafin | date:'short' }}</div>
          <div><strong>Hora Llegada:</strong> {{ cab.horallegada }}</div>
          <div><strong>Hora Salida:</strong> {{ cab.horasalida }}</div>
          
          <div class="col-span-2">
            <strong>Observaciones:</strong>
            <p class="border border-gray-300 rounded-md p-2 mt-1 bg-white text-sm">
              {{ cab.observaciones || 'Sin observaciones' }}
            </p>
          </div>
        </div>

        <p-divider></p-divider>

        <!-- DESTINOS -->
        <h3 class="text-lg font-semibold mb-3 text-gray-700">Destinos Finales</h3>

        <p-table
          [value]="destinos"
          [tableStyle]="{ 'min-width': '100%' }"
          styleClass="p-datatable-sm shadow-md rounded-lg overflow-hidden"
        >
          <ng-template pTemplate="header">
            <tr>
              <th>ID</th>
              <th>Destino</th>
              <th>Cantidad</th>
              <th>Peso</th>
              <th>Volumen</th>
              <th>Fecha Registro</th>
         
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-row>
            <tr>
              <td>{{ row.idordenrecojodestino }}</td>
              <td>{{ row.destino }}</td>
              <td>{{ row.cantidad }}</td>
              <td>{{ row.peso }}</td>
              <td>{{ row.volumen }}</td>
              <td>{{ row.fecharegistro | date:'short' }}</td>
             
            </tr>
          </ng-template>
        </p-table>

        <div *ngIf="!destinos?.length" class="text-center py-4 text-gray-400">
          No hay destinos registrados.
        </div>
      </ng-container>

      <div class="text-right mt-5">
        <button
          pButton
          type="button"
          label="Cerrar"
          icon="pi pi-times"
          class="p-button-secondary"
          (click)="cerrar()"
        ></button>
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
