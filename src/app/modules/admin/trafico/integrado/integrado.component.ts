import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TraficoService } from '../trafico.service';
import { User } from '../trafico.types';
import { ModalOtEstacionComponent } from './modal-ot-estacion.component';
import { catchError, forkJoin, of } from 'rxjs';
declare var $: any;

@Component({
    selector: 'app-integrado',
    templateUrl: './integrado.component.html',
    styleUrls: ['./integrado.component.css'],
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
    providers: [ConfirmationService, DialogService],
})
export class IntegradoComponent implements OnInit {
    baseUrlHRu: string = 'http://104.36.166.65/webreports/hojaruta.aspx';

    cols: any[];
    cols2: any[];
    cols3: any[];

    ordenes: any[];
    ordenes2: any[];
    ordenes3: any[];
    user: User;

    model: any = {};
    selectedOrden: any;
    ref: DynamicDialogRef | undefined;

    // Mapeo de estados según la columna (según stored procedure)
    estadosMap: { [key: string]: number | number[] } = {
        'pendiente_programar': 6,
        'pendiente_despacho': [7, 8, 9, 10],
        'recepcion': [10, 11, 25],
        'recojo': 11, // Nota: también requiere idtipooperacion = 123
        'enreparto': 13,
        'recabarcargo': 34,
        'enviocargo': 35
    };

    constructor(
        private traficoService: TraficoService,
        private router: Router,
        public dialogService: DialogService
    ) {}

    ngOnInit() {
        this.user = JSON.parse(localStorage.getItem('user'));

        console.log(this.user);

        this.model.idusuario = this.user.usr_int_id;
        this.model.idequipo = this.user.idEquipo;

        this.cols = [
            { header: 'ACC.', field: 'acciones', width: '110px' },
            { header: 'PROVEEDOR', field: 'proveedor', width: '190px' },
            { header: 'PLACA', field: 'placa', width: '60px' },
            { header: 'HR', field: 'numHojaRuta', width: '80px' },
            { header: 'F. DESPACHO', field: 'fechaDespacho', width: '80px' },
            { header: 'ORIGEN', field: 'origen', width: '90px' },
            { header: 'DESTINO', field: 'destino', width: '90px' },

            { header: '#OTS', field: 'cantidad', width: '50px' },
            { header: 'BULTOS', field: 'bulto', width: '50px' },
            { header: 'PESO', field: 'peso', width: '50px' },
            { header: 'VOL', field: 'volumen', width: '50px' },

            { header: 'TOTAL', field: 'total', width: '80px' },
            { header: 'CERRADOS', field: 'cerrados', width: '80px' },
            { header: 'AVANCE', field: 'volumen', width: '80px' },
        ];

        this.cols2 = [
            { header: 'ACCIONES', field: 'acciones', width: '6px' },
            { header: 'DEPARTAMENTO', field: 'departamento', width: '100px' },
            { header: 'PROVEEDOR', field: 'repartidor', width: '100px' },
            { header: '#OTS', field: 'cantidad', width: '60px' },
            { header: 'PESO', field: 'peso', width: '60px' },
            { header: 'BULTOS', field: 'bulto', width: '60px' },

            { header: '#OTS', field: 'cantidad', width: '60px' },
            { header: 'PESO', field: 'peso', width: '60px' },
            { header: 'BULTOS', field: 'bulto', width: '60px' },

            { header: '#OTS', field: 'cantidad', width: '60px' },
            { header: 'PESO', field: 'peso', width: '60px' },
            { header: 'BULTOS', field: 'bulto', width: '60px' },

            { header: '#OTS', field: 'cantidad', width: '60px' },
            { header: '#OTS', field: 'cantidad', width: '60px' },

            { header: 'OTS', field: 'observadas', width: '80px' }, // 👈 Nueva columna
            { header: 'MANIFIESTOS', field: 'observadas', width: '80px' }, // 👈 Nueva columna
        ];


          this.cols3 = [
            { header: 'ACCIONES', field: 'acciones', width: '6px' },
            { header: 'ESTACIÓN', field: 'departamento', width: '100px' },
            
            { header: '#OTS', field: 'cantidad', width: '60px' },
            { header: 'PESO', field: 'peso', width: '60px' },
            { header: 'BULTOS', field: 'bulto', width: '60px' },

            { header: '#OTS', field: 'cantidad', width: '60px' },
            { header: 'PESO', field: 'peso', width: '60px' },
            { header: 'BULTOS', field: 'bulto', width: '60px' },

            { header: '#OTS', field: 'cantidad', width: '60px' },
            { header: 'PESO', field: 'peso', width: '60px' },
            { header: 'BULTOS', field: 'bulto', width: '60px' },

            { header: '#OTS', field: 'cantidad', width: '60px' },
            { header: '#OTS', field: 'cantidad', width: '60px' },

            { header: 'OTS', field: 'observadas', width: '80px' }, // 👈 Nueva columna
            { header: 'MANIFIESTOS', field: 'observadas', width: '80px' }, // 👈 Nueva columna
        ];



        this.reload();
    }
    reload() {
        this.traficoService.VerHojasRutaTrocal(this.model).subscribe((list) => {
            this.ordenes = list;
            setTimeout(() => {
              window.scrollTo({ top: 300, behavior: 'smooth' });
            }, 100); 
         
        });
        this.traficoService
            .VerDespachosxDepartamentoxProveedor(this.model)
            .subscribe((list) => {
                this.ordenes2 = list;
                console.log('ordenes2', this.ordenes2);
            });
     

        // ordenes3 = base (por estación) + recepcion (lógica separada)
        forkJoin({
            base: this.traficoService.VerDespachosxDepartamentoxEstacion(this.model),
            recepcion: this.traficoService.GetPendienteRecepcionPorEstacion().pipe(
                catchError(() => of([] as any[]))
            ),
        }).subscribe(({ base, recepcion }) => {
            const recepcionMap = new Map<number, any>();
            (recepcion ?? []).forEach((r: any) => {
                // El endpoint nuevo viene como idEstacion (camelCase), el resto usa idestacion.
                const key = Number(r?.idestacion ?? r?.idEstacion);
                if (Number.isFinite(key)) recepcionMap.set(key, r);
            });

            this.ordenes3 = (base ?? []).map((row: any) => {
                const key = Number(row?.idestacion);
                const r = Number.isFinite(key) ? recepcionMap.get(key) : undefined;
                return {
                    ...row,
                    // Reemplazar solo métricas de recepción con el endpoint nuevo (fallback 0)
                    cantidad_recepcion: r?.cantidad_recepcion ?? 0,
                    peso_recepcion: r?.peso_recepcion ?? 0,
                    bulto_recepcion: r?.bulto_recepcion ?? 0,
                };
            });

            console.log({ recepcion, ordenes3: this.ordenes3 }, 'merge-recepcion');
        });
    }

    verHojaRuta(idDespacho: number): void {
        const url = `${this.baseUrlHRu}?iddespacho=${idDespacho}`;
        window.open(url, '_blank');
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
        this.router.navigate(['/trafico/vistamanifiesto', idhojaruta]);
    }
    verRepartidor(idproveedor: number, iddepartamento: number) {
        
            this.router.navigate(['/trafico/vistarepartidor', idproveedor, iddepartamento]);


    }

    verDetalleOT(idestacion: number, tipoColumna: string, titulo: string) {
        const estados = this.estadosMap[tipoColumna];
        if (!estados) {
            console.warn('Estado no mapeado para:', tipoColumna);
            return;
        }

        this.ref = this.dialogService.open(ModalOtEstacionComponent, {
            header: titulo,
            width: '90%',
            modal: true,
            closable: true,
            dismissableMask: true,
            data: {
                idestacion: idestacion,
                estados: estados,
                titulo: titulo
            }
        });
    }
}
