import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-detalle-orden-modal',
  template: `
    <div class="p-3">
      <!-- Fila 1: Información Principal -->
      <div class="grid grid-cols-4 gap-2 mb-2">
        <div class="bg-gray-50 p-2 rounded border">
          <label class="text-xs font-semibold text-gray-500 block mb-1">Orden</label>
          <p class="text-sm font-bold text-gray-900">{{ orden?.numcp || '-' }}</p>
        </div>
        <div class="bg-gray-50 p-2 rounded border">
          <label class="text-xs font-semibold text-gray-500 block mb-1">Cliente</label>
          <p class="text-xs text-gray-900 truncate">{{ orden?.razonsocial || '-' }}</p>
        </div>
        <div class="bg-gray-50 p-2 rounded border">
          <label class="text-xs font-semibold text-gray-500 block mb-1">F. Registro</label>
          <p class="text-xs text-gray-900">{{ orden?.fecharegistro ? (orden.fecharegistro | date:'dd/MM/yyyy HH:mm') : '-' }}</p>
        </div>
        <div class="bg-gray-50 p-2 rounded border">
          <label class="text-xs font-semibold text-gray-500 block mb-1">F. Cita</label>
          <p class="text-xs text-gray-900">{{ orden?.fechahoracita ? (orden.fechahoracita | date:'dd/MM/yyyy HH:mm') : '-' }}</p>
        </div>
      </div>

      <!-- Fila 2: Campos Resaltados - Punto Recojo, Entrega, Peso, Bultos -->
      <div class="grid grid-cols-4 gap-2 mb-2">
        <div class="bg-blue-50 border-2 border-blue-300 p-2 rounded">
          <label class="text-xs font-bold text-blue-700 block mb-1">📍 Punto de Recojo</label>
          <p class="text-xs font-semibold text-blue-900">{{ orden?.puntorecojo || '-' }}</p>
        </div>
        <div class="bg-green-50 border-2 border-green-300 p-2 rounded">
          <label class="text-xs font-bold text-green-700 block mb-1">🏢 Centro de Acopio</label>
          <p class="text-xs font-semibold text-green-900">{{ orden?.centroacopio || '-' }}</p>
        </div>
        <div class="bg-amber-50 border-2 border-amber-300 p-2 rounded">
          <label class="text-xs font-bold text-amber-700 block mb-1">⚖️ Peso</label>
          <p class="text-sm font-bold text-amber-900">{{ orden?.peso ? (orden.peso | number:'1.0-2') : '0.00' }} <span class="text-xs">kg</span></p>
        </div>
        <div class="bg-purple-50 border-2 border-purple-300 p-2 rounded">
          <label class="text-xs font-bold text-purple-700 block mb-1">📦 Bultos</label>
          <p class="text-sm font-bold text-purple-900">{{ orden?.bulto || 0 }}</p>
        </div>
      </div>

      <!-- Fila 3: Información Adicional -->
      <div class="grid grid-cols-4 gap-2 mb-2">
        <div class="bg-gray-50 p-2 rounded border">
          <label class="text-xs font-semibold text-gray-500 block mb-1">Estado</label>
          <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                [ngClass]="{
                  'bg-gray-100 text-gray-800': orden?.estado === 'Pend. Programacion',
                  'bg-amber-100 text-amber-800': orden?.estado === 'Programado',
                  'bg-green-100 text-green-800': orden?.estado === 'Liquidado'
                }">
            {{ orden?.estado || '-' }}
          </span>
        </div>
        <div class="bg-gray-50 p-2 rounded border">
          <label class="text-xs font-semibold text-gray-500 block mb-1">Contacto</label>
          <p class="text-xs text-gray-900">{{ orden?.personarecojo || '-' }}</p>
        </div>
        <div class="bg-gray-50 p-2 rounded border">
          <label class="text-xs font-semibold text-gray-500 block mb-1">Volumen</label>
          <p class="text-xs text-gray-900">{{ orden?.pesovol ? (orden.pesovol | number:'1.0-2') : '0.00' }} m³</p>
        </div>
        <div class="bg-gray-50 p-2 rounded border">
          <label class="text-xs font-semibold text-gray-500 block mb-1">Responsable</label>
          <p class="text-xs text-gray-900">{{ orden?.responsable || '-' }}</p>
        </div>
      </div>

      <!-- Observaciones -->
      <div class="bg-gray-50 p-2 rounded border mb-2">
        <label class="text-xs font-semibold text-gray-500 block mb-1">Observaciones</label>
        <p class="text-xs text-gray-900 line-clamp-2">{{ orden?.observaciones || '-' }}</p>
      </div>

      <!-- Botón Cerrar -->
      <div class="flex justify-end">
        <button pButton type="button" label="Cerrar" icon="pi pi-times" 
                class="p-button-sm p-button-secondary" (click)="cerrar()"></button>
      </div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule, ButtonModule],
})
export class DetalleOrdenModalComponent implements OnInit {
  orden: any;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {}

  ngOnInit(): void {
    this.orden = this.config.data?.orden;
  }

  cerrar(): void {
    this.ref.close();
  }
}
