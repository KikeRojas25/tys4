import { Component, OnInit } from '@angular/core';
import { OrdenTrabajoResumen } from '../ordentransporte.types';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-dialog-orden-resumen',
  template: `
  <p-table [value]="ordenes" [paginator]="true" [rows]="10" responsiveLayout="scroll">
    <ng-template pTemplate="header">
      <tr>
        <th>ID</th>
        <th>NumCP</th>
        <th>Origen</th>
        <th>Destino</th>
        <th>Guías</th>
      </tr>
    </ng-template>
    <ng-template pTemplate="body" let-orden>
      <tr>
        <td>{{ orden.idOrdenTrabajo }}</td>
        <td>{{ orden.numcp }}</td>
        <td>{{ orden.origen }}</td>
        <td>{{ orden.destino }}</td>
        <td>{{ orden.guias }}</td>
      </tr>
    </ng-template>
  </p-table>
`,
  styleUrls: ['./dialog-orden-resumen.component.css'],
  standalone: true,
  imports: [TableModule, CommonModule]
})
export class DialogOrdenResumenComponent implements OnInit {

  ordenes: OrdenTrabajoResumen[] = [];

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {}

  ngOnInit() {
    this.ordenes = this.config.data.ordenes || [];
  }
}