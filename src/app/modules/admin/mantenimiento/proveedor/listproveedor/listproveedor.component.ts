import { Component, OnInit } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { MantenimientoService } from '../../mantenimiento.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';


@Component({
  selector: 'app-listproveedor',
  templateUrl: './listproveedor.component.html',
  styleUrls: ['./listproveedor.component.css'],
    standalone: true,
    imports:[
      MatIcon,
      RouterModule,
      TableModule,
      FormsModule,
      CommonModule,
      ButtonModule,
      ConfirmDialogModule,
      ToastModule,
      InputTextModule,
      DropdownModule
    ],
    providers: [ConfirmationService, MessageService]
})
export class ListproveedorComponent implements OnInit {
  provedores: any[] = [];
  model: any = { criterio: '', tipoId: null };
  tipos: SelectItem[] = [];
  cols: any[] = [];
  loading = false;


  constructor(
    private mantenimientoService: MantenimientoService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit() {

    this.cols = [
      { field: 'idProveedor', header: 'ACC', width: '160px' },
      { field: 'tipo', header: 'TIPO', width: '120px' },
      { field: 'razonSocial', header: 'RAZÓN SOCIAL', width: '260px' },
      { field: 'ruc', header: 'RUC', width: '140px' },
      { field: 'direccion', header: 'DIRECCIÓN', width: '260px' },
      { field: 'ubigeo', header: 'UBIGEO', width: '200px' },
      { field: 'telefono', header: 'TELÉFONO', width: '140px' },
 
    ];

    this.tipos = [
      { value: null, label: 'TODOS' },
      { value: 21513, label: 'Transportista' },
      { value: 21514, label: 'Repartidor' },
      { value: 24669, label: 'Agencia' },
    ];

    this.reload();

  }

  reload(): void {
    this.loading = true;
    this.mantenimientoService.getAllProveedores(this.model.criterio ?? '', this.model.tipoId ?? null).subscribe({
      next: (resp: any[]) => {
        this.provedores = resp ?? [];
      },
      error: (err) => {
        console.error('Error al listar proveedores:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Proveedores',
          detail: err?.error?.message ?? 'No se pudo listar proveedores.',
        });
      },
      complete: () => (this.loading = false),
    });
  }

  buscar(): void {
    this.reload();
  }

  nuevo(): void {
    this.router.navigate(['/mantenimiento/nuevoproveedor']);
  }

  editar(idProveedor: any): void {
    const id = Number(idProveedor);
    if (!Number.isFinite(id) || id <= 0) return;
    this.router.navigate(['/mantenimiento/editarproveedor', id]);
  }

  eliminar(idProveedor: any): void {
    const id = Number(idProveedor);
    if (!Number.isFinite(id) || id <= 0) return;
    this.confirmationService.confirm({
      header: 'Confirmación',
      message: '¿Está seguro que desea eliminar (inactivar) este proveedor?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        this.mantenimientoService.eliminarProveedor(id).subscribe({
          next: (resp: any) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Proveedor',
              detail: resp?.message ?? 'Proveedor eliminado correctamente.',
            });
            this.reload();
          },
          error: (err) => {
            console.error('Error al eliminar proveedor:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Proveedor',
              detail: err?.error?.message ?? 'No se pudo eliminar el proveedor.',
            });
          },
        });
      },
    });
  }

}
