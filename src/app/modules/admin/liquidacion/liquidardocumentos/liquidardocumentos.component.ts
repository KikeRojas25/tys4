import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { GuiaRemisionBlanco } from '../liquidacion.types';
import { LiquidacionService } from '../liquidacion.service';
import { ModalOtroServicioComponent } from './modal-otroservicio.component';

@Component({
  selector: 'app-liquidardocumentos',
  templateUrl: './liquidardocumentos.component.html',
  styleUrls: ['./liquidardocumentos.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatIcon,
    TableModule,
    ButtonModule,
    ConfirmDialogModule,
    ToastModule,
    DynamicDialogModule,
  ],
  providers: [ConfirmationService, MessageService, DialogService],
})
export class LiquidardocumentosComponent implements OnInit {
  idordentrabajo = 0;
  numhojaruta = '';
  idmanifiesto = 0;
  guias: GuiaRemisionBlanco[] = [];
  cols: any[] = [];
  loading = false;

  constructor(
    private liquidacionService: LiquidacionService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.idordentrabajo = Number(this.activatedRoute.snapshot.paramMap.get('uid'));
    this.numhojaruta = this.activatedRoute.snapshot.paramMap.get('uid2') ?? '';
    this.idmanifiesto = Number(this.activatedRoute.snapshot.paramMap.get('uid3'));

    this.cols = [
      { header: 'ACC', field: 'acc', width: '200px' },
      { header: 'N° GRT', field: 'numeroguia', width: '180px' },
      { header: 'F. REGISTRO', field: 'fecharegistro', width: '140px' },
      { header: 'ESTADO', field: 'estado', width: '140px' },
    ];

    this.buscar();
  }

  buscar(): void {
    this.loading = true;
    this.liquidacionService.getAllGuiasAsignadasBlanco(this.idmanifiesto, this.idordentrabajo).subscribe({
      next: (list: GuiaRemisionBlanco[]) => (this.guias = list ?? []),
      error: (err) => {
        console.error('Error al listar GRTs:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'GRT',
          detail: err?.error?.message ?? 'No se pudieron cargar las guías.',
        });
      },
      complete: () => (this.loading = false),
    });
  }

  vincular(guiaId: number): void {
    this.liquidacionService.asignarGuiasBlanco(guiaId, this.idordentrabajo).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'GRT', detail: 'Guía vinculada.' });
        this.buscar();
      },
      error: (err) => this.errorToast(err, 'No se pudo vincular la guía.'),
    });
  }

  desvincular(guiaId: number): void {
    this.confirmationService.confirm({
      header: 'Confirmación',
      message: '¿Confirma desvincular esta guía?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        this.liquidacionService.desvincularGuiasBlanco(guiaId, this.idordentrabajo).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'GRT', detail: 'Guía desvinculada.' });
            this.buscar();
          },
          error: (err) => this.errorToast(err, 'No se pudo desvincular la guía.'),
        });
      },
    });
  }

  extraviado(guiaId: number): void {
    this.confirmationService.confirm({
      header: 'Confirmación',
      message: '¿Marcar esta guía como extraviada?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        this.liquidacionService.asignarGuiasBlancoExtraviado(guiaId, this.idordentrabajo).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'GRT', detail: 'Guía marcada como extraviada.' });
            this.buscar();
          },
          error: (err) => this.errorToast(err, 'No se pudo marcar como extraviada.'),
        });
      },
    });
  }

  otroservicio(guiaId: number): void {
    const ref = this.dialogService.open(ModalOtroServicioComponent, {
      header: 'Esta GRT se usó en otro servicio',
      width: '60vw',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      data: { id: guiaId, ot: this.idordentrabajo },
    });

    ref.onClose.subscribe((ok) => {
      if (ok) {
        this.messageService.add({ severity: 'success', summary: 'GRT', detail: 'Registrado.' });
        this.buscar();
      }
    });
  }

  volver(): void {
    this.router.navigate(['/seguimiento/liquidarorden', this.idmanifiesto, this.numhojaruta]);
  }

  estadoClass(estado?: string): string {
    if (estado === 'Registrado') return 'badge-rojo';
    if (estado === 'Programado') return 'badge-amarillo';
    if (estado === 'Asignado') return 'badge-verde';
    return 'badge-gris';
  }

  private errorToast(err: any, fallback: string): void {
    console.error(err);
    this.messageService.add({
      severity: 'error',
      summary: 'GRT',
      detail: err?.error?.message ?? fallback,
    });
  }
}
