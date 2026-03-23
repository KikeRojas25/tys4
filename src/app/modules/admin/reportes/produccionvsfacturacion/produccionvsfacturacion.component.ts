import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MessageService, SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService } from 'primeng/dynamicdialog';
import { MessagesModule } from 'primeng/messages';
import { ToastModule } from 'primeng/toast';
import { ReporteService } from '../reporte.service';

@Component({
  selector: 'app-produccionvsfacturacion',
  templateUrl: './produccionvsfacturacion.component.html',
  styleUrls: ['./produccionvsfacturacion.component.css'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ButtonModule,
    MatIcon,
    ConfirmDialogModule,
    MessagesModule,
    ToastModule,
    DropdownModule,
  ],
  providers: [
    DialogService,
    MessageService,
  ],
})
export class ProduccionvsfacturacionComponent implements OnInit {
  anios: SelectItem[] = [];
  model: any = {};

  constructor(
    private reporteService: ReporteService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    // Inicializar años disponibles
    this.anios = [
      
      { value: 2025, label: '2025' },
      { value: 2026, label: '2026' },
    ];
    this.model.anio = 2026; // Valor por defecto
  }

  generarReporte(): void {
    if (!this.model.anio) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor seleccione un año.',
      });
      return;
    }

    this.reporteService.getReporteProduccionVsFacturacion(this.model.anio).subscribe({
      next: (blob: Blob) => {
        // Crear un enlace temporal para descargar el archivo
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ProduccionvsFacturacion_${this.model.anio}_${new Date().getTime()}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Reporte descargado correctamente.',
        });
      },
      error: (err) => {
        console.error('Error al descargar el reporte:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al descargar el reporte. Por favor intente nuevamente.',
        });
      },
    });
  }
}

