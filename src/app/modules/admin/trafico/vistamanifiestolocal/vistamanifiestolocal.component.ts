import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { PanelModule } from 'primeng/panel';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';
import { OrdenTransporte } from '../../recepcion/ordentransporte/ordentransporte.types';
import { TraficoService } from '../trafico.service';
import {
    Documento,
    HojaRuta,
    Incidencia,
    Manifiesto,
    User,
} from '../trafico.types';



import { CambiarEstadoModalLocalComponent } from './modalcambiarestado';
import { DialogEtaLocalComponent } from './modaleta';
import { DialogReasignarMobileLocalComponent } from './modalreasignarmobil';

@Component({
    selector: 'app-vistamanifiestos',
    standalone: true,
    templateUrl: './vistamanifiestolocal.component.html',
    styleUrl: './vistamanifiestolocal.component.scss',
    imports: [
        TableModule,
        FormsModule,
        CommonModule,
        ButtonModule,
        MatIcon,
        PanelModule,
        TabViewModule,
        ProgressBarModule,
        RouterModule,
        DialogModule,
        ToastModule,
        ConfirmDialogModule,
    ],
    providers: [ConfirmationService, DialogService, MessageService],
})
export class VistamanifiestoLocalComponent {
    modalDetalleManifiesto = false;
    ordenes2: HojaRuta[] = [];
    ordenes11: OrdenTransporte[] = [];
    baseUrlMani: string = 'http://104.36.166.65/webreports/manifiesto.aspx';
    baseUrlOrde: string = 'http://104.36.166.65/webreports/ot.aspx';

    ref: DynamicDialogRef | undefined;

    despacho: any;

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

    selectedDepartaments: Manifiesto[];
    selectedOTs: OrdenTransporte = {};

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        public dialogService: DialogService,
        private traficoService: TraficoService
    ) {}

    incidencias: Incidencia[] = [];
    id: any;

    documentos: Documento[];
    cols: any[];
    cols2: any[];

    cols3: any[];

    orden: HojaRuta = {};
    despachos: OrdenTransporte[] = [];
    user: User;

    model: any = {};

    ngOnInit() {
        this.user = JSON.parse(localStorage.getItem('user'));
        this.model.IdUsuarioRegistro = this.user.usr_int_id;

        this.cols3 = [
            {
                header: 'Hora programada',
                field: 'fechaHoraCita',
                width: '100px',
            },
            { header: 'Destino', field: 'provincia', width: '90px' },
            { header: 'Cliente', field: 'repartidor', width: '120px' },
            { header: 'OT', field: 'repartidor', width: '120px' },
            { header: 'Peso', field: 'peso', width: '30px' },
            { header: 'Bultos', field: 'bultos', width: '30px' },
            { header: 'Cantidad OTs', field: 'cantidad', width: '30px' },
            {
                header: 'Hora Cita Real',
                field: 'fechaHoraCitaReal',
                width: '100px',
            }
        ];

        this.id = this.activatedRoute.snapshot.params['id'];

        this.reloadDetalles();
    }

    verManifiesto(idManifiesto: number) {
        const url = `${this.baseUrlMani}?idmanifiesto=${idManifiesto}`;
        window.open(url, '_blank');
    }
    verOt(idOrden: number) {
        const url = `${this.baseUrlOrde}?idorden=${idOrden}`;
        window.open(url, '_blank');
    }

    verOT(idordentrabajo: number) {
        this.router.navigate(['/seguimiento/verorden', idordentrabajo]);
    }

    verEventos(id) {
        this.traficoService.ListarOrdenesTransporte(id).subscribe((x) => {
            console.log(x);
            this.ordenes11 = x;
        });

        this.modalDetalleManifiesto = true;
    }

    reloadDetalles() {
        console.log('ID de Hoja de Ruta:', this.id);

        this.traficoService
            .getAllOrdersForHojaRuta(this.id)
            .subscribe((list) => {
                this.despachos = list;
                this.model.nombrechofer = this.despachos[0].chofer;
                this.model.numHojaRuta = this.despachos[0].numHojaRuta;
                this.model.placa = this.despachos[0].placa;
            });
    }
    crearOT(rowData: any): void {
    console.log('🟢 Redirigiendo a creación de OT:', rowData);

    // Redirige a la ruta deseada
    this.router.navigate(['/seguimientoot/crearot']);
  }

    cambiarEstado() {

        if (!this.selectedOTs || !this.selectedOTs.idordentrabajo) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Tráfico',
            detail: 'Debe seleccionar un manifiesto',
          });
          return;
        }



        
        const ids = this.selectedOTs.idordentrabajo.toString();

        this.ref = this.dialogService.open(CambiarEstadoModalLocalComponent, {
          header: 'Asignar Estado Local',
          width: '50%',
          contentStyle: { overflow: 'auto' },
          baseZIndex: 10000,
          data: { ids },
        });

        this.ref.onClose.subscribe(() => {
          this.reloadDetalles();
        });
    }

    reasignarPlaca() {
      if (!this.selectedOTs || !this.selectedOTs.idordentrabajo) {
        this.messageService.add({     
          severity: 'warn',
          summary: 'Tráfico',
          detail: 'Debe seleccionar un manifiesto',
        });
        return;
      }   



          const ref = this.dialogService.open(DialogReasignarMobileLocalComponent, {
              header: 'Reasignar Móvil',
              width: '400px',
              data: {
                placaActual: this.orden?.placa  // si ya tiene una asignada
              }
            });

            ref.onClose.subscribe((placaSeleccionada) => {
              if (placaSeleccionada) {
                console.log('Placa asignada:', placaSeleccionada);
                // 🔹 Aquí llamas a tu servicio para guardar la asignación
                // this.comercialService.asignarMovil(this.id, placaSeleccionada).subscribe(...)
              }
            });


    }
reprogramarArribos(): void {
  if (!this.selectedOTs || !this.selectedOTs.idordentrabajo) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Tráfico',
      detail: 'Debe seleccionar un manifiesto',
    });
    return;
  }

  const id = this.selectedOTs.idordentrabajo.toString();
  const horaProgramada = this.selectedOTs.horaProgramada; 


  this.ref = this.dialogService.open(DialogEtaLocalComponent, {
    header: 'Reprogramar cita',
    width: '50%',
    contentStyle: { overflow: 'auto' },
    baseZIndex: 10000,
     data: { id, horaProgramada }, 
  });

  this.ref.onClose.subscribe((result) => {
    if (result) {
      this.reloadDetalles();
      this.messageService.add({
        severity: 'success',
        summary: 'Tráfico',
        detail: 'Fechas actualizadas correctamente',
      });
    }
  });
}

}
