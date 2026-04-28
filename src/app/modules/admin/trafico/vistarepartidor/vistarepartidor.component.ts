import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject, forkJoin, of } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TraficoService } from '../trafico.service';
import { TabViewModule } from 'primeng/tabview';
import { Manifiesto, OrdenTransporteProviderRecojoResult, User } from '../trafico.types';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CambiarEstadoModalComponent } from '../vistamanifiestos/modalcambiarestado';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { EntregarOtModalComponent } from './modalentregarOT';
import { OrdenTransporte } from '../../recepcion/ordentransporte/ordentransporte.types';
import { BadgeModule } from 'primeng/badge';
import { AsignartipooperacionComponent } from '../../planning/porprovincia/asignartipooperacion/asignartipooperacion.component';
import { AsignartipooperacionRutaComponent } from './asignartipooperacion/asignartipooperacionruta.component';
import { ModalReasignarRepartidorComponent } from './modal-reasignar-repartidor.component';

@Component({
  selector: 'app-vistarepartidor',
  templateUrl: './vistarepartidor.component.html',
  styleUrls: ['./vistarepartidor.component.css'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatIcon,
    RouterModule,
    TabViewModule,
    TableModule,
    ButtonModule,
    DialogModule,
    ToastModule,
    BadgeModule,
    ConfirmDialogModule
    
  ],
  providers: [
    DialogService ,
    MessageService,
    ConfirmationService
  ]
})
export class VistarepartidorComponent implements OnInit, OnDestroy {
  /** Códigos de estado usados en getAllOrdersxRepartidor / manifiestos. */
  private static readonly EST_RECEPCION_MANIFIESTO = 11;
  private static readonly EST_REPARTO              = 13;
  private static readonly EST_RECABAR_CARGO        = 34;
  private static readonly EST_ENVIAR_CARGO         = 35;
  private static readonly EST_NO_ENTREGADO         = 38;

  /** Flag global de recarga: el template puede mostrar spinner / disabled. */
  loading = false;

  private readonly destroy$ = new Subject<void>();

  modalDetalleManifiesto = false;
  repartidor: any = {};
  idproveedor: any;
  iddepartamento: any;
  idprovincia: number | null = null;
  cols1: any[];
  cols3: any[];
  cols4: any[];
  despachos: Manifiesto[] = [];
  // Se mapea a la misma estructura de las otras pestañas (numcp, fecharegistro, razonsocial, etc.)
  ordenesRecojo: any[] = [];
  user: User ;
  model: any = {};
  despachos1: any[] = [];
  ordenes: any[] = [];
  cols2: any[];

  cols6: any[];

  ref: DynamicDialogRef;

  ordenes2: OrdenTransporte[] = [];
  ordenes3: OrdenTransporte[] = [];
  ordenes4: OrdenTransporte[] = [];
  ordenes5: OrdenTransporte[] = [];
  ordenes6: OrdenTransporte[] = [];

  selectedOrdenes: OrdenTransporte[] = [];


  totalRecojo: number = 0;
  totalRecepcion: number = 0;
  totalReparto: number = 0;
  totalRecabarCargo: number = 0;
  totalEnviarCargo: number = 0;
  totalObservadas: number = 0;
  totalPendientesDespacho: number = 0;

  selectedManifiesto: any = {};
  selectedManifiestoRecojo: any = {};
  SelectedOrdenTransporte?: OrdenTransporte | undefined;
  selectedOrdenRecojo: any | null = null;

  constructor( private traficoService: TraficoService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public dialogService: DialogService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit() {
    
 this.cols1 = [
    { field: 'numcp', header: 'N° OT',  width: '20px'},
    {header: 'FECHA', field: 'fecharegistro'  , width: '60px'   },    
    {header: 'DESTINO', field: 'destino'  ,  width: '30px'  },
    {header: 'CLIENTE', field: 'razonsocial'  ,  width: '100px'  },
    {header: 'ESTADO', field: 'estado'  ,  width: '100px'  },
    {header: 'TIPO OP', field: 'tipooperacion'  ,  width: '100px'  },
    {header: 'BULTOS', field: 'bulto'  , width: '60px'   },
    {header: 'PESO', field: 'peso'  ,  width: '30px'  },
    {header: 'ACC.', field: 'acciones'  ,  width: '30px'  },
  
  ];

  this.cols2 = [
    { field: 'numcp', header: 'N° OT',  width: '40px'},
    {header: 'F. REC.', field: 'fecharegistro'  , width: '60px'   },
    {header: 'CLIENTE', field: 'razonsocial'  ,  width: '180px'  },
    {header: 'DEST.', field: 'destinatario'  , width: '180px'   },


    {header: 'F. ENT.', field: 'fecha_estado_actual'  ,  width: '90px'  },
    // {header: 'F. ENTREGA COMPROMETIDA', field: 'fechaentrega'  , width: '90px'   },
    // {header: 'Dif. Fechas', field: 'diferencia_fechas'  ,  width: '20px'  },

    {header: 'BULTOS', field: 'bulto'  , width: '30px'   },
    {header: 'PESO', field: 'peso'  ,  width: '30px'  },
    {header: 'ESTADO', field: 'destino'  ,  width: '30px'  },
    {header: 'ACCIONES', field: 'acciones'  ,  width: '20px'  },

  ];


 this.cols3 = [

  { field: 'numcp', header: 'OT',  width: '90px' },
  { field: 'estado', header: 'Estado', width: '120px' },
  { field: 'razonsocial', header: 'Razón Social', width: '220px' },
  { field: 'origen', header: 'Origen', width: '180px' },
  { field: 'puntorecojo', header: 'Punto Recojo', width: '90px' },
  { field: 'peso', header: 'Peso', width: '90px' },
  { field: 'bulto', header: 'Bulto', width: '80px' },
  { field: 'pesovol', header: 'PesoVol', width: '90px' },
  { field: 'volumen', header: 'Volumen', width: '90px' },
  { field: 'cliente', header: 'Cliente', width: '180px' },
  { field: 'fecharegistro', header: 'F. Reg.', width: '140px' },
  { field: 'fechahoracita', header: 'Cita Prog.', width: '160px' },
  { field: 'fechahoracitareal', header: 'Cita Real', width: '160px' },
  { header: 'Acc.', field: 'acciones', width: '70px' }

];

this.cols4 = [

  { field: 'numhojaruta', header: 'HR',  width: '120px'},
  { field: 'nummanifiesto', header: 'Manifiesto',  width: '120px'},
  {header: 'Destino', field: 'provincia'  , width: '200px'   },
  {header: 'Placa', field: 'agencia'  ,  width: '70px'  },
  {header: 'Proveedor', field: 'agenremi'  ,  width: '70px'  },
  {header: 'Chofer', field: 'agendesti'  ,  width: '70px'  },
  {header: 'F. DESP.', field: 'fecha_estado_actual'  ,  width: '70px'  },
  {header: 'Acc.', field: 'acciones'  ,  width: '30px'  }

];


this.cols6 = [
  { field: 'numcp', header: 'N° OTR',  width: '40px'},
  { field: 'numcp', header: 'N° OT Original',  width: '40px'},
  {header: 'F. REC.', field: 'fecharegistro'  , width: '60px'   },
  {header: 'CLIENTE', field: 'razonsocial'  ,  width: '180px'  },
  {header: 'DEST.', field: 'destinatario'  , width: '180px'   },


  {header: 'F. ENT.', field: 'fecha_estado_actual'  ,  width: '90px'  },
  // {header: 'F. ENTREGA COMPROMETIDA', field: 'fechaentrega'  , width: '90px'   },
  // {header: 'Dif. Fechas', field: 'diferencia_fechas'  ,  width: '20px'  },

  {header: 'BULTOS', field: 'bulto'  , width: '30px'   },
  {header: 'PESO', field: 'peso'  ,  width: '30px'  },
  {header: 'ESTADO', field: 'destino'  ,  width: '30px'  },
  {header: 'ACCIONES', field: 'acciones'  ,  width: '20px'  },

];

    // Ruta: /trafico/vistarepartidor/:idproveedor/:iddepartamento/:idprovincia
    // Fallback por compatibilidad (antes estaba como :id/:uid)
    const idprovParam =
      this.activatedRoute.snapshot.params['idproveedor'] ??
      this.activatedRoute.snapshot.params['id'];
    const iddepParam =
      this.activatedRoute.snapshot.params['iddepartamento'] ??
      this.activatedRoute.snapshot.params['uid'];


    const idprovParsed = Number(idprovParam);
    const iddepParsed = Number(iddepParam);




    this.idproveedor = Number.isFinite(idprovParsed) ? idprovParsed : idprovParam;
    this.iddepartamento = Number.isFinite(iddepParsed) ? iddepParsed : iddepParam;




    console.log('idprovincia', this.idprovincia);

    this.user = JSON.parse(localStorage.getItem('user'));
    this.model.idusuariocreacion = this.user.usr_int_id;

    this.reloadDetalles();

  

  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Recarga todos los paneles del repartidor en una sola pasada.
   * - Coordina las 8 llamadas con `forkJoin` → un único `loading` y resultado atómico.
   * - `catchError` por stream: una falla no bloquea las demás (devuelve fallback).
   * - `takeUntil(destroy$)` evita actualizar estado si el componente fue destruido.
   * - Resuelve la race-condition previa en `ordenes5` calculando la unión a partir
   *   de las 3 llamadas (estados 34, 35 y 38) ya resueltas.
   */
  reloadDetalles(): void {
    this.loading = true;
    const E = VistarepartidorComponent;

    // Helper: cualquier error en una stream → fallback (no rompe forkJoin)
    const safe = <T>(src: Observable<T>, fallback: T): Observable<T> =>
      src.pipe(catchError(() => of(fallback)));

    forkJoin({
      manifiestosRecepcion: safe(this.traficoService.getAllManifiestosForProvider(this.idproveedor, E.EST_RECEPCION_MANIFIESTO, this.iddepartamento), [] as Manifiesto[]),
      otsRecojo:            safe(this.traficoService.getAllOTsForProviderRecojo(this.idproveedor, this.iddepartamento), [] as OrdenTransporteProviderRecojoResult[]),
      reparto:              safe(this.traficoService.getAllOrdersxRepartidor(this.idproveedor, E.EST_REPARTO,         this.iddepartamento), [] as OrdenTransporte[]),
      recabarCargo:         safe(this.traficoService.getAllOrdersxRepartidor(this.idproveedor, E.EST_RECABAR_CARGO,   this.iddepartamento), [] as OrdenTransporte[]),
      enviarCargo:          safe(this.traficoService.getAllOrdersxRepartidor(this.idproveedor, E.EST_ENVIAR_CARGO,    this.iddepartamento), [] as OrdenTransporte[]),
      noEntregado:          safe(this.traficoService.getAllOrdersxRepartidor(this.idproveedor, E.EST_NO_ENTREGADO,    this.iddepartamento), [] as OrdenTransporte[]),
      logisticaInversa:     safe(this.traficoService.getOTRsLogisticaInversaxProveedor(this.idproveedor, this.iddepartamento), { success: false, data: [] as OrdenTransporte[], count: 0 } as any),
      proveedor:            safe(this.traficoService.getProveedor(this.idproveedor), null as any),
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (r) => {
        // Manifiestos en recepción
        this.despachos1     = r.manifiestosRecepcion ?? [];
        this.totalRecepcion = this.despachos1.length;

        // OTs de recojo (mapeo PascalCase → camelCase usado en el template)
        this.ordenesRecojo = (r.otsRecojo ?? []).map((x) => ({
          idordentrabajo:        x.idordentrabajo,
          numcp:                 x.numCp,
          idestado:              x.idEstado,
          estado:                x.estado,
          razonsocial:           x.razonSocial,
          fecharegistro:         x.fechaRegistro,
          puntorecojo:           x.puntoRecojo,
          origen:                x.origen,
          numhojaruta:           x.numHojaRuta,
          peso:                  x.peso,
          bulto:                 x.bulto,
          pesovol:               x.pesoVol,
          volumen:               x.volumen,
          cliente:               x.cliente,
          fechahoracita:         x.fechaHoraCita,
          fechahoracitafin:      x.fechaHoraCitaFin,
          fechahoracitareal:     x.fechaHoraCitaReal,
          fechahoracitafinreal:  x.fechaHoraCitaFinReal,
        }));
        this.totalRecojo = this.ordenesRecojo.length;

        // Reparto
        this.ordenes2     = r.reparto ?? [];
        this.totalReparto = this.ordenes2.length;

        // Recabar / enviar cargo
        this.ordenes3          = r.recabarCargo ?? [];
        this.totalRecabarCargo = this.ordenes3.length;
        this.ordenes4          = r.enviarCargo ?? [];
        this.totalEnviarCargo  = this.ordenes4.length;

        // Observadas: unión de los 3 estados (34 + 35 + 38) que tengan
        // tipoentrega definido y NO tengan una OTR (idotvinculada) ya generada.
        // Si la OT ya generó su OTR de logística inversa, deja de listarse aquí.
        const observada = (l: OrdenTransporte[]) => (l ?? []).filter(
          o => o.tipoentrega !== null && (o as any).idotvinculada == null,
        );
        this.ordenes5        = [...observada(r.recabarCargo), ...observada(r.enviarCargo), ...observada(r.noEntregado)];
        this.totalObservadas = this.ordenes5.length;

        // Logística inversa (OTRs pendientes de despacho)
        const inv = r.logisticaInversa as any;
        if (inv?.success && inv?.data) {
          this.ordenes6                = inv.data;
          this.totalPendientesDespacho = inv.count ?? inv.data.length;
        } else {
          this.ordenes6                = [];
          this.totalPendientesDespacho = 0;
        }

        // Datos del proveedor (cabecera)
        if (r.proveedor) {
          this.repartidor.nombre    = r.proveedor.razonSocial;
          this.repartidor.direccion = r.proveedor.direccion;
          this.repartidor.telefono  = r.proveedor.telefono;
          this.repartidor.ruc       = r.proveedor.ruc;
          this.repartidor.provincia = r.proveedor.distrito;
        }

        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo recargar los datos del repartidor' });
      },
    });
  }

  verEventos(id) {

    this.traficoService.ListarOrdenesTransporte(id).subscribe(x=> {
  
      console.log('detalle ots:',x);
      this.ordenes = x;
  
    });
  
  this.modalDetalleManifiesto = true;
  
  }

  cambiarEstadoRecojo(){


    console.log(this.selectedManifiestoRecojo);


    let ids  = ',' + this.selectedManifiestoRecojo.idManifiesto  ;
    if(this.selectedManifiestoRecojo  === undefined )
      {
       
        return ;
      }


    this.ref = this.dialogService.open(CambiarEstadoModalComponent, {
      header: 'Asignar Estado',
      width: '50%',
      contentStyle: {overflow: 'auto'},
      baseZIndex: 10000,
      data : {ids  }
  });

    this.ref.onClose.subscribe((product: any) => {

      this.reloadDetalles();
      return ;
    });

  }




  cambiarEstado(){

    console.log( 'Manifiesto Seleccionado:',this.selectedManifiesto);
    if (!this.selectedManifiesto || Object.keys(this.selectedManifiesto).length === 0) {
      this.messageService.add({
          severity: 'warn',
          summary: 'Proveedor de reparto',
          detail: 'Debe seleccionar al menos un manifiesto'
      });
      return;
  }
  
  
     

      let ids  = ',' + this.selectedManifiesto.idManifiesto  ;


    this.ref = this.dialogService.open(CambiarEstadoModalComponent, {
      header: 'Asignar Estado',
      width: '50%',
      contentStyle: {overflow: 'auto'},
      baseZIndex: 10000,
      data : {ids  }
  });

    this.ref.onClose.subscribe((product: any) => {

      this.reloadDetalles();
      return ;
    });

  }


  
modalEntregarOT() {

  const idorden = this.SelectedOrdenTransporte.idordentrabajo;
  const numcp = this.SelectedOrdenTransporte.numcp;
  
  
  const ref = this.dialogService.open(EntregarOtModalComponent, {
    header: 'Confirmar entrega',
    width: '50%',
    height: '550px',
    contentStyle: {'height': '550px', overflow: 'auto',  },
    data : { idorden, numcp }
  });
  ref.onClose.subscribe(() => {
  
    this.reloadDetalles();
  
  
  });
  
  
  
  
  }
  verOt(idOrdenTrabajo) {

    const url = `http://104.36.166.65/webreports/ot.aspx?idorden=${idOrdenTrabajo}`;
    window.open(url, '_blank');
}

  esEstadoParcial(rowData: any): boolean {
    const tipoEntrega = String(rowData?.tipoentrega ?? '').trim();
    return tipoEntrega.toLowerCase().includes('parcial');
  }

  accionOTRDesdeObservadas(rowData: any) {
    const idRaw = rowData?.idordentrabajo ?? rowData?.idOrdenTrabajo;
    const idotvinculada = Number(idRaw);

    if (!Number.isFinite(idotvinculada) || idotvinculada <= 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Crear OTR',
        detail: 'No se pudo obtener el ID de la OT para vincularla.'
      });
      return;
    }

    if (this.esEstadoParcial(rowData)) {
      this.router.navigate(['/trafico/nuevaotr'], {
        queryParams: { idotvinculada, idproveedor: this.idproveedor }
      });
      return;
    }

    // Default: mantener la generación automática actual (rechazados / no entrega, etc.)
    this.generarOTRLogisticaInversa(idotvinculada);
  }

  irANuevaOTRDesdeRecojo(rowData: any) {
    const idotvinculada = rowData?.idordentrabajo;
    if (!idotvinculada) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Crear OTR',
        detail: 'No se pudo obtener el ID de la OR para vincularla.'
      });
      return;
    }

    this.router.navigate(['/trafico/nuevaotr'], {
      // Enviar también el proveedor para que el endpoint pueda generar la OTR vinculada
      queryParams: { idotvinculada, idproveedor: this.idproveedor }
    });
  }

  abrirModalReasignarRepartidor(): void {
    const row = this.selectedOrdenRecojo;
    const idordentrabajo = Number(row?.idordentrabajo);
    if (!Number.isFinite(idordentrabajo) || idordentrabajo <= 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Pend. Recojo',
        detail: 'Seleccione una OT para cambiar de repartidor.',
      });
      return;
    }

    const numcp = String(row?.numcp ?? '').trim();

    const ref = this.dialogService.open(ModalReasignarRepartidorComponent, {
      header: `Cambiar repartidor${numcp ? ' - ' + numcp : ''}`,
      width: '520px',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      data: { idordentrabajo, numcp },
    });

    ref.onClose.subscribe((result: any) => {
      if (result?.success) {
        this.messageService.add({
          severity: 'success',
          summary: 'Pend. Recojo',
          detail: result?.message ?? 'Repartidor reasignado correctamente.',
        });
        this.selectedOrdenRecojo = null;
        this.reloadDetalles();
      }
    });
  }

  generarManifiestoVirtual(numcp: string) {
    if (!numcp) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Manifiesto Virtual',
        detail: 'No se pudo obtener el número de OTR'
      });
      return;
    }

    // Navegar a la ruta del manifiesto virtual con el número de OTR como parámetro
    this.router.navigate(['/seguimiento/manifiestovirtual', numcp]);
  }

  copiarDatosWhatsApp(tipoTab: string) {
    let textoFormateado = '';
    const fecha = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    
    textoFormateado += `📋 *REPORTE - ${tipoTab}*\n`;
    textoFormateado += `Fecha: ${fecha}\n`;
    textoFormateado += `Repartidor: ${this.repartidor.nombre || 'N/A'}\n`;
    textoFormateado += `────────────────────\n\n`;

    switch(tipoTab) {
      case 'Pend. Recepción':
        textoFormateado += this.formatearDatosRecepcion();
        break;
      case 'Pend. Recojo':
        textoFormateado += this.formatearDatosRecojo();
        break;
      case 'O.T. en Reparto':
        textoFormateado += this.formatearDatosReparto();
        break;
      case 'Pend. Recabar Cargo':
        textoFormateado += this.formatearDatosRecabarCargo();
        break;
      case 'Pend. Envio Cargo':
        textoFormateado += this.formatearDatosEnviarCargo();
        break;
      case 'Observadas':
        textoFormateado += this.formatearDatosObservadas();
        break;
      case 'Pend. Despacho':
        textoFormateado += this.formatearDatosPendientesDespacho();
        break;
      default:
        textoFormateado += 'No hay datos disponibles';
    }

    this.copiarAlPortapapeles(textoFormateado);
  }

  formatearDatosRecepcion(): string {
    if (!this.despachos1 || this.despachos1.length === 0) {
      return 'No hay datos de recepción pendientes.\n';
    }

    let texto = `*Total: ${this.despachos1.length} registro(s)*\n\n`;
    this.despachos1.forEach((item, index) => {
      texto += `${index + 1}. *HR:* ${item.numHojaRuta || 'N/A'}\n`;
      texto += `   *Manifiesto:* ${item.numManifiesto || 'N/A'}\n`;
      texto += `   *Destino:* ${item.destino || 'N/A'}\n`;
      texto += `   *Placa:* ${item.placa || 'N/A'}\n`;
      texto += `   *Proveedor:* ${item.proveedor || 'N/A'}\n`;
      texto += `   *Chofer:* ${item.chofer || 'N/A'}\n`;
      texto += `   *F. Despacho:* ${item.fechaDespacho ? new Date(item.fechaDespacho).toLocaleDateString('es-PE') : 'N/A'}\n`;
      texto += `\n`;
    });
    return texto;
  }

  formatearDatosRecojo(): string {
    if (!this.despachos || this.despachos.length === 0) {
      return 'No hay datos de recojo pendientes.\n';
    }

    let texto = `*Total: ${this.despachos.length} registro(s)*\n\n`;
    this.despachos.forEach((item: any, index) => {
      texto += `${index + 1}. *HR:* ${item.numHojaRuta || 'N/A'}\n`;
      texto += `   *Manifiesto:* ${item.numManifiesto || 'N/A'}\n`;
      texto += `   *Destino:* ${item.destino || 'N/A'}\n`;
      texto += `   *Agencia:* ${item.agencia || 'N/A'}\n`;
      texto += `   *Remitente:* ${item.remitente || 'N/A'}\n`;
      texto += `   *Consignado:* ${item.consignadoagencia || 'N/A'}\n`;
      texto += `   *F. Despacho:* ${item.fechaDespacho ? new Date(item.fechaDespacho).toLocaleDateString('es-PE') : 'N/A'}\n`;
      texto += `   *Clave:* ${item.claveagencia || 'N/A'}\n`;
      texto += `   *Remito:* ${item.nroremito || 'N/A'}\n`;
      texto += `   *Costo:* S/. ${item.costoenvio || '0.00'}\n`;
      texto += `\n`;
    });
    return texto;
  }

  formatearDatosReparto(): string {
    if (!this.ordenes2 || this.ordenes2.length === 0) {
      return 'No hay órdenes en reparto.\n';
    }

    let texto = `*Total: ${this.ordenes2.length} orden(es)*\n\n`;
    this.ordenes2.forEach((item, index) => {
      texto += `${index + 1}. *N° OT:* ${item.numcp || 'N/A'}\n`;
      texto += `   *F. Recojo:* ${item.fecharegistro ? new Date(item.fecharegistro).toLocaleDateString('es-PE') : 'N/A'}\n`;
      texto += `   *Cliente:* ${item.razonsocial || 'N/A'}\n`;
      texto += `   *Destinatario:* ${item.destinatario || 'N/A'}\n`;
      texto += `   *F. Entrega:* ${item.fechaentregareparto ? new Date(item.fechaentregareparto).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}\n`;
      texto += `   *Bultos:* ${item.bulto || '0'}\n`;
      texto += `   *Peso:* ${item.peso || '0'} kg\n`;
      texto += `   *Estado:* ${item.estado || 'N/A'}\n`;
      texto += `\n`;
    });
    return texto;
  }

  formatearDatosRecabarCargo(): string {
    if (!this.ordenes3 || this.ordenes3.length === 0) {
      return 'No hay órdenes pendientes de recabar cargo.\n';
    }

    let texto = `*Total: ${this.ordenes3.length} orden(es)*\n\n`;
    this.ordenes3.forEach((item, index) => {
      texto += `${index + 1}. *N° OT:* ${item.numcp || 'N/A'}\n`;
      texto += `   *F. Recojo:* ${item.fecharegistro ? new Date(item.fecharegistro).toLocaleDateString('es-PE') : 'N/A'}\n`;
      texto += `   *Cliente:* ${item.razonsocial || 'N/A'}\n`;
      texto += `   *Destinatario:* ${item.destinatario || 'N/A'}\n`;
      texto += `   *F. Entrega:* ${item.fechaentregareparto ? new Date(item.fechaentregareparto).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}\n`;
      texto += `   *Bultos:* ${item.bulto || '0'}\n`;
      texto += `   *Peso:* ${item.peso || '0'} kg\n`;
      texto += `   *Estado:* ${item.estado || 'N/A'}\n`;
      texto += `\n`;
    });
    return texto;
  }

  formatearDatosEnviarCargo(): string {
    if (!this.ordenes4 || this.ordenes4.length === 0) {
      return 'No hay órdenes pendientes de enviar cargo.\n';
    }

    let texto = `*Total: ${this.ordenes4.length} orden(es)*\n\n`;
    this.ordenes4.forEach((item, index) => {
      texto += `${index + 1}. *N° OT:* ${item.numcp || 'N/A'}\n`;
      texto += `   *F. Recojo:* ${item.fecharegistro ? new Date(item.fecharegistro).toLocaleDateString('es-PE') : 'N/A'}\n`;
      texto += `   *Cliente:* ${item.razonsocial || 'N/A'}\n`;
      texto += `   *Destinatario:* ${item.destinatario || 'N/A'}\n`;
      texto += `   *F. Entrega:* ${item.fechaentregareparto ? new Date(item.fechaentregareparto).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}\n`;
      texto += `   *Bultos:* ${item.bulto || '0'}\n`;
      texto += `   *Peso:* ${item.peso || '0'} kg\n`;
      texto += `   *Estado:* ${item.estado || 'N/A'}\n`;
      texto += `\n`;
    });
    return texto;
  }

  formatearDatosObservadas(): string {
    if (!this.ordenes5 || this.ordenes5.length === 0) {
      return 'No hay órdenes observadas.\n';
    }

    let texto = `*Total: ${this.ordenes5.length} orden(es)*\n\n`;
    this.ordenes5.forEach((item, index) => {
      texto += `${index + 1}. *N° OT:* ${item.numcp || 'N/A'}\n`;
      texto += `   *F. Recojo:* ${item.fecharegistro ? new Date(item.fecharegistro).toLocaleDateString('es-PE') : 'N/A'}\n`;
      texto += `   *Cliente:* ${item.razonsocial || 'N/A'}\n`;
      texto += `   *Destinatario:* ${item.destinatario || 'N/A'}\n`;
      texto += `   *F. Entrega:* ${item.fechaentregareparto ? new Date(item.fechaentregareparto).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}\n`;
      texto += `   *Bultos:* ${item.bulto || '0'}\n`;
      texto += `   *Peso:* ${item.peso || '0'} kg\n`;
      texto += `   *Tipo Entrega:* ${item.tipoentrega || 'N/A'}\n`;
      texto += `\n`;
    });
    return texto;
  }

  formatearDatosPendientesDespacho(): string {
    if (!this.ordenes6 || this.ordenes6.length === 0) {
      return 'No hay OTRs pendientes de despacho.\n';
    }

    let texto = `*Total: ${this.ordenes6.length} OTR(s)*\n\n`;
    this.ordenes6.forEach((item: any, index) => {
      texto += `${index + 1}. *N° OTR:* ${item.numCp || item.numcp || 'N/A'}\n`;
      texto += `   *N° OT Original:* ${item.numCpOtOriginal || item.numcpOtOriginal || 'N/A'}\n`;
      texto += `   *F. Recojo:* ${item.fecharegistro ? new Date(item.fecharegistro).toLocaleDateString('es-PE') : 'N/A'}\n`;
      texto += `   *Cliente:* ${item.razonsocial || 'N/A'}\n`;
      texto += `   *Destinatario:* ${item.destinatario || 'N/A'}\n`;
      texto += `   *F. Entrega:* ${item.fechaentregareparto ? new Date(item.fechaentregareparto).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}\n`;
      texto += `   *Bultos:* ${item.bulto || '0'}\n`;
      texto += `   *Peso:* ${item.peso || '0'} kg\n`;
      texto += `   *Estado:* ${item.estado || 'N/A'}\n`;
      texto += `\n`;
    });
    return texto;
  }

  copiarAlPortapapeles(texto: string) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto).then(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Copiado',
          detail: 'Los datos han sido copiados al portapapeles. Puedes pegarlos en WhatsApp.'
        });
      }).catch(err => {
        console.error('Error al copiar:', err);
        this.copiarFallback(texto);
      });
    } else {
      this.copiarFallback(texto);
    }
  }

  copiarFallback(texto: string) {
    const textarea = document.createElement('textarea');
    textarea.value = texto;
    textarea.style.position = 'fixed';
    textarea.style.left = '-999999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      this.messageService.add({
        severity: 'success',
        summary: 'Copiado',
        detail: 'Los datos han sido copiados al portapapeles. Puedes pegarlos en WhatsApp.'
      });
    } catch (err) {
      console.error('Error al copiar:', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo copiar al portapapeles. Por favor, copia manualmente.'
      });
    } finally {
      document.body.removeChild(textarea);
    }
  }

  generarOTRLogisticaInversa(idOrdenTrabajo: number) {
    if (!idOrdenTrabajo) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Generar OTR',
        detail: 'No se pudo obtener el ID de la orden de trabajo'
      });
      return;
    }

    // Obtener el usuario del localStorage si no está inicializado
    if (!this.user) {
      this.user = JSON.parse(localStorage.getItem('user'));
    }

    const idUsuario = this.user?.id;
    if (!idUsuario) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Generar OTR',
        detail: 'No se pudo obtener el ID del usuario'
      });
      return;
    }

    // Mostrar diálogo de confirmación
    this.confirmationService.confirm({
      message: '¿Está seguro que desea generar una OTR de logística inversa?',
      header: 'Confirmar Generación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        this.traficoService.generarOTRLogisticaInversa(idOrdenTrabajo, idUsuario).subscribe({
          next: (response) => {
            if (response.success) {
              const numcpOTR = response.otrLogisticaInversa?.numcp || 'N/A';
              this.messageService.add({
                severity: 'success',
                summary: 'OTR Generada',
                detail: `Se ha generado una OTR de logística inversa correctamente. Número: ${numcpOTR}`
              });
              // Recargar los detalles después de generar la OTR
              this.reloadDetalles();
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Generar OTR',
                detail: response.message || 'Error al generar la OTR de logística inversa'
              });
            }
          },
          error: (error) => {
            console.error('Error al generar OTR:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Generar OTR',
              detail: error.error?.message || 'Error al generar la OTR de logística inversa'
            });
          }
        });
      }
    });
  }
 asignarTipoOperacion() {
  if (!this.selectedManifiesto || !this.selectedManifiesto.idManifiesto) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Proveedor de reparto',
      detail: 'Debe seleccionar al menos un manifiesto'
    });
    return;
  }

  this.traficoService.ListarOrdenesTransporte(this.selectedManifiesto.idManifiesto).subscribe(x => {
    console.log('ordenes:', x);
    this.ordenes = x;

    // Concatenar los idOrdenTrabajo separados por coma
    const ids = this.ordenes.map(m => m.idOrdenTrabajo).join(',');
    console.log('ids', ids);

    this.ref = this.dialogService.open(AsignartipooperacionRutaComponent, {
      header: 'Reasignar Tipo de Operación',
      width: '60%',
      contentStyle: { 'max-height': '450px', overflow: 'auto' },
      baseZIndex: 10000,
      data: { ids }
    });

    this.ref.onClose.subscribe((response: any) => {
      // Si se canceló, no hacer nada
      if (response?.cancelado) {
        return;
      }

      console.log('respuesta', response);
      this.reloadDetalles();

      // Solo mostrar mensaje si hay una respuesta válida (no cancelado)
      if (response && !response.error) {
        this.messageService.add({
          severity: 'success',
          summary: 'Planning',
          detail: 'Se ha asignado el tipo de operación de manera correcta.'
        });
      } else if (response?.error) {
        this.messageService.add({
          severity: 'error',
          summary: 'Planning',
          detail: 'Hubo un error en la asignación de tipo de operación.'
        });
      }
    });
  });
}
asignarTipoOperacionxOt() {
  if (!this.selectedOrdenes || this.selectedOrdenes.length === 0) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Proveedor de reparto',
      detail: 'Debe seleccionar al menos una OT'
    });
    return;
  }
    this.ordenes = this.selectedOrdenes;

    // Concatenar los idOrdenTrabajo separados por coma (para Manifiesto)
    const ids = this.ordenes.map(m => m.idOrdenTrabajo).join(',');
    console.log('ids', ids);

    this.ref = this.dialogService.open(AsignartipooperacionRutaComponent, {
      header: 'Reasignar Tipo de Operación (Manifiesto)',
      width: '60%',
      contentStyle: { 'max-height': '450px', overflow: 'auto' },
      baseZIndex: 10000,
      data: { ids }
    });

    this.ref.onClose.subscribe((response: any) => {
      // Si se canceló, no hacer nada
      if (response?.cancelado) {
        return;
      }

      console.log('respuesta', response);
      this.reloadDetalles();

      // Solo mostrar mensaje si hay una respuesta válida (no cancelado)
      if (response && !response.error) {
        this.messageService.add({
          severity: 'success',
          summary: 'Planning',
          detail: 'Se ha asignado el tipo de operación de manera correcta.'
        });
      } else if (response?.error) {
        this.messageService.add({
          severity: 'error',
          summary: 'Planning',
          detail: 'Hubo un error en la asignación de tipo de operación.'
        });
      }
    });
  
}

asignarTipoOperacionxOtMasivo() {
  if (!this.selectedOrdenes || this.selectedOrdenes.length === 0) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Proveedor de reparto',
      detail: 'Debe seleccionar al menos una OT'
    });
    return;
  }

  // Obtener todos los IDs de las OT seleccionadas
  const idsOrdenTrabajo: number[] = [];
  this.selectedOrdenes.forEach(orden => {
    const idOrdenTrabajo = (orden as any).idOrdenTrabajo || orden.idordentrabajo;
    if (idOrdenTrabajo) {
      idsOrdenTrabajo.push(idOrdenTrabajo);
    }
  });

  if (idsOrdenTrabajo.length === 0) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Proveedor de reparto',
      detail: 'No se encontraron IDs válidos en las OT seleccionadas'
    });
    return;
  }

  // Convertir a string separado por comas para el componente (formato: ,id1,id2,id3)
  const idsString = ',' + idsOrdenTrabajo.join(',');

  // Abrir modal para procesar todas las OT masivamente
  this.ref = this.dialogService.open(AsignartipooperacionRutaComponent, {
    header: `Reasignar Tipo de Operación (${idsOrdenTrabajo.length} OT seleccionada${idsOrdenTrabajo.length > 1 ? 's' : ''})`,
    width: '60%',
    contentStyle: { 'max-height': '450px', overflow: 'auto' },
    baseZIndex: 10000,
    data: { ids: idsString }
  });

  this.ref.onClose.subscribe((response: any) => {
    // Si se canceló, no hacer nada
    if (response?.cancelado) {
      return;
    }

    console.log('Respuesta procesamiento masivo:', response);
    this.reloadDetalles();

    // Solo mostrar mensaje si hay una respuesta válida (no cancelado)
    if (response && !response.error) {
      this.messageService.add({
        severity: 'success',
        summary: 'Planning',
        detail: `Se ha asignado el tipo de operación a ${idsOrdenTrabajo.length} OT(s) correctamente.`
      });
    } else if (response?.error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Planning',
        detail: 'Hubo un error en la asignación de tipo de operación.'
      });
    }
  });
}

asignarTipoOperacionxOtIndividualDesdeFila(orden: any) {
  if (!orden) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Proveedor de reparto',
      detail: 'No se pudo obtener la información de la OT'
    });
    return;
  }

  // El objeto puede tener idOrdenTrabajo (del servicio) o idordentrabajo (de la interfaz)
  const idOrdenTrabajo = (orden as any).idOrdenTrabajo || orden.idordentrabajo;
  if (!idOrdenTrabajo) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Proveedor de reparto',
      detail: 'La OT no tiene un ID válido'
    });
    return;
  }

  this.abrirModalAsignarTipoOperacionOt(idOrdenTrabajo);
}

private abrirModalAsignarTipoOperacionOt(idOrdenTrabajo: number) {
  console.log('idOrdenTrabajo individual', idOrdenTrabajo);

  // Formato requerido: ,id (con coma al inicio)
  const idsString = ',' + idOrdenTrabajo;

  this.ref = this.dialogService.open(AsignartipooperacionRutaComponent, {
    header: 'Reasignar Tipo de Operación (OT Individual)',
    width: '60%',
    contentStyle: { 'max-height': '450px', overflow: 'auto' },
    baseZIndex: 10000,
    data: { ids: idsString }
  });

  this.ref.onClose.subscribe((response: any) => {
    // Si se canceló, no hacer nada
    if (response?.cancelado) {
      return;
    }

    console.log('respuesta', response);
    this.reloadDetalles();

    // Solo mostrar mensaje si hay una respuesta válida (no cancelado)
    if (response && !response.error) {
      this.messageService.add({
        severity: 'success',
        summary: 'Planning',
        detail: 'Se ha asignado el tipo de operación de manera correcta.'
      });
    } else if (response?.error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Planning',
        detail: 'Hubo un error en la asignación de tipo de operación.'
      });
    }
  });
}

}