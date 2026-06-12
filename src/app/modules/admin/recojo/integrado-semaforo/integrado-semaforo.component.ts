import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { ComercialService } from '../../comercial/comercial.service';
import { IntegradoSemaforoPorClienteResult } from '../recojo.types';
import { User } from 'app/core/user/user.types';
import { ModalSemaforoDetalleComponent } from './modal-semaforo-detalle.component';

@Component({
  selector: 'app-integrado-semaforo',
  templateUrl: './integrado-semaforo.component.html',
  styleUrls: ['./integrado-semaforo.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    ButtonModule,
    PanelModule,
    TableModule,
    DynamicDialogModule,
  ],
  providers: [DialogService],
})
export class IntegradoSemaforoComponent implements OnInit {
  ordenes: IntegradoSemaforoPorClienteResult[] = [];
  user: User;
  loading = false;

  constructor(
    private comercialService: ComercialService,
    private router: Router,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('user'));
    this.reload();
  }

  reload(): void {
    const idusuario = this.user?.id ?? this.user?.usr_int_id;
    const idequipo = this.user?.idequipo ?? (this.user as any)?.['idEquipo'];
    console.log('[integrado-semaforo] user en localStorage:', this.user);
    console.log('[integrado-semaforo] idusuario que se envía:', idusuario, 'idequipo:', idequipo);
    this.loading = true;
    this.comercialService.getIntegradoSemaforoPorCliente(idusuario, idequipo).subscribe({
      next: (list) => {
        this.ordenes = list ?? [];
        this.cargarObservadas(idusuario);
      },
      error: () => {
        this.ordenes = [];
        this.loading = false;
      },
    });
  }

  private cargarObservadas(idusuario: number | null | undefined): void {
    this.comercialService.getIntegradoSemaforoObservadas(idusuario).subscribe({
      next: (obs) => {
        const map = new Map<number, number>();
        (obs ?? []).forEach(o => map.set(o.idcliente, o.cantidad_observadas ?? 0));
        this.ordenes = this.ordenes.map(r => ({
          ...r,
          cantidad_observadas: map.get(r.idcliente) ?? 0
        }));
      },
      complete: () => { this.loading = false; },
      error:    () => { this.loading = false; }
    });
  }

  verDetalle(idcliente: number): void {
    this.router.navigate(['/seguimientoot/listadoordentransportecomercial'], {
      queryParams: { idcliente },
    });
  }

  irIntegradoComercial(): void {
    this.router.navigate(['/seguimientoot/integradocomercial']);
  }

  verDetalleOT(row: IntegradoSemaforoPorClienteResult, tipo: 'atiempo' | 'porvencer' | 'fueratiempo' | 'observadas', titulo: string): void {
    const cantidad = tipo === 'atiempo' ? row.cantidad_atiempo
      : tipo === 'porvencer' ? row.cantidad_porvencer
      : tipo === 'fueratiempo' ? row.cantidad_fueratiempo
      : row.cantidad_observadas;
    if (cantidad <= 0) return;

    this.dialogService.open(ModalSemaforoDetalleComponent, {
      header: titulo,
      width: '90%',
      modal: true,
      closable: true,
      dismissableMask: true,
      data: {
        idcliente: row.idcliente,
        cliente: row.cliente,
        tipo,
        cantidad,
        titulo
      }
    });
  }
}
