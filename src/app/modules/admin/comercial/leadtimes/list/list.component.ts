import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MessageService, SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { MantenimientoService } from '../../../mantenimiento/mantenimiento.service';
import { LeadTimeProvinciaRow } from '../leadtimes.types';

@Component({
  selector: 'app-leadtimes-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TableModule,
    ToastModule,
    DropdownModule,
    ButtonModule,
    MatIconModule,
  ],
  providers: [MessageService],
})
export class ListComponent implements OnInit {
  clientes: SelectItem[] = [];
  idClienteSeleccionado: number | null = null;
  provincias: LeadTimeProvinciaRow[] = [];
  loading = false;

  /** Filas para la tabla: cada fila tiene provincia + metadata para rowspan del departamento */
  get tableRows(): Array<{ provincia: LeadTimeProvinciaRow; isFirstInGroup: boolean; rowspan: number }> {
    const grupos = this.groupByDepartamento(this.provincias);
    return grupos.flatMap((g) =>
      g.provincias.map((p, i) => ({
        provincia: p,
        isFirstInGroup: i === 0,
        rowspan: g.provincias.length,
      }))
    );
  }

  private groupByDepartamento(provincias: LeadTimeProvinciaRow[]): Array<{ departamento: string; idDepartamento: number; provincias: LeadTimeProvinciaRow[] }> {
    const map = new Map<number, { departamento: string; idDepartamento: number; provincias: LeadTimeProvinciaRow[] }>();
    for (const p of provincias) {
      if (!map.has(p.idDepartamento)) {
        map.set(p.idDepartamento, { departamento: p.departamento, idDepartamento: p.idDepartamento, provincias: [] });
      }
      map.get(p.idDepartamento)!.provincias.push(p);
    }
    return Array.from(map.values());
  }

  constructor(
    private mantenimientoService: MantenimientoService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.cargarClientes();
  }

  cargarClientes(): void {
    this.mantenimientoService.getAllClientes('', 2, true).subscribe({
      next: (clientes) => {
        this.clientes = clientes.map((c) => ({
          value: c.idCliente,
          label: c.razonSocial ?? '',
        }));
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los clientes',
        });
      },
    });
  }

  onClienteChange(idCliente: number | null): void {
    this.idClienteSeleccionado = idCliente;
    this.provincias = [];
    if (!idCliente) return;

    this.loading = true;
    // Cargar departamentos y sus provincias (agrupado)
    this.mantenimientoService.getDepartamentos().subscribe({
      next: (depts) => {
        const deptsLimit = (depts ?? []).slice(0, 8);
        if (deptsLimit.length === 0) {
          this.provincias = this.getProvinciasFicticias();
          this.loading = false;
          return;
        }
        const requests = deptsLimit.map((d) =>
          this.mantenimientoService.getProvinciasByDepartamento(d.idDepartamento).pipe(
            map((provs) =>
              (provs ?? []).map((p, i) => ({
                idDepartamento: d.idDepartamento,
                departamento: d.departamento,
                idProvincia: p.idProvincia,
                provincia: p.provincia,
                dias: (i % 6) + 1,
              }))
            )
          )
        );
        forkJoin(requests).subscribe({
          next: (results) => {
            this.provincias = results.flat();
            this.loading = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: `Se cargaron ${this.provincias.length} provincias`,
            });
          },
          error: () => {
            this.provincias = this.getProvinciasFicticias();
            this.loading = false;
          },
        });
      },
      error: () => {
        this.provincias = this.getProvinciasFicticias();
        this.loading = false;
      },
    });
  }

  private getProvinciasFicticias(): LeadTimeProvinciaRow[] {
    return [
      { idDepartamento: 15, departamento: 'Lima', idProvincia: 1, provincia: 'Lima', dias: 1 },
      { idDepartamento: 7, departamento: 'Callao', idProvincia: 2, provincia: 'Callao', dias: 1 },
      { idDepartamento: 15, departamento: 'Lima', idProvincia: 3, provincia: 'Huacho', dias: 2 },
      { idDepartamento: 20, departamento: 'La Libertad', idProvincia: 4, provincia: 'Trujillo', dias: 3 },
      { idDepartamento: 14, departamento: 'Lambayeque', idProvincia: 5, provincia: 'Chiclayo', dias: 3 },
      { idDepartamento: 19, departamento: 'Piura', idProvincia: 6, provincia: 'Piura', dias: 4 },
      { idDepartamento: 4, departamento: 'Arequipa', idProvincia: 7, provincia: 'Arequipa', dias: 4 },
      { idDepartamento: 8, departamento: 'Cusco', idProvincia: 8, provincia: 'Cusco', dias: 5 },
      { idDepartamento: 16, departamento: 'Loreto', idProvincia: 9, provincia: 'Iquitos', dias: 6 },
      { idDepartamento: 23, departamento: 'Tacna', idProvincia: 10, provincia: 'Tacna', dias: 5 },
    ];
  }

  guardar(): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Lead times guardados correctamente (maqueta)',
    });
  }
}
