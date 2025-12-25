import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { ComprobanteResult, DetalleComprobanteResult } from '../facturacion.types';
import { FacturacionService } from '../facturacion.service';

@Component({
  standalone: true,
  selector: 'app-ver-comprobante-modal',
  imports: [CommonModule, ButtonModule, TableModule, DividerModule, TagModule],
  styleUrls: ['./ver-comprobante-modal.component.css'],
  template: `
    <div class="ver-comprobante-modal">
      <div class="p-3">
        <!-- Header -->
        <!-- <div class="mb-3">
          <div class="flex items-center gap-2">
            <p-tag 
              [value]="comprobante?.tipoComprobante || ''" 
              [severity]="getTipoSeverity(comprobante?.tipoComprobante)"
              styleClass="text-xs">
            </p-tag>
            <p-tag 
              [value]="comprobante?.estado || ''" 
              [severity]="getEstadoSeverity(comprobante?.estado)"
              styleClass="text-xs">
            </p-tag>
          </div>
        </div> -->

        <div *ngIf="loading" class="text-center py-10 text-gray-500">
          <i class="pi pi-spin pi-spinner text-3xl"></i>
          <p class="mt-2">Cargando información...</p>
        </div>

        <ng-container *ngIf="!loading && comprobante">
          <!-- Información del Comprobante -->
          <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 mb-3 border border-blue-200">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              <div class="bg-white rounded-md p-2 shadow-sm">
                <label class="text-xs font-semibold text-gray-500 uppercase">N° Comprobante</label>
                <p class="text-base font-bold text-gray-900 mt-0.5">{{ comprobante.numeroComprobante }}</p>
              </div>
              <div class="bg-white rounded-md p-2 shadow-sm">
                <label class="text-xs font-semibold text-gray-500 uppercase">N° Preliquidación</label>
                <p class="text-base font-bold text-gray-900 mt-0.5">{{ comprobante.numeroPreliquidacion }}</p>
              </div>
              <div class="bg-white rounded-md p-2 shadow-sm">
                <label class="text-xs font-semibold text-gray-500 uppercase">Fecha de Emisión</label>
                <p class="text-sm font-semibold text-gray-900 mt-0.5">{{ comprobante.fechaEmision | date:'dd/MM/yyyy' }}</p>
              </div>
              <div class="bg-white rounded-md p-2 shadow-sm">
                <label class="text-xs font-semibold text-gray-500 uppercase">Cliente</label>
                <p class="text-sm font-semibold text-gray-900 mt-0.5">{{ comprobante.nombreCliente }}</p>
              </div>
              <div class="bg-white rounded-md p-2 shadow-sm">
                <label class="text-xs font-semibold text-gray-500 uppercase">Usuario Registro</label>
                <p class="text-sm font-semibold text-gray-900 mt-0.5">{{ comprobante.usuarioRegistro }}</p>
              </div>
              <div class="bg-white rounded-md p-2 shadow-sm" *ngIf="comprobante.ordenCompra">
                <label class="text-xs font-semibold text-gray-500 uppercase">Orden de Compra</label>
                <p class="text-sm font-semibold text-gray-900 mt-0.5">{{ comprobante.ordenCompra }}</p>
              </div>
            </div>
          </div>

          <!-- Información de Totales Físicos -->
          <div class="bg-gray-50 rounded-lg p-3 mb-3 border border-gray-200">
            <h3 class="text-xs font-semibold text-gray-700 mb-2 uppercase">Resumen Físico</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div class="text-center">
                <label class="text-xs font-semibold text-gray-500 block">Total Peso</label>
                <p class="text-lg font-bold text-blue-600 mt-0.5">{{ comprobante.totalPeso | number:'1.2-2' }} kg</p>
              </div>
              <div class="text-center">
                <label class="text-xs font-semibold text-gray-500 block">Total Volumen</label>
                <p class="text-lg font-bold text-green-600 mt-0.5">{{ comprobante.totalVolumen | number:'1.2-2' }} m³</p>
              </div>
              <div class="text-center">
                <label class="text-xs font-semibold text-gray-500 block">Total Bultos</label>
                <p class="text-lg font-bold text-purple-600 mt-0.5">{{ comprobante.totalBulto }}</p>
              </div>
            </div>
          </div>

          <!-- Detalles del Comprobante -->
          <div class="mb-3">
            <h3 class="text-sm font-semibold text-gray-900 mb-2">Items del Comprobante</h3>
            <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <p-table
                [value]="detalles"
                [tableStyle]="{'min-width':'100%'}"
                styleClass="p-datatable-sm">
                <ng-template pTemplate="header">
                  <tr>
                    <th class="text-left px-2 py-2 bg-gray-100 text-gray-700 text-xs font-semibold">Item</th>
                    <th class="text-left px-2 py-2 bg-gray-100 text-gray-700 text-xs font-semibold">Descripción</th>
                    <th class="text-center px-2 py-2 bg-gray-100 text-gray-700 text-xs font-semibold">N° OT</th>
                    <th class="text-right px-2 py-2 bg-gray-100 text-gray-700 text-xs font-semibold">Subtotal</th>
                    <th class="text-right px-2 py-2 bg-gray-100 text-gray-700 text-xs font-semibold">IGV</th>
                    <th class="text-right px-2 py-2 bg-gray-100 text-gray-700 text-xs font-semibold">Recargo</th>
                    <th class="text-right px-2 py-2 bg-gray-100 text-gray-700 text-xs font-semibold">Total</th>
                  </tr>
                </ng-template>
                <ng-template pTemplate="body" let-detalle let-rowIndex="rowIndex">
                  <tr>
                    <td class="text-left px-2 py-1.5 text-xs font-semibold text-gray-900">{{ rowIndex + 1 }}</td>
                    <td class="text-left px-2 py-1.5 text-xs text-gray-700">{{ detalle.descripcion || '—' }}</td>
                    <td class="text-center px-2 py-1.5 text-xs text-gray-700">{{ detalle.numeroOrdenTrabajo || '—' }}</td>
                    <td class="text-right px-2 py-1.5 text-xs text-gray-700">S/. {{ detalle.subtotal | number:'1.2-2' }}</td>
                    <td class="text-right px-2 py-1.5 text-xs text-gray-700">S/. {{ detalle.igv | number:'1.2-2' }}</td>
                    <td class="text-right px-2 py-1.5 text-xs text-gray-700">S/. {{ (detalle.recargo || 0) | number:'1.2-2' }}</td>
                    <td class="text-right px-2 py-1.5 text-xs font-semibold text-gray-900">S/. {{ detalle.total | number:'1.2-2' }}</td>
                  </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                  <tr>
                    <td colspan="7" class="text-center py-8 text-gray-500 text-xs">
                      No hay detalles registrados
                    </td>
                  </tr>
                </ng-template>
              </p-table>
            </div>
          </div>

          <!-- Totales -->
          <div class="bg-gray-50 rounded-lg p-3 mb-3 border border-gray-200">
            <div class="flex justify-end">
              <div class="w-full max-w-md">
                <div class="space-y-1.5">
                  <div class="flex justify-between items-center">
                    <span class="text-xs font-medium text-gray-700">Sub Total:</span>
                    <span class="text-sm font-semibold text-gray-900">S/. {{ comprobante.subtotal | number:'1.2-2' }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-xs font-medium text-gray-700">IGV (18%):</span>
                    <span class="text-sm font-semibold text-gray-900">S/. {{ comprobante.igv | number:'1.2-2' }}</span>
                  </div>
                  <div class="flex justify-between items-center border-t-2 border-gray-300 pt-1.5 mt-1.5">
                    <span class="text-base font-bold text-gray-900">Total:</span>
                    <span class="text-lg font-bold text-blue-600">S/. {{ comprobante.total | number:'1.2-2' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Observaciones -->
          <div class="bg-amber-50 rounded-lg p-3 mb-3 border border-amber-200" *ngIf="comprobante.motivo || comprobante.descripcion">
            <h3 class="text-xs font-semibold text-gray-700 mb-1.5 uppercase">Observaciones</h3>
            <p class="text-xs text-gray-800" *ngIf="comprobante.motivo">
              <strong>Motivo:</strong> {{ comprobante.motivo }}
            </p>
            <p class="text-xs text-gray-800 mt-1.5" *ngIf="comprobante.descripcion">
              <strong>Descripción:</strong> {{ comprobante.descripcion }}
            </p>
          </div>
        </ng-container>

        <!-- Botón Cerrar -->
        <div class="flex justify-end mt-3">
          <button
            pButton
            type="button"
            label="Cerrar"
            icon="pi pi-times"
            class="p-button-secondary p-button-sm"
            (click)="cerrar()">
          </button>
        </div>
      </div>
    </div>
  `
})
export class VerComprobanteModalComponent implements OnInit {
  comprobante: ComprobanteResult | null = null;
  detalles: DetalleComprobanteResult[] = [];
  loading: boolean = true;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private facturacionService: FacturacionService
  ) {}

  ngOnInit(): void {
    const idComprobante = this.config.data?.idComprobante || this.config.data?.comprobante?.idComprobantePago;
    
    if (idComprobante) {
      this.cargarComprobante(idComprobante);
    } else {
      this.loading = false;
    }
  }

  cargarComprobante(id: number): void {
    this.loading = true;
    this.facturacionService.getComprobante(id).subscribe({
      next: (result) => {
        // El backend devuelve Comprobante y Detalles con mayúsculas
        this.comprobante = result.comprobante || result.Comprobante;
        this.detalles = result.detalles || result.Detalles || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar el comprobante:', error);
        this.loading = false;
        // Si hay error, intentar usar los datos pasados directamente
        if (this.config.data?.comprobante) {
          this.comprobante = this.config.data.comprobante;
          this.detalles = [];
        }
      }
    });
  }

  getTipoSeverity(tipo: string): string {
    if (!tipo) return 'info';
    if (tipo.toLowerCase().includes('factura')) return 'success';
    if (tipo.toLowerCase().includes('boleta')) return 'info';
    return 'warning';
  }

  getEstadoSeverity(estado: string): string {
    if (!estado) return 'info';
    const estadoLower = estado.toLowerCase();
    if (estadoLower.includes('emitido') || estadoLower.includes('activo')) return 'success';
    if (estadoLower.includes('anulado') || estadoLower.includes('cancelado')) return 'danger';
    if (estadoLower.includes('pendiente')) return 'warning';
    return 'info';
  }

  cerrar(): void {
    this.ref.close();
  }
}

