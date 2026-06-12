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
import { InputTextModule } from 'primeng/inputtext';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TraficoService } from '../../trafico/trafico.service';
import { User } from '../../trafico/trafico.types';
// Modales no usados en esta vista. Se dejan comentados por si se reintegran
// los tabs de "Ver Troncal" / "Ver Estaciones" más adelante.
// import { ModalOtEstacionComponent } from '../../trafico/integrado/modal-ot-estacion.component';
// import { ModalRecojoEstacionComponent } from '../../trafico/integrado/modal-recojo-estacion.component';
// import { ModalRecepcionEstacionComponent } from '../../trafico/integrado/modal-recepcion-estacion.component';
// import { ModalManifiestoEstacionComponent } from '../../trafico/integrado/modal-manifiesto-estacion.component';
// import { ModalEntregaLocalEstacionComponent } from '../../trafico/integrado/modal-entrega-local-estacion.component';
// import { ModalPendienteCargoEstacionComponent } from '../../trafico/integrado/modal-pendiente-cargo-estacion.component';
// import { catchError, forkJoin, of } from 'rxjs';

@Component({
    selector: 'app-pendienteretorno',
    templateUrl: './pendienteretorno.component.html',
    styleUrls: ['./pendienteretorno.component.css'],
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
        InputTextModule,
    ],
    providers: [ConfirmationService, DialogService],
})
export class PendienteRetornoComponent implements OnInit {
    baseUrlHRu: string = 'http://104.36.166.65/webreports/hojaruta.aspx';

    // cols: any[]; // Troncal — no usado en esta vista
    cols2: any[];
    // cols3: any[]; // Estaciones — no usado en esta vista

    // ordenes: any[]; // Troncal
    ordenes2: any[] = [];           // resultado completo del backend
    ordenes2Filtradas: any[] = [];  // lo que se muestra después de aplicar filtros
    // ordenes3: any[]; // Estaciones
    user: User;

    // Filtros client-side
    filtroProvincia = '';
    filtroProveedor = '';

    model: any = {};
    selectedOrden: any;
    ref: DynamicDialogRef | undefined;

    // Mapas usados por la vista de Estaciones (no usados aquí).
    // resumenRecepcionMap = new Map<number, any>();
    // resumenRecojoMap = new Map<number, any>();
    // resumenEntregaLocalMap = new Map<number, any>();
    // resumenPendienteCargoMap = new Map<number, any>();
    // resumenEnvioCargoMap = new Map<number, any>();

    // Mapeo de estados según la columna (según stored procedure)
    // estadosMap: { [key: string]: number | number[] } = {
    //     'pendiente_programar': 6,
    //     'pendiente_despacho': [7, 8, 9, 10],
    //     'recepcion': [10, 11, 25],
    //     'recojo': 11, // Nota: también requiere idtipooperacion = 123
    //     'enreparto': 13,
    //     'recabarcargo': 34,
    //     'enviocargo': 35,
    //     'entrega_local': [6, 7, 8, 9, 10]
    // };

    constructor(
        private traficoService: TraficoService,
        private router: Router,
        public dialogService: DialogService
    ) {}

    ngOnInit() {
        this.user = JSON.parse(localStorage.getItem('user'));
        this.model.idusuario = this.user.id;
        this.model.idequipo = this.user.idEquipo;

        // Columnas reducidas: solo Acciones, Departamento, Proveedor, Recabar Cargos, Enviar Cargos.
        // Las demás (recepción / recojo / entrega / observadas) quedan comentadas por si se vuelven a habilitar.
        this.cols2 = [
            { header: 'ACCIONES',       field: 'acciones',              width: '6px' },
            { header: 'PROVINCIA',      field: 'departamento',          width: '180px' },
            { header: 'PROVEEDOR',      field: 'repartidor',            width: '200px' },
            // Recepción:
            // { header: '#OTS',           field: 'cantidad_recepcion',    width: '60px' },
            // { header: 'PESO',           field: 'peso_recepcion',        width: '60px' },
            // { header: 'BULTOS',         field: 'bulto_recepcion',       width: '60px' },
            // Recojo:
            // { header: '#OTS',           field: 'cantidad_recojo',       width: '60px' },
            // { header: 'PESO',           field: 'peso_recojo',           width: '60px' },
            // { header: 'BULTOS',         field: 'bulto_recojo',          width: '60px' },
            // Entrega:
            // { header: '#OTS',           field: 'cantidad_enreparto',    width: '60px' },
            // { header: 'PESO',           field: 'peso_enreparto',        width: '60px' },
            // { header: 'BULTOS',         field: 'bulto_enreparto',       width: '60px' },
            { header: 'RECABAR CARGOS', field: 'cantidad_recabarcargo', width: '120px' },
            { header: 'ENVIAR CARGOS',  field: 'cantidad_enviocargo',   width: '120px' },
            // Observadas:
            // { header: 'OTS',         field: 'cantidad_observadas',   width: '80px' },
            // { header: 'MANIFIESTOS', field: 'cantidad_observadas',   width: '80px' },
        ];

        // this.cols3 = [ ... ]; // Estaciones — no usado

        this.reload();
    }

    reload() {
        // Troncal — no se usa en esta vista
        // this.traficoService.VerHojasRutaTrocal(this.model).subscribe((list) => {
        //     this.ordenes = list;
        //     setTimeout(() => {
        //       window.scrollTo({ top: 300, behavior: 'smooth' });
        //     }, 100);
        // });

        this.traficoService
            .VerDespachosxDepartamentoxProveedor(this.model)
            .subscribe((list) => {
                this.ordenes2 = list ?? [];
                this.aplicarFiltros();
            });

        // Estaciones — no se usa en esta vista
        // forkJoin({
        //     base: this.traficoService.VerDespachosxDepartamentoxEstacion(this.model),
        //     recepcion: this.traficoService.GetResumenOrdenesRecepcion().pipe(catchError(() => of([] as any[]))),
        //     recojo: this.traficoService.GetResumenRecojoXEstacion().pipe(catchError(() => of([] as any[]))),
        //     entregaLocal: this.traficoService.GetResumenOrdenesxEntregaLocal().pipe(catchError(() => of([] as any[]))),
        //     pendienteCargo: this.traficoService.GetResumenPendienteCargo().pipe(catchError(() => of([] as any[]))),
        //     envioCargo: this.traficoService.GetResumenEnvioCargo().pipe(catchError(() => of([] as any[]))),
        // }).subscribe(({ base, recepcion, recojo, entregaLocal, pendienteCargo, envioCargo }) => {
        //     ...
        // });
    }

    /**
     * Aplica los filtros client-side de Provincia y Proveedor sobre `ordenes2`.
     * Comparación case-insensitive con `includes`, así sirve también como búsqueda parcial.
     * Además, excluye filas en las que TANTO `cantidad_recabarcargo` como `cantidad_enviocargo`
     * son 0 / null / undefined — solo interesan los repartidores con algo pendiente de retorno.
     */
    aplicarFiltros(): void {
        const prov = (this.filtroProvincia ?? '').toLowerCase().trim();
        const proveedor = (this.filtroProveedor ?? '').toLowerCase().trim();

        this.ordenes2Filtradas = this.ordenes2.filter((r) => {
            const recabar = Number(r?.cantidad_recabarcargo ?? 0);
            const enviar  = Number(r?.cantidad_enviocargo   ?? 0);
            if (recabar === 0 && enviar === 0) return false;

            if (prov && !((r.departamento ?? '') as string).toLowerCase().includes(prov)) return false;
            if (proveedor && !((r.repartidor ?? '') as string).toLowerCase().includes(proveedor)) return false;
            return true;
        });
    }

    limpiarFiltros(): void {
        this.filtroProvincia = '';
        this.filtroProveedor = '';
        this.aplicarFiltros();
    }

    verHojaRuta(idDespacho: number): void {
        const url = `${this.baseUrlHRu}?iddespacho=${idDespacho}`;
        window.open(url, '_blank');
    }

    getIntegerPercentage(rowData: any): number {
        return Math.floor(rowData.porcentajeAvance);
    }

    getProgressBarStyle(porcentajeAvance: number): string {
        if (porcentajeAvance <= 30) return 'rojo';
        if (porcentajeAvance <= 60) return 'amarillo';
        return 'verde';
    }

    verDetalle(idhojaruta: number) {
        this.router.navigate(['/trafico/vistamanifiesto', idhojaruta]);
    }

    verRepartidor(idproveedor: number, iddepartamento: number) {
        this.router.navigate(['/retorno/vistarepartidor', idproveedor, iddepartamento]);
    }

    // Métodos de detalle por estación — no usados en esta vista (los modales están comentados arriba).
    // verDetalleRecepcion(rowData: any) { ... }
    // verDetalleEnvioCargo(rowData: any) { ... }
    // verDetallePendienteCargo(rowData: any) { ... }
    // verDetalleEntregaLocal(rowData: any) { ... }
    // verDetalleManifiestosRecepcion(rowData: any) { ... }
    // verDetalleRecojo(rowData: any) { ... }
    // verDetalleOT(idestacion: number, tipoColumna: string, titulo: string) { ... }
}
