import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { MantenimientoService } from '../../../mantenimiento.service';
import { FormtarifaproveedorComponent } from '../formtarifaproveedor/formtarifaproveedor.component';

@Component({
  selector: 'app-listtarifaproveedor',
  templateUrl: './listtarifaproveedor.component.html',
  styleUrls: ['./listtarifaproveedor.component.css'],
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
export class ListtarifaproveedorComponent implements OnInit {
  idProveedor!: number;
  proveedorNombre = '';
  tarifas: any[] = [];
  cols: any[] = [];
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private mantenimientoService: MantenimientoService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private dialogService: DialogService,
  ) {}

  ngOnInit(): void {
    this.cols = [
      { field: 'acc', header: 'ACC', width: '120px' },
      { field: 'departamento', header: 'DEPARTAMENTO', width: '200px' },
      { field: 'provincia', header: 'PROVINCIA', width: '200px' },
      { field: 'distrito', header: 'DISTRITO', width: '200px' },
      { field: 'tipoUnidad', header: 'TIPO UNIDAD', width: '180px' },
      { field: 'precio', header: 'PRECIO', width: '140px' },
    ];

    const id = Number(this.route.snapshot.paramMap.get('idProveedor'));
    if (!Number.isFinite(id) || id <= 0) {
      this.router.navigate(['/mantenimiento/listadoproveedores']);
      return;
    }
    this.idProveedor = id;
    this.reload();
  }

  reload(): void {
    this.loading = true;
    this.mantenimientoService.listarTarifasPorProveedor(this.idProveedor).subscribe({
      next: (resp: any[]) => {
        this.tarifas = resp ?? [];
        if (this.tarifas.length > 0) {
          this.proveedorNombre = this.tarifas[0].proveedor ?? '';
        }
      },
      error: (err) => {
        console.error('Error al listar tarifas:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Tarifas',
          detail: err?.error?.message ?? 'No se pudo listar tarifas.',
        });
      },
      complete: () => (this.loading = false),
    });
  }

  nuevo(): void {
    this.abrirModal(0);
  }

  editar(id: any): void {
    const idTarifa = Number(id);
    if (!Number.isFinite(idTarifa) || idTarifa <= 0) return;
    this.abrirModal(idTarifa);
  }

  private abrirModal(idTarifa: number): void {
    const ref = this.dialogService.open(FormtarifaproveedorComponent, {
      header: idTarifa > 0 ? 'Editar tarifa' : 'Nueva tarifa',
      width: '60vw',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: true,
      data: {
        idProveedor: this.idProveedor,
        idTarifa,
      },
    });

    ref.onClose.subscribe((guardado) => {
      if (guardado) {
        this.reload();
      }
    });
  }

  eliminar(id: any): void {
    const idTarifa = Number(id);
    if (!Number.isFinite(idTarifa) || idTarifa <= 0) return;
    this.confirmationService.confirm({
      header: 'Confirmación',
      message: '¿Está seguro que desea eliminar esta tarifa?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        this.mantenimientoService.eliminarTarifaProveedor(idTarifa).subscribe({
          next: (resp: any) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Tarifa',
              detail: resp?.message ?? 'Tarifa eliminada correctamente.',
            });
            this.reload();
          },
          error: (err) => {
            console.error('Error al eliminar tarifa:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Tarifa',
              detail: err?.error?.message ?? 'No se pudo eliminar la tarifa.',
            });
          },
        });
      },
    });
  }

  volver(): void {
    this.router.navigate(['/mantenimiento/listadoproveedores']);
  }
}
