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
import { ModalRecojoEstacionComponent } from './modal-recojo-estacion.component';
import { ModalRecepcionEstacionComponent } from './modal-recepcion-estacion.component';
import { ModalManifiestoEstacionComponent } from './modal-manifiesto-estacion.component';
import { ModalEntregaLocalEstacionComponent } from './modal-entrega-local-estacion.component';
import { ModalPendienteCargoEstacionComponent } from './modal-pendiente-cargo-estacion.component';
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
    resumenRecepcionMap = new Map<number, any>();
    resumenRecojoMap = new Map<number, any>();
    resumenEntregaLocalMap = new Map<number, any>();
    resumenPendienteCargoMap = new Map<number, any>();
    resumenEnvioCargoMap = new Map<number, any>();

    // Mapeo de estados según la columna (según stored procedure)
    estadosMap: { [key: string]: number | number[] } = {
        'pendiente_programar': 6,
        'pendiente_despacho': [7, 8, 9, 10],
        'recepcion': [10, 11, 25],
        'recojo': 11, // Nota: también requiere idtipooperacion = 123
        'enreparto': 13,
        'recabarcargo': 34,
        'enviocargo': 35,
        'entrega_local': [6, 7, 8, 9, 10]
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
     

        // ordenes3 = base (por estación) + recepción + recojo del SP (mergeados por idestacion)
        forkJoin({
            base: this.traficoService.VerDespachosxDepartamentoxEstacion(this.model),
            recepcion: this.traficoService.GetResumenOrdenesRecepcion().pipe(catchError(() => of([] as any[]))),
            recojo: this.traficoService.GetResumenRecojoXEstacion().pipe(catchError(() => of([] as any[]))),
            entregaLocal: this.traficoService.GetResumenOrdenesxEntregaLocal().pipe(catchError(() => of([] as any[]))),
            pendienteCargo: this.traficoService.GetResumenPendienteCargo().pipe(catchError(() => of([] as any[]))),
            envioCargo: this.traficoService.GetResumenEnvioCargo().pipe(catchError(() => of([] as any[]))),
        }).subscribe(({ base, recepcion, recojo, entregaLocal, pendienteCargo, envioCargo }) => {
            this.resumenRecepcionMap = new Map<number, any>();
            (recepcion ?? []).forEach((r: any) => {
                const key = Number(r?.idEstacion ?? r?.idestacion);
                if (Number.isFinite(key)) this.resumenRecepcionMap.set(key, r);
            });

            this.resumenRecojoMap = new Map<number, any>();
            (recojo ?? []).forEach((r: any) => {
                const key = Number(r?.idEstacion ?? r?.idestacion);
                if (Number.isFinite(key)) this.resumenRecojoMap.set(key, r);
            });

            this.resumenEntregaLocalMap = new Map<number, any>();
            (entregaLocal ?? []).forEach((r: any) => {
                const key = Number(r?.idEstacion ?? r?.idestacion);
                if (Number.isFinite(key)) this.resumenEntregaLocalMap.set(key, r);
            });

            this.resumenPendienteCargoMap = new Map<number, any>();
            (pendienteCargo ?? []).forEach((r: any) => {
                const key = Number(r?.idEstacion ?? r?.idestacion);
                if (Number.isFinite(key)) this.resumenPendienteCargoMap.set(key, r);
            });

            this.resumenEnvioCargoMap = new Map<number, any>();
            (envioCargo ?? []).forEach((r: any) => {
                const key = Number(r?.idEstacion ?? r?.idestacion);
                if (Number.isFinite(key)) this.resumenEnvioCargoMap.set(key, r);
            });

            this.ordenes3 = base ?? [];
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

    verDetalleRecepcion(rowData: any) {
        const entrada = this.resumenRecepcionMap.get(rowData.idestacion);
        const idProvincia = entrada?.idprovincia ?? entrada?.Idprovincia ?? null;
        const titulo = 'Recepción - ' + rowData.estacion;

        this.ref = this.dialogService.open(ModalRecepcionEstacionComponent, {
            header: titulo,
            width: '90%',
            modal: true,
            closable: true,
            dismissableMask: true,
            data: { idProvincia, titulo }
        });
    }

    verDetalleEnvioCargo(rowData: any) {
        const entrada = this.resumenEnvioCargoMap.get(rowData.idestacion);
        const idProvincia = entrada?.idprovincia ?? entrada?.Idprovincia ?? null;
        const titulo = 'Enviar Cargos - ' + rowData.estacion;

        this.ref = this.dialogService.open(ModalPendienteCargoEstacionComponent, {
            header: titulo,
            width: '90%',
            modal: true,
            closable: true,
            dismissableMask: true,
            data: { idProvincia, titulo, tipo: 'enviocargo' }
        });
    }

    verDetallePendienteCargo(rowData: any) {
        const entrada = this.resumenPendienteCargoMap.get(rowData.idestacion);
        const idProvincia = entrada?.idprovincia ?? entrada?.Idprovincia ?? null;
        const titulo = 'Recabar Cargos - ' + rowData.estacion;

        this.ref = this.dialogService.open(ModalPendienteCargoEstacionComponent, {
            header: titulo,
            width: '90%',
            modal: true,
            closable: true,
            dismissableMask: true,
            data: { idProvincia, titulo }
        });
    }

    verDetalleEntregaLocal(rowData: any) {
        const entrada = this.resumenEntregaLocalMap.get(rowData.idestacion);
        const idProvincia = entrada?.idprovincia ?? entrada?.Idprovincia ?? null;
        const titulo = 'Entrega - ' + rowData.estacion;

        this.ref = this.dialogService.open(ModalEntregaLocalEstacionComponent, {
            header: titulo,
            width: '90%',
            modal: true,
            closable: true,
            dismissableMask: true,
            data: { idProvincia, titulo }
        });
    }

    verDetalleManifiestosRecepcion(rowData: any) {
        const entrada = this.resumenRecepcionMap.get(rowData.idestacion);
        const idProvincia = entrada?.idprovincia ?? entrada?.Idprovincia ?? null;
        const titulo = 'Manifiestos en Recepción - ' + rowData.estacion;

        this.ref = this.dialogService.open(ModalManifiestoEstacionComponent, {
            header: titulo,
            width: '90%',
            modal: true,
            closable: true,
            dismissableMask: true,
            data: { idProvincia, titulo }
        });
    }

    verDetalleRecojo(rowData: any) {
        const entrada = this.resumenRecojoMap.get(rowData.idestacion);
        const idProvincia = entrada?.idprovincia ?? entrada?.Idprovincia ?? null;
        const titulo = 'Recojo - ' + rowData.estacion;

        this.ref = this.dialogService.open(ModalRecojoEstacionComponent, {
            header: titulo,
            width: '90%',
            modal: true,
            closable: true,
            dismissableMask: true,
            data: { idProvincia, titulo }
        });
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
