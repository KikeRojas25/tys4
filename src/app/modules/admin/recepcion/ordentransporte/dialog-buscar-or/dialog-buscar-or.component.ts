import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-dialog-buscar-or',
  templateUrl: './dialog-buscar-or.component.html',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule]
})
export class DialogBuscarOrComponent implements OnInit {

  resultados: any[] = [];
  tieneDetalleExtra = false;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {}

  ngOnInit() {
    this.resultados = this.config.data?.resultados || [];
    this.tieneDetalleExtra = this.resultados.length > 0 &&
      (this.resultados[0].estado != null || this.resultados[0].provincia != null);
  }

  seleccionar(item: any) {
    this.ref.close(item);
  }
}
