import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService, SortEvent } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { OrdenTransporteService } from '../../recepcion/ordentransporte/ordentransporte.service';
import { OrdenTransporte } from '../../recepcion/ordentransporte/ordentransporte.types';
import { Documento, Incidencia, User } from '../../trafico/trafico.types';
import { PlanningService } from '../planning.service';
import { Carga } from '../planning.types';
import { ModalTipoUnidadComponent } from '../porprovincia/modaltipounidad';
import { AsignarPlacalocalComponent } from './modal.asignarplacalocal';
import { ModalAsignaraCargaLocalComponent } from './modalasignaracarga';
import { VerDetalleOrdenRecojoComponent } from './VerDetalleOrdenRecojoComponent.component';

@Component({
    selector: 'app-planninglocal',
    templateUrl: './planninglocal.component.html',
    styleUrls: ['./planninglocal.component.css'],
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        DropdownModule,
        ButtonModule,
        ToastModule,
        CalendarModule,
        TableModule,
        ConfirmDialogModule,
        MatIcon,
        InputTextModule,
    ],
    providers: [ConfirmationService, DialogService, MessageService],
})
export class PlanninglocalComponent implements OnInit {
    sortMode: string = 'multiple';
    ordenes2: OrdenTransporte[] = [];

    ordenes11: OrdenTransporte[] = [];

    despacho: any;

    es: any;

    loading = false;
    cantidadTotal: number = 0;
    pesoTotal: number = 0;
    otsTotal: number = 0;
    bultosTotal: number = 0;
    subtotalTotal: number = 0;

    cantidadTotal1: number = 0;
    pesoTotal1: number = 0;
    otsTotal1: number = 0;
    bultosTotal1: number = 0;
    subtotalTotal1: number = 0;

    cantidadTotal2: number = 0;
    pesoTotal2: number = 0;
    otsTotal2: number = 0;
    bultosTotal2: number = 0;
    subtotalTotal2: number = 0;

    carga11 = false;

    selectedDepartaments: OrdenTransporte[];
    selectedOTs: OrdenTransporte[] = [];

    constructor(
        private router: Router,
        private confirmationService: ConfirmationService,
        public dialogService: DialogService,
        private messageService: MessageService,
        private planningService: PlanningService,
        private ordenService: OrdenTransporteService
    ) {}

    incidencias: Incidencia[] = [];
    carga: Carga[] = [];
    id: any;

    ref: DynamicDialogRef;

    documentos: Documento[];
    cols: any[];
    cols2: any[];
    selectedRows: any[];

    clonedOrders: { [s: string]: OrdenTransporte } = {};

    orden: OrdenTransporte = {};
    despachos: OrdenTransporte[] = [];
    user: User;

    model: any = {};
    dateInicio: Date = new Date(Date.now());

    ngOnInit() {


        this.user = JSON.parse(localStorage.getItem('user'));
        this.model.idusuariocreacion = this.user.id;
        this.model.idplanificador = this.user.id;

        this.es = {
            firstDayOfWeek: 1,
            dayNames: [
                'domingo',
                'lunes',
                'martes',
                'miércoles',
                'jueves',
                'viernes',
                'sábado',
            ],
            dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
            dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
            monthNames: [
                'enero',
                'febrero',
                'marzo',
                'abril',
                'mayo',
                'junio',
                'julio',
                'agosto',
                'septiembre',
                'octubre',
                'noviembre',
                'diciembre',
            ],
            monthNamesShort: [
                'ene',
                'feb',
                'mar',
                'abr',
                'may',
                'jun',
                'jul',
                'ago',
                'sep',
                'oct',
                'nov',
                'dic',
            ],
            today: 'Hoy',
            clear: 'Borrar',
        };

        this.cols = [
            { header: 'OT', field: 'numcp', width: '120px' },
            { header: 'F. CITA', field: 'fechahoracita', width: '90px' },
            { header: 'H. CITA', field: 'horacita', width: '70px' },
            { header: 'CLIENTE', field: 'remitente', width: '180px' },
            { header: 'ORIGEN', field: 'distritoOrigen', width: '120px' },
            { header: 'PUNTO DE PARTIDA', field: 'origen', width: '210px' },
            { header: 'DESTINO', field: 'distritoDestino', width: '120px' },
            { header: 'CENTRO DE ACOPIO', field: 'centroacopio', width: '160px' },
            { header: 'OBSERVACIONES', field: 'observaciones', width: '230px' },
            { header: 'BULTOS', field: 'bulto', width: '65px' },
            { header: 'PESO', field: 'peso', width: '65px' },
            { header: 'ACCIONES', field: 'acciones', width: '60px' },
        ];

        this.cols2 = [
            { field: 'numcarga', header: 'N° MOVIL', width: '120px' },
            { header: 'Tipo de Unidad', field: 'tipounidad', width: '60px' },
            { header: 'Planificador', field: 'planificador', width: '160px' },
            { header: 'Placa', field: 'placa', width: '90px' },
            { header: 'Estado', field: 'estado', width: '90px' },
            {
                header: 'Fecha de Registro',
                field: 'fecharegistro',
                width: '70px',
            },
            { header: 'Peso', field: 'peso', width: '30px' },
            { header: 'Volumen', field: 'volumen', width: '60px' },
            // {header: 'SubTotal', field: 'subtotal'  ,  width: '60px'  },
            { header: 'ACCIONES', field: 'acciones', width: '140px' },
        ];

        // Fecha única de filtro: hoy (la pantalla programa rutas del día)
        this.dateInicio = new Date();

        this.model.fec_ini = this.dateInicio;
        this.model.idestado = 6; // pendiente de programación

        

        this.buscar();
    }

    buscar() {
        this.reloadDetalles();
    }

  
    generar(idcarga: number) {
        const ref = this.dialogService.open(AsignarPlacalocalComponent, {
            header: 'Confirmar Despacho',
            width: '40%',
            height: '450px',
            contentStyle: { height: '450px', overflow: 'auto' },
            data: { idcarga },
        });
        ref.onClose.subscribe(() => {
            this.reloadDetalles();
          
        });
    }
    verDetalle(rowData) {

        const ref = this.dialogService.open(VerDetalleOrdenRecojoComponent, {
            header: 'Ver Detalle',
            width: '70vw',
            style: { 'max-width': '900px' },
            contentStyle: { 'max-height': '80vh', 'overflow-y': 'auto' },
            baseZIndex: 10000,
            data: { rowData },
                });
                ref.onClose.subscribe(() => {
                    // this.reloadDetalles();
                    // this.loading = false;
                });

    }
   
    eliminarDespacho(idcarga: number) {
        this.model.idcarga = idcarga;

        this.confirmationService.confirm({
            message: '¿Está seguro que desea eliminar el despacho?',
            header: 'Eliminar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.planningService
                    .eliminarDespacho(this.model)
                    .subscribe((resp) => {
                        this.reloadDetalles();
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Planning',
                            detail: 'Se ha eliminado de manera correcta.',
                        });
                    });
            },
            reject: () => {},
        });
    }



    verDocument(resp) {
        const url =
            'http://104.36.166.65/webreports/hojarutaor.aspx?idmanifiesto=' +
            String(resp.idmanifiesto);

        window.open(url);
    }

    crearcarga() {
        let ids = '';
        this.selectedOTs.forEach((element) => {
            ids = ids + ',' + element.iddepartamento;
        });

        this.ref = this.dialogService.open(ModalTipoUnidadComponent, {
            data: { tipoperacioncarga: 2 },
            header: 'Tipo de unidad a asignar',
            width: '40%',
            contentStyle: { overflow: 'auto' },
            baseZIndex: 10000,
        });
        this.ref.onClose.subscribe(() => {
            this.reloadDetalles();
        });
    }
    agregaracarga() {
        if (this.selectedRows.length === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Planning',
                detail: 'Debe seleccionar al menos una OT.',
            });
            return;
        }

        let ids = this.selectedRows;

        this.ref = this.dialogService.open(ModalAsignaraCargaLocalComponent, {
            data: { ids },
            header: 'Asignar a carga',
            width: '40%',
            contentStyle: { overflow: 'auto' },
            baseZIndex: 10000,
        });

        this.ref.onClose.subscribe((product: any) => {
            this.reloadDetalles();
        });
    }

    reloadDetalles() {
        this.selectedRows = [];

        this.loading = true;
        this.selectedOTs = [];

        this.bultosTotal = 0;
        this.pesoTotal = 0;
        this.subtotalTotal = 0;

        // SP v2 espera @fecha en formato dd/MM/yyyy (CONVERT 103). Usamos locale es-PE
        // que devuelve ese mismo formato.
        this.model.fecha = this.dateInicio.toLocaleDateString('es-PE');
        this.model.id = this.id;

        this.ordenService
            .GetAllOrdersDetailDistrito(this.user.idestacionorigen, this.model)
            .subscribe((list) => {
                this.ordenes2 = list;
                this.otsTotal = this.ordenes2.length;
            });

        this.ordenService
            .GetAllCargasTemporalTrafico(2, this.user.idestacionorigen)
            .subscribe((list1) => {
                this.despachos = list1;
                console.log('despachos', this.despachos);

                this.despachos.forEach((x) => {
                    this.bultosTotal = this.bultosTotal + x.vol;
                    this.pesoTotal = this.pesoTotal + x.peso;
                });
            });
    }

    ver(idcarga) {
        this.loading = true;
        this.router.navigate(['planning/generarrutaslocaldetalle', idcarga]);
    }

}
