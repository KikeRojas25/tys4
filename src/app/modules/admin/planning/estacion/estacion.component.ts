import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TraficoService } from '../../trafico/trafico.service';
import { ModalOtEstacionComponent } from '../../trafico/integrado/modal-ot-estacion.component';
import { ModalRecojoEstacionComponent } from '../../trafico/integrado/modal-recojo-estacion.component';
import { ModalRecepcionEstacionComponent } from '../../trafico/integrado/modal-recepcion-estacion.component';
import { ModalManifiestoEstacionComponent } from '../../trafico/integrado/modal-manifiesto-estacion.component';
import { ModalEntregaLocalEstacionComponent } from '../../trafico/integrado/modal-entrega-local-estacion.component';
import { ModalPendienteCargoEstacionComponent } from '../../trafico/integrado/modal-pendiente-cargo-estacion.component';
import { catchError, forkJoin, of } from 'rxjs';

@Component({
    selector: 'app-planning-estacion',
    templateUrl: './estacion.component.html',
    styleUrls: ['./estacion.component.css'],
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatIcon,
        TableModule,
        ButtonModule,
    ],
    providers: [DialogService],
})
export class PlanningEstacionComponent implements OnInit {
    ordenes3: any[] = [];
    model: any = {};
    ref: DynamicDialogRef | undefined;
    loading = false;

    resumenRecepcionMap = new Map<number, any>();
    resumenRecojoMap = new Map<number, any>();
    resumenEntregaLocalMap = new Map<number, any>();
    resumenPendienteCargoMap = new Map<number, any>();
    resumenEnvioCargoMap = new Map<number, any>();

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

    ngOnInit(): void {
        const user = JSON.parse(localStorage.getItem('user') ?? '{}');
        this.model.idusuario = user?.usr_int_id;
        this.model.idequipo = user?.idEquipo;
        this.reload();
    }

    reload(): void {
        this.loading = true;
        forkJoin({
            base: this.traficoService.VerDespachosxDepartamentoxEstacion(this.model),
            recepcion: this.traficoService.GetResumenOrdenesRecepcion().pipe(catchError(() => of([] as any[]))),
            recojo: this.traficoService.GetResumenRecojoXEstacion().pipe(catchError(() => of([] as any[]))),
            entregaLocal: this.traficoService.GetResumenOrdenesxEntregaLocal().pipe(catchError(() => of([] as any[]))),
            pendienteCargo: this.traficoService.GetResumenPendienteCargo().pipe(catchError(() => of([] as any[]))),
            envioCargo: this.traficoService.GetResumenEnvioCargo().pipe(catchError(() => of([] as any[]))),
        }).subscribe({
            next: ({ base, recepcion, recojo, entregaLocal, pendienteCargo, envioCargo }) => {
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
            },
            complete: () => (this.loading = false),
        });
    }

    verDetalleRecepcion(rowData: any): void {
        const entrada = this.resumenRecepcionMap.get(rowData.idestacion);
        const idProvincia = entrada?.idprovincia ?? entrada?.Idprovincia ?? null;
        const titulo = 'Recepción - ' + rowData.estacion;
        this.ref = this.dialogService.open(ModalRecepcionEstacionComponent, {
            header: titulo, width: '90%', modal: true, closable: true, dismissableMask: true,
            data: { idProvincia, titulo }
        });
    }

    verDetalleEntregaLocal(rowData: any): void {
        const entrada = this.resumenEntregaLocalMap.get(rowData.idestacion);
        const idProvincia = entrada?.idprovincia ?? entrada?.Idprovincia ?? null;
        const titulo = 'Entrega - ' + rowData.estacion;
        this.ref = this.dialogService.open(ModalEntregaLocalEstacionComponent, {
            header: titulo, width: '90%', modal: true, closable: true, dismissableMask: true,
            data: { idProvincia, titulo }
        });
    }

    verDetalleManifiestosRecepcion(rowData: any): void {
        const entrada = this.resumenRecepcionMap.get(rowData.idestacion);
        const idProvincia = entrada?.idprovincia ?? entrada?.Idprovincia ?? null;
        const titulo = 'Manifiestos en Recepción - ' + rowData.estacion;
        this.ref = this.dialogService.open(ModalManifiestoEstacionComponent, {
            header: titulo, width: '90%', modal: true, closable: true, dismissableMask: true,
            data: { idProvincia, titulo }
        });
    }

    verDetalleRecojo(rowData: any): void {
        const entrada = this.resumenRecojoMap.get(rowData.idestacion);
        const idProvincia = entrada?.idprovincia ?? entrada?.Idprovincia ?? null;
        const titulo = 'Recojo - ' + rowData.estacion;
        this.ref = this.dialogService.open(ModalRecojoEstacionComponent, {
            header: titulo, width: '90%', modal: true, closable: true, dismissableMask: true,
            data: { idProvincia, titulo }
        });
    }

    verDetallePendienteCargo(rowData: any): void {
        const entrada = this.resumenPendienteCargoMap.get(rowData.idestacion);
        const idProvincia = entrada?.idprovincia ?? entrada?.Idprovincia ?? null;
        const titulo = 'Recabar Cargos - ' + rowData.estacion;
        this.ref = this.dialogService.open(ModalPendienteCargoEstacionComponent, {
            header: titulo, width: '90%', modal: true, closable: true, dismissableMask: true,
            data: { idProvincia, titulo }
        });
    }

    verDetalleEnvioCargo(rowData: any): void {
        const entrada = this.resumenEnvioCargoMap.get(rowData.idestacion);
        const idProvincia = entrada?.idprovincia ?? entrada?.Idprovincia ?? null;
        const titulo = 'Enviar Cargos - ' + rowData.estacion;
        this.ref = this.dialogService.open(ModalPendienteCargoEstacionComponent, {
            header: titulo, width: '90%', modal: true, closable: true, dismissableMask: true,
            data: { idProvincia, titulo, tipo: 'enviocargo' }
        });
    }

    verDetalleOT(idestacion: number, tipoColumna: string, titulo: string): void {
        const estados = this.estadosMap[tipoColumna];
        if (!estados) return;
        this.ref = this.dialogService.open(ModalOtEstacionComponent, {
            header: titulo, width: '90%', modal: true, closable: true, dismissableMask: true,
            data: { idestacion, estados, titulo }
        });
    }
}
