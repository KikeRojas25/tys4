import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { TraficoService } from '../../trafico/trafico.service';
import { ModalOtEstacionComponent } from '../../trafico/integrado/modal-ot-estacion.component';
import { ModalRecojoEstacionComponent } from '../../trafico/integrado/modal-recojo-estacion.component';
import { ModalRecepcionEstacionComponent } from '../../trafico/integrado/modal-recepcion-estacion.component';
import { ModalManifiestoEstacionComponent } from '../../trafico/integrado/modal-manifiesto-estacion.component';
import { ModalEntregaLocalEstacionComponent } from '../../trafico/integrado/modal-entrega-local-estacion.component';
import { catchError, forkJoin, of } from 'rxjs';
import { User } from '../../trafico/trafico.types';

@Component({
    selector: 'app-estacion',
    templateUrl: './estacion.component.html',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        ButtonModule,
        PanelModule,
    ],
    providers: [DialogService],
})
export class EstacionComponent implements OnInit {

    ordenes3: any[] = [];
    user: User;
    model: any = {};
    ref: DynamicDialogRef | undefined;

    resumenRecepcionMap = new Map<number, any>();
    resumenRecojoMap = new Map<number, any>();
    resumenEntregaLocalMap = new Map<number, any>();

    estadosMap: { [key: string]: number | number[] } = {
        'pendiente_programar': 6,
        'pendiente_despacho': [7, 8, 9, 10],
        'recepcion': [10, 11, 25],
        'recojo': 11,
        'enreparto': 13,
        'recabarcargo': 34,
        'enviocargo': 35,
        'entrega_local': [6, 7, 8, 9, 10]
    };

    constructor(
        private traficoService: TraficoService,
        public dialogService: DialogService
    ) {}

    ngOnInit() {
        this.user = JSON.parse(localStorage.getItem('user'));
        this.model.idusuario = this.user.usr_int_id;
        this.model.idequipo = this.user.idEquipo;
        this.reload();
    }

    reload() {
        forkJoin({
            base: this.traficoService.VerDespachosxDepartamentoxEstacion(this.model),
            recepcion: this.traficoService.GetResumenOrdenesRecepcion().pipe(catchError(() => of([] as any[]))),
            recojo: this.traficoService.GetResumenRecojoXEstacion().pipe(catchError(() => of([] as any[]))),
            entregaLocal: this.traficoService.GetResumenOrdenesxEntregaLocal().pipe(catchError(() => of([] as any[]))),
        }).subscribe(({ base, recepcion, recojo, entregaLocal }) => {
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

            this.ordenes3 = base ?? [];
        });
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
        if (!estados) return;

        this.ref = this.dialogService.open(ModalOtEstacionComponent, {
            header: titulo,
            width: '90%',
            modal: true,
            closable: true,
            dismissableMask: true,
            data: { idestacion, estados, titulo }
        });
    }
}
