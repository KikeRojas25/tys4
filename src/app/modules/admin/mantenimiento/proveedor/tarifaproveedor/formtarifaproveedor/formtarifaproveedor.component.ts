import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { ToastModule } from 'primeng/toast';
import { forkJoin } from 'rxjs';
import { MantenimientoService } from '../../../mantenimiento.service';

@Component({
  selector: 'app-formtarifaproveedor',
  templateUrl: './formtarifaproveedor.component.html',
  styleUrls: ['./formtarifaproveedor.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    DropdownModule,
    InputNumberModule,
    InputTextModule,
    PanelModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService],
})
export class FormtarifaproveedorComponent implements OnInit {
  private readonly TABLA_TIPO_UNIDAD = 7;

  idProveedor = 0;
  idTarifa = 0;
  esEdicion = false;
  form!: FormGroup;
  loading = false;

  departamentos: SelectItem[] = [];
  provincias: SelectItem[] = [];
  distritos: SelectItem[] = [];
  tiposUnidad: SelectItem[] = [];

  constructor(
    private fb: FormBuilder,
    private mantenimientoService: MantenimientoService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
  ) {}

  ngOnInit(): void {
    this.idProveedor = Number(this.config.data?.idProveedor ?? 0);
    this.idTarifa = Number(this.config.data?.idTarifa ?? 0);
    this.esEdicion = this.idTarifa > 0;

    if (!Number.isFinite(this.idProveedor) || this.idProveedor <= 0) {
      this.messageService.add({ severity: 'error', summary: 'Tarifa', detail: 'Proveedor inválido.' });
      this.ref.close();
      return;
    }

    this.form = this.fb.group({
      iddestinodepartamento: [null],
      iddestinoprovincia: [null],
      iddestinodistrito: [null],
      idtipounidad: [null],
      precio: [null],
    });

    this.loading = true;
    forkJoin({
      departamentos: this.mantenimientoService.getDepartamentos(),
      tiposUnidad: this.mantenimientoService.getValorTabla(this.TABLA_TIPO_UNIDAD),
    }).subscribe({
      next: ({ departamentos, tiposUnidad }) => {
        this.departamentos = (departamentos ?? []).map((d: any) => ({
          value: d.idDepartamento,
          label: d.departamento,
        }));
        this.tiposUnidad = (tiposUnidad ?? []).map((v: any) => ({
          value: v.idValorTabla,
          label: v.valor,
        }));

        this.suscribirCascadas();

        if (this.esEdicion) {
          this.cargarTarifa();
        } else {
          this.loading = false;
        }
      },
      error: () => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Catálogos', detail: 'No se pudieron cargar los catálogos.' });
      },
    });
  }

  private suscribirCascadas(): void {
    this.form.get('iddestinodepartamento')?.valueChanges.subscribe((idDep) => {
      this.provincias = [];
      this.distritos = [];
      this.form.patchValue({ iddestinoprovincia: null, iddestinodistrito: null }, { emitEvent: false });
      if (idDep) {
        this.cargarProvincias(idDep);
      }
    });

    this.form.get('iddestinoprovincia')?.valueChanges.subscribe((idProv) => {
      this.distritos = [];
      this.form.patchValue({ iddestinodistrito: null }, { emitEvent: false });
      if (idProv) {
        this.cargarDistritos(idProv);
      }
    });
  }

  private cargarProvincias(idDepartamento: number): void {
    this.mantenimientoService.getProvinciasByDepartamento(idDepartamento).subscribe({
      next: (resp: any[]) => {
        this.provincias = (resp ?? []).map((p: any) => ({
          value: p.idProvincia,
          label: p.provincia,
        }));
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Ubigeo', detail: 'No se pudieron cargar las provincias.' });
      },
    });
  }

  private cargarDistritos(idProvincia: number): void {
    this.mantenimientoService.getDistritosByProvincia(idProvincia).subscribe({
      next: (resp: any[]) => {
        this.distritos = (resp ?? []).map((d: any) => ({
          value: d.idDistrito,
          label: d.distrito,
        }));
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Ubigeo', detail: 'No se pudieron cargar los distritos.' });
      },
    });
  }

  private cargarTarifa(): void {
    this.loading = true;
    this.mantenimientoService.obtenerTarifaProveedor(this.idTarifa).subscribe({
      next: (resp: any) => {
        const idDep = resp?.iddestinodepartamento ?? null;
        const idProv = resp?.iddestinoprovincia ?? null;
        const idDist = resp?.iddestinodistrito ?? null;

        this.form.patchValue({
          idtipounidad: resp?.idtipounidad ?? null,
          precio: resp?.precio ?? null,
        }, { emitEvent: false });

        if (idDep) {
          this.form.patchValue({ iddestinodepartamento: idDep }, { emitEvent: false });
          this.mantenimientoService.getProvinciasByDepartamento(idDep).subscribe((provs: any[]) => {
            this.provincias = (provs ?? []).map((p: any) => ({ value: p.idProvincia, label: p.provincia }));
            if (idProv) {
              this.form.patchValue({ iddestinoprovincia: idProv }, { emitEvent: false });
              this.mantenimientoService.getDistritosByProvincia(idProv).subscribe((dists: any[]) => {
                this.distritos = (dists ?? []).map((d: any) => ({ value: d.idDistrito, label: d.distrito }));
                if (idDist) {
                  this.form.patchValue({ iddestinodistrito: idDist }, { emitEvent: false });
                }
              });
            }
          });
        }
      },
      error: (err) => {
        console.error('Error cargando tarifa:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Tarifa',
          detail: err?.error?.message ?? 'No se pudo cargar la tarifa.',
        });
        this.ref.close();
      },
      complete: () => (this.loading = false),
    });
  }

  guardar(): void {
    if (this.loading) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: any = {
      idproveedor: this.idProveedor,
      iddestinodepartamento: this.form.value.iddestinodepartamento,
      iddestinoprovincia: this.form.value.iddestinoprovincia,
      iddestinodistrito: this.form.value.iddestinodistrito,
      idtipounidad: this.form.value.idtipounidad,
      precio: this.form.value.precio,
    };

    this.confirmationService.confirm({
      header: 'Confirmación',
      message: this.esEdicion ? '¿Confirma actualizar esta tarifa?' : '¿Confirma registrar esta tarifa?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        this.loading = true;
        const obs = this.esEdicion
          ? this.mantenimientoService.actualizarTarifaProveedor(this.idTarifa, { ...payload, id: this.idTarifa })
          : this.mantenimientoService.crearTarifaProveedor(payload);

        obs.subscribe({
          next: (resp: any) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Tarifa',
              detail: resp?.message ?? (this.esEdicion ? 'Tarifa actualizada.' : 'Tarifa registrada.'),
            });
            this.ref.close(true);
          },
          error: (err) => {
            console.error('Error al guardar tarifa:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Tarifa',
              detail: err?.error?.message ?? 'No se pudo guardar la tarifa.',
            });
          },
          complete: () => (this.loading = false),
        });
      },
    });
  }

  cancelar(): void {
    this.ref.close();
  }
}
