import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ComercialService } from '../../comercial/comercial.service';
import { IntegradoComercialPorClienteResult } from '../recojo.types';
import { User } from 'app/core/user/user.types';
import { ModalOtClienteComponent } from './modal-ot-cliente.component';

@Component({
  selector: 'app-recojo-integrado',
  templateUrl: './integrado.component.html',
  styleUrls: ['./integrado.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    ButtonModule,
    PanelModule,
    TableModule,
  ],
  providers: [DialogService],
})
export class IntegradoComponent implements OnInit {
  cols: any[];
  ordenes: IntegradoComercialPorClienteResult[] = [];
  user: User;
  loading = false;
  ref: DynamicDialogRef | undefined;

  estadosMap: { [key: string]: number | number[] } = {
    recepcion: [10, 11, 25],
    enreparto: 13,
    recabarcargo: 34,
    enviocargo: 35,
    observadas: 36
  };

  constructor(
    private comercialService: ComercialService,
    private router: Router,
    public dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('user'));
    this.initColumnas();
    this.reload();
  }

  private initColumnas(): void {
    this.cols = [
      { header: 'CLIENTE', field: 'cliente', width: '150px' },
      // { header: 'PROVINCIA', field: 'provincia', width: '200px' }, // tal vez la usemos luego
      { header: 'Cantidad', field: 'cantidad_recepcion', width: '30px', icon: 'fa fa-hashtag' },
      { header: 'Peso (kg)', field: 'peso_recepcion', width: '30px', icon: 'fa fa-balance-scale' },
      { header: 'Bultos', field: 'bulto_recepcion', width: '30px', icon: 'fa fa-cube' },
      { header: 'Cantidad', field: 'cantidad_enreparto', width: '30px', icon: 'fa fa-hashtag' },
      { header: 'Peso (kg)', field: 'peso_enreparto', width: '30px', icon: 'fa fa-balance-scale' },
      { header: 'Bultos', field: 'bulto_enreparto', width: '30px', icon: 'fa fa-cube' },
      { header: 'Cantidad', field: 'cantidad_recabarcargo', width: '30px', icon: 'fa fa-hashtag' },
      { header: 'Peso (kg)', field: 'peso_recabarcargo', width: '30px', icon: 'fa fa-balance-scale' },
      { header: 'Bultos', field: 'bulto_recabarcargo', width: '30px', icon: 'fa fa-cube' },
      { header: 'Cantidad', field: 'cantidad_enviocargo', width: '30px', icon: 'fa fa-hashtag' },
      { header: 'Peso (kg)', field: 'peso_enviocargo', width: '30px', icon: 'fa fa-balance-scale' },
      { header: 'Bultos', field: 'bulto_enviocargo', width: '30px', icon: 'fa fa-cube' },
      { header: 'Observadas', field: 'cantidad_observadas', width: '30px', icon: 'fa fa-exclamation-triangle' },
    ];
  }

  reload(): void {
    const idusuario = this.user?.usr_int_id ?? this.user?.id;
    const idequipo = this.user?.idequipo ?? (this.user as any)?.['idEquipo'];
    this.loading = true;
    this.comercialService.getIntegradoComercialPorCliente(idusuario, idequipo).subscribe({
      next: (list) => {
        this.ordenes = (list ?? []).map((r) => ({
          ...r,
          _rowKey: `${r.idcliente}_${r.idprovincia}`,
        }));
      },
      error: (err) => {
        console.error('Error al cargar integrado comercial:', err);
        this.ordenes = [];
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  verDetalle(idcliente: number, idprovincia: number): void {
    this.router.navigate(['/seguimientoot/listadoordentransportecomercial'], {
      queryParams: { idcliente, idprovincia },
    });
  }

  verDetalleOT(idcliente: number, tipoColumna: string, titulo: string): void {
    const estados = this.estadosMap[tipoColumna];
    if (estados === undefined) return;

    this.ref = this.dialogService.open(ModalOtClienteComponent, {
      header: titulo,
      width: '90%',
      modal: true,
      closable: true,
      dismissableMask: true,
      data: {
        idcliente,
        estados,
        titulo
      }
    });
  }
}
