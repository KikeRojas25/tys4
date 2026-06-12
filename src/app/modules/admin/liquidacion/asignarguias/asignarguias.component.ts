import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { LiquidacionService } from '../liquidacion.service';

interface ManifiestoInfo {
  idmanifiesto?: number;
  idvehiculo?: number;
  numhojaruta?: string;
  nummanifiesto?: string;
  placa?: string;
  chofer?: string;
  proveedor?: string;
  idestado?: number;
  estadoNombre?: string;
  guiasAsignadas?: number;
  soloLectura?: boolean;
}

interface Guia {
  id?: number;
  numeroguia?: string;
  fecharegistro?: string | Date;
  idestado?: number;
}

@Component({
  selector: 'app-asignarguias',
  templateUrl: './asignarguias.component.html',
  styleUrls: ['./asignarguias.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatIcon,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
})
export class AsignarguiasComponent implements OnInit {
  idmanifiesto = 0;
  idvehiculo = 0;

  info: ManifiestoInfo = {};
  guias: Guia[] = [];
  cols: any[] = [];
  loading = false;

  model: any = { numeroguia: '', cantidad: null };

  @ViewChild('inputNumero', { static: false }) inputNumero?: ElementRef<HTMLInputElement>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private liquidacionService: LiquidacionService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {}

  ngOnInit(): void {
    this.idmanifiesto = Number(this.route.snapshot.paramMap.get('uid')) || 0;
    this.idvehiculo = Number(this.route.snapshot.paramMap.get('uid2')) || 0;

    if (this.idmanifiesto <= 0) {
      this.router.navigate(['/seguimiento/listadoplacasprogramadas']);
      return;
    }

    this.cols = [
      { header: 'ACC', field: 'acc', width: '80px', sortable: false },
      { header: 'N° GRT', field: 'numeroguia', width: '220px', sortable: true },
      { header: 'FECHA DE REGISTRO', field: 'fecharegistro', width: '200px', sortable: true },
    ];

    this.cargarInfo();
    this.cargarGuias();
  }

  cargarInfo(): void {
    this.liquidacionService.getManifiestoInfo(this.idmanifiesto).subscribe({
      next: (resp) => (this.info = resp ?? {}),
      error: (err) => {
        console.error('Error al cargar info:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Manifiesto',
          detail: err?.error?.message ?? 'No se pudo cargar el manifiesto.',
        });
      },
    });
  }

  cargarGuias(): void {
    this.loading = true;
    this.liquidacionService.getGuiasPorManifiesto(this.idmanifiesto).subscribe({
      next: (resp: Guia[]) => (this.guias = resp ?? []),
      error: (err) => {
        console.error('Error al listar guías:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'GRT',
          detail: err?.error?.message ?? 'No se pudieron cargar las guías.',
        });
      },
      complete: () => (this.loading = false),
    });
  }

  registrar(): void {
    if (this.info?.soloLectura) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Bloqueado',
        detail: `Este manifiesto está ${this.info.estadoNombre}. No se pueden modificar las guías.`,
      });
      return;
    }
    if (!this.model.numeroguia || !this.model.cantidad || Number(this.model.cantidad) <= 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Datos incompletos',
        detail: 'N° GRT y Cantidad son obligatorios.',
      });
      return;
    }

    const payload = {
      numeroguia: this.model.numeroguia,
      cantidad: Number(this.model.cantidad),
      idmanifiesto: this.idmanifiesto,
      idvehiculo: this.idvehiculo,
    };

    this.loading = true;
    this.liquidacionService.registrarGuiaRemisionBlanco(payload).subscribe({
      next: (resp) => {
        const creadas: string[] = resp?.creadas ?? resp?.Creadas ?? [];
        const duplicadas: string[] = resp?.duplicadas ?? resp?.Duplicadas ?? [];
        const mensaje: string | undefined = resp?.mensaje ?? resp?.Mensaje;

        if (creadas.length > 0) {
          this.messageService.add({
            severity: 'success',
            summary: 'GRT',
            detail: `${creadas.length} guía(s) registrada(s) correctamente.`,
          });
        }
        if (duplicadas.length > 0) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Duplicadas',
            detail: mensaje ?? `Ya existían: ${duplicadas.join(', ')}`,
          });
        }
        // Limpiar y enfocar
        this.model.numeroguia = '';
        this.model.cantidad = null;
        setTimeout(() => this.inputNumero?.nativeElement?.focus(), 0);
        this.cargarInfo();
        this.cargarGuias();
      },
      error: (err) => {
        console.error('Error al registrar GRT:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'GRT',
          detail: err?.error?.message ?? 'No se pudo registrar.',
        });
      },
      complete: () => (this.loading = false),
    });
  }

  eliminar(id?: number): void {
    if (!id) return;
    if (this.info?.soloLectura) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Bloqueado',
        detail: `Este manifiesto está ${this.info.estadoNombre}. No se pueden eliminar guías.`,
      });
      return;
    }
    this.confirmationService.confirm({
      header: 'Confirmación',
      message: '¿Seguro que deseas eliminar esta GRT?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        this.liquidacionService.eliminarGuiaRemisionBlanco(id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'GRT', detail: 'Eliminada.' });
            this.cargarInfo();
            this.cargarGuias();
          },
          error: (err) => {
            console.error('Error al eliminar GRT:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'GRT',
              detail: err?.error?.message ?? 'No se pudo eliminar.',
            });
          },
        });
      },
    });
  }

  volver(): void {
    const hayCapturaEnCurso = !!(this.model.numeroguia || this.model.cantidad);
    if (hayCapturaEnCurso) {
      this.confirmationService.confirm({
        header: 'Datos sin guardar',
        message: 'Tienes datos sin guardar. ¿Seguro que deseas salir?',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Sí, salir',
        rejectLabel: 'No',
        accept: () => this.router.navigate(['/seguimiento/listadoplacasprogramadas']),
      });
    } else {
      this.router.navigate(['/seguimiento/listadoplacasprogramadas']);
    }
  }

  contadorClass(): string {
    // Solo X (no tengo Y "esperadas" todavía)
    return 'badge-gris';
  }
}
