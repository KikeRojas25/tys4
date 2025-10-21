import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { TraficoService } from '../trafico.service';
import { User } from '../trafico.types';


@Component({
    selector: 'app-integradolocal',
    templateUrl: './integradolocal.component.html',
    styleUrls: ['./integradolocal.component.css'],
    standalone: true,
    imports: [
        TableModule,
        FormsModule,
        CommonModule,
        ButtonModule,
        MatIcon,
        PanelModule,
        TabViewModule,
        ProgressBarModule,
    ],
})
export class IntegradolocalComponent implements OnInit {
    baseUrlHRu: string = 'http://104.36.166.65/webreports/hojaruta.aspx';

    cols: any[];
    cols2: any[];

    ordenes: any[];
    ordenes2: any[];

    selectedOrden: any; // aquí se guardará la fila seleccionada


    user: User;

    model: any = {};

    resumen = {
        cantidadTotal: 0,
        rutaDistritos: '',
        totalRecojos: 0,
        totalEntregas: 0,
        toneladasEntregadas: 0,
        toneladasRecojidas: 0,
    };

    constructor(
        private traficoService: TraficoService,
        private router: Router
    ) {}

    ngOnInit() {
        this.user = JSON.parse(localStorage.getItem('user'));

        this.model.idusuario = this.user.usr_int_id;
        this.model.idequipo = this.user.idEquipo;

       this.cols = [
          { header: 'ACCIONES', field: 'acciones', width: '60px' },
          { header: 'HR', field: 'numHojaRuta', width: '90px' },
          { header: 'PLACA', field: 'placa', width: '80px' },
          { header: '# OTs', field: 'totalOTs', width: '70px' },
          { header: 'BULTOS', field: 'totalBultos', width: '90px' },
          { header: 'PESO (Kg)', field: 'totalPeso', width: '100px' },
          { header: 'RECOJOS', field: 'totalRecojos', width: '100px' },
          { header: 'ENTREGAS', field: 'totalEntregas', width: '100px' },
          { header: 'DESTINO(S)', field: 'destino', width: '200px' }
        ];

        this.reload();
    }
    reload() {

        this.traficoService
            .VerHojasRutaTrocalLocal()
            .subscribe((list) => {
                this.ordenes = list;
                    this.calcularResumen();

                console.log('ordenes', this.ordenes);
            });
    }

    verHojaRuta(idDespacho: number): void {
        const url = `${this.baseUrlHRu}?iddespacho=${idDespacho}`;
        window.open(url, '_blank');
    }
    onRowSelect(event: any) {
  console.log('Fila seleccionada:', event.data);
}

    calcularResumen() {
  // Total camiones (cantidad de manifiestos distintos)
  this.resumen.cantidadTotal = this.ordenes.length;

  // Concatenar distritos (sin repetir)
  this.resumen.rutaDistritos = [...new Set(this.ordenes.map(o => o.destino))].join(' → ');

  // Total entregas (sumar campo entregasOTs)
  this.resumen.totalEntregas = this.ordenes
    .reduce((sum, o) => sum + (o.entregasOTs || 0), 0);

  // Total recojos (sumar campo recojosOTs)
  this.resumen.totalRecojos = this.ordenes
    .reduce((sum, o) => sum + (o.recojosOTs || 0), 0);

  // Toneladas entregadas (sumar pesos de entregas)
  this.resumen.toneladasEntregadas = this.ordenes
    .reduce((sum, o) => sum + (o.entregasPeso || 0), 0) / 1000;

  // Toneladas recojidas (sumar pesos de recojos)
  this.resumen.toneladasRecojidas = this.ordenes
    .reduce((sum, o) => sum + (o.recojosPeso || 0), 0) / 1000;
}

    getIntegerPercentage(rowData: any): number {
        return Math.floor(rowData.porcentajeAvance);
    }

    getProgressBarStyle(porcentajeAvance: number): string {
        if (porcentajeAvance <= 30) {
            return 'rojo';
        } else if (porcentajeAvance <= 60) {
            return 'amarillo';
        } else {
            return 'verde';
        }
    }
    verDetalle(idhojaruta: number) {
        this.router.navigate(['/trafico/vistamanifiestolocal', idhojaruta]);
    }
    verRepartidor(idproveedor: number, iddepartamento: number) {
        this.router.navigate([
            '/trafico/vistarepartidor',
            idproveedor,
            iddepartamento,
        ]);
    }
}
