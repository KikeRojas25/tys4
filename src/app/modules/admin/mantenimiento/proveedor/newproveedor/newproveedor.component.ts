import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { PanelModule } from 'primeng/panel';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { MantenimientoService } from '../../mantenimiento.service';


@Component({
  selector: 'app-newproveedor',
  templateUrl: './newproveedor.component.html',
  styleUrls: ['./newproveedor.component.css'],
  standalone: true,
  imports:[
    MatIcon,
    RouterModule,
    ButtonModule,
    DropdownModule,
    PanelModule,
    CommonModule,
    InputTextModule,
    ToastModule,
    ConfirmDialogModule,
    ReactiveFormsModule
  ],
  providers: [MessageService, ConfirmationService]
})
export class NewproveedorComponent implements OnInit {

  private readonly TIPO_REPARTIDOR = 21514;

  form!: FormGroup;
  tipos: SelectItem[] = [];
  provinciasRepartidor: SelectItem[] = [];
  loading = false;

  constructor(
    private fb: FormBuilder,
    private mantenimientoService: MantenimientoService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit() {

    this.form = this.fb.group({
      tipoId: [null, Validators.required],
      ruc: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(15)]],
      razonSocial: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
      direccion: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(150)]],
      telefono: [null, [Validators.maxLength(20)]],
      // No se usa ubicación para tipos ≠ Repartidor; para Repartidor se usa solo idProvinciaRepartidor
      idDepartamento: [null],
      idProvincia: [null],
      idProvinciaRepartidor: [null],
    });

    this.tipos = [
      { value: 21513, label: 'Transportista' },
      { value: 21514, label: 'Repartidor' },
      { value: 24669, label: 'Agencia' },
    ];

    // Aplicar reglas al cambiar el tipo
    this.form.get('tipoId')?.valueChanges.subscribe((tipoId: number) => {
      this.aplicarReglasTipo(tipoId ?? null);
    });

    // Estado inicial
    this.aplicarReglasTipo(this.form.get('tipoId')?.value ?? null);
  }

  private cargarProvinciasRepartidor(): void {
    this.mantenimientoService.getProvincias().subscribe({
      next: (resp: any[]) => {
        this.provinciasRepartidor = (resp ?? []).map((p: any) => ({ value: p.idProvincia, label: p.provincia }));
      },
      error: (err) => {
        console.error('Error cargando provincias (repartidor):', err);
        this.messageService.add({ severity: 'error', summary: 'Ubigeo', detail: 'No se pudo cargar provincias.' });
      },
    });
  }

  private aplicarReglasTipo(tipoId: number | null): void {
    const isRepartidor = Number(tipoId) === this.TIPO_REPARTIDOR;

    // Siempre se envían nulls para ubicación general, según requerimiento
    this.form.patchValue({ idDepartamento: null, idProvincia: null }, { emitEvent: false });

    const provRepCtrl = this.form.get('idProvinciaRepartidor');
    if (!provRepCtrl) return;

    if (isRepartidor) {
      // Repartidor: solo provincia repartidor (requerida)
      provRepCtrl.setValidators([Validators.required]);
      if (!this.provinciasRepartidor || this.provinciasRepartidor.length === 0) {
        this.cargarProvinciasRepartidor();
      }
    } else {
      // Otros: no usar ubicación
      provRepCtrl.clearValidators();
      provRepCtrl.setValue(null, { emitEvent: false });
    }
    provRepCtrl.updateValueAndValidity({ emitEvent: false });
  }

  guardar(): void {
    if (this.loading) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const tipoId = Number(this.form.get('tipoId')?.value);
    const isRepartidor = tipoId === this.TIPO_REPARTIDOR;

    const payload = {
      ...this.form.value,
      // Regla: para tipos distintos a Repartidor no se envía ubicación.
      idDepartamento: null,
      idProvincia: null,
      idProvinciaRepartidor: isRepartidor ? this.form.get('idProvinciaRepartidor')?.value : null,
    };

    this.confirmationService.confirm({
      header: 'Confirmación',
      message: '¿Está seguro que desea registrar este proveedor?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        this.loading = true;
        this.mantenimientoService.registrarProveedor(payload).subscribe({
          next: (resp: any) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Proveedor',
              detail: resp?.message ?? 'Proveedor registrado correctamente.',
            });
            this.router.navigate(['/mantenimiento/listadoproveedores']);
          },
          error: (err) => {
            console.error('Error al registrar proveedor:', err);
            const msg = err?.error?.message ?? 'No se pudo registrar el proveedor.';
            this.messageService.add({
              severity: err?.status === 409 ? 'warn' : 'error',
              summary: 'Proveedor',
              detail: msg,
            });
          },
          complete: () => (this.loading = false),
        });
      },
    });
  }

  cancelar(): void {
    this.router.navigate(['/mantenimiento/listadoproveedores']);
  }
 

}
