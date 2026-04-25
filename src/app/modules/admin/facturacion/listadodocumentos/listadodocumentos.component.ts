import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';

import { FacturacionService } from '../facturacion.service';
import { MantenimientoService } from '../../mantenimiento/mantenimiento.service';
import { DocumentoResult, DocumentoForCreateDto, DocumentoForUpdateDto } from '../facturacion.types';

@Component({
  selector: 'app-listadodocumentos',
  templateUrl: './listadodocumentos.component.html',
  styleUrls: ['./listadodocumentos.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatIcon,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule,
  ],
  providers: [MessageService, ConfirmationService],
})
export class ListadodocumentosComponent implements OnInit {

  documentos: DocumentoResult[] = [];
  loading = false;

  // Filtros
  filtroTipo: number | null = null;
  filtroEstacion: number | null = null;

  // Catálogos
  tiposComprobante: any[] = [];
  estaciones: any[] = [];
  usuarios: any[] = [];

  // Formulario modal
  mostrarModal = false;
  modoEdicion = false;
  form: any = {};
  guardando = false;

  constructor(
    private facturacionService: FacturacionService,
    private mantenimientoService: MantenimientoService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {}

  ngOnInit(): void {
    this.cargarCatalogos();
    this.buscar();
  }

  cargarCatalogos(): void {
    this.mantenimientoService.getValorTabla(11).subscribe({
      next: (data) => {
        this.tiposComprobante = [
          { label: 'Todos', value: null },
          ...data.map(v => ({ label: v.valor, value: v.idValorTabla }))
        ];
      },
      error: () => {}
    });

    this.mantenimientoService.getAllEstaciones('').subscribe({
      next: (data: any[]) => {
        this.estaciones = [
          { label: 'Todas', value: null },
          ...data.map(e => ({ label: e.estacionOrigen || e.EstacionOrigen, value: e.idEstacion || e.IdEstacion }))
        ];
      },
      error: () => {}
    });

    this.mantenimientoService.getUsuarios().subscribe({
      next: (data) => {
        this.usuarios = [
          { label: '[Ninguno]', value: null },
          ...data.map((u: any) => ({
            label: `${u.usr_str_nombre ?? ''} ${u.usr_str_apellidos ?? ''}`.trim(),
            value: u.usr_int_id
          }))
        ];
      },
      error: () => {}
    });
  }

  buscar(): void {
    this.loading = true;
    this.facturacionService.listarDocumentos(
      this.filtroTipo ?? undefined,
      this.filtroEstacion ?? undefined
    ).subscribe({
      next: (data) => {
        this.documentos = data;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los documentos' });
        this.loading = false;
      }
    });
  }

  limpiarFiltros(): void {
    this.filtroTipo = null;
    this.filtroEstacion = null;
    this.buscar();
  }

  abrirNuevo(): void {
    this.modoEdicion = false;
    this.form = { idTipoComprobante: null, serie: '', primerNumero: '', idUsuarioAutorizado: null, idEstacion: null };
    this.mostrarModal = true;
  }

  abrirEditar(doc: DocumentoResult): void {
    this.modoEdicion = true;
    this.form = {
      idNumeroDocumento: doc.idNumeroDocumento,
      idTipoComprobante: doc.idTipoComprobante,
      serie: doc.serie,
      primerNumero: doc.primerNumero,
      ultimoNumero: doc.ultimoNumero,
      idUsuarioAutorizado: doc.idUsuarioAutorizado ?? null,
      idEstacion: doc.idEstacion,
    };
    this.mostrarModal = true;
  }

  primerNumeroEditable(doc: DocumentoResult): boolean {
    // Solo editable si ultimoNumero no supera primerNumero (no se ha usado)
    return Number(doc.ultimoNumero) <= Number(doc.primerNumero);
  }

  guardar(): void {
    if (!this.form.idTipoComprobante || !this.form.serie || !this.form.primerNumero || !this.form.idEstacion) {
      this.messageService.add({ severity: 'warn', summary: 'Validación', detail: 'Complete todos los campos obligatorios' });
      return;
    }
    this.guardando = true;

    const obs = this.modoEdicion
      ? this.facturacionService.updateDocumento(this.form as DocumentoForUpdateDto)
      : this.facturacionService.createDocumento(this.form as DocumentoForCreateDto);

    obs.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: this.modoEdicion ? 'Actualizado' : 'Creado',
          detail: `Documento ${this.modoEdicion ? 'actualizado' : 'creado'} correctamente`
        });
        this.mostrarModal = false;
        this.guardando = false;
        this.buscar();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message || 'No se pudo guardar el documento' });
        this.guardando = false;
      }
    });
  }

  eliminar(doc: DocumentoResult): void {
    this.confirmationService.confirm({
      message: `¿Eliminar la serie <strong>${doc.serie}</strong>?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.facturacionService.deleteDocumento(doc.idNumeroDocumento).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: `Serie ${doc.serie} eliminada` });
            this.buscar();
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message || 'No se pudo eliminar' });
          }
        });
      }
    });
  }

  get tiposComprobanteForm(): any[] {
    return this.tiposComprobante.filter(t => t.value !== null);
  }

  get estacionesForm(): any[] {
    return this.estaciones.filter(e => e.value !== null);
  }
}
