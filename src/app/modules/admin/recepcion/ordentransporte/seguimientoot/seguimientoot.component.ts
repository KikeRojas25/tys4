import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { ConfirmationService, MenuItem, MessageService, SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { OrdenTransporte } from '../ordentransporte.types';
import { User } from 'app/core/user/user.types';
import { OrdenTransporteService } from '../ordentransporte.service';
import { Router } from '@angular/router';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { TimelineModule } from 'primeng/timeline';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputMaskModule } from 'primeng/inputmask';
import { FileModalComponent } from './modalfiles';
import { Clipboard } from '@angular/cdk/clipboard'; // opcional para copiar


interface EventItem {
  status?: string;
  dateRegister?: string;
  dateEvent?: string;
  icon?: string;
  color?: string;
  image?: string;
  user?: string;
}



type EventActionType =
  | 'ot-creada'
  | 'ot-planificada'
  | 'manifiesto-hr'
  | 'ot-despachada'
  | 'en-zona'
  | 'en-reparto'
  | 'entrega-ok'
  | 'none';

interface EventRow {
  dateRegister?: string | Date;
  dateEvent?: string | Date;
  user?: string;
  status?: string; // etiqueta visible (p.ej. "OT creada", "En Reparto", etc)
}


interface ActionConfig {
  type: EventActionType;
  title: string;
  payload?: any;
}


@Component({
  selector: 'app-seguimientoot',
  templateUrl: './seguimientoot.component.html',
  styleUrls: ['./seguimientoot.component.css'],
  standalone: true,
  imports: [ 
    FormsModule,
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    CheckboxModule,
    MatIcon,
    OverlayPanelModule ,
    DropdownModule,
    CalendarModule,
    DialogModule ,
    TimelineModule,
    ToastModule,
    ConfirmDialogModule,
    InputMaskModule
    
  ],
  providers: [
    ConfirmationService,
    DialogService,
    MessageService
  ]
})
export class SeguimientootComponent implements OnInit {

  clientes: SelectItem[] = [];
  ubigeo: SelectItem[] = [];
  estados: SelectItem[] = [];
  subestados: SelectItem[] = [];
  events: EventItem[];

  dialoglifecycle = false;
  dialogConfirm = false;

    ordenes: OrdenTransporte[] = [];
  ordenesFiltradas: OrdenTransporte[] = [];
  selected: OrdenTransporte[];
  loading: any;
  model: any = {};
  ProveedorLoaded = false;
  UbigeoLoaded = false;
  cols: any[];
  es: any;
  frozenCols: any[];
  user: User ;
  ref: DynamicDialogRef;
  dateInicio: Date = new Date(Date.now()) ;
  dateFin: Date = new Date(Date.now()) ;
  imageToShow: any;
  items: MenuItem[];
  estrafico= false;

  ordenTransporte: any = {};
  guias : any[] = [];
  
  estadosMap = {
    0: [0],
    1: [6], // "Por despachar" se mapea a "Pend. Programacion"
    2: [11, 13], // "Por entregar" se mapea a "En Ruta", "En Reparto" y "Entregado"
    3: [34,35], // "TODOS LOS ESTADOS" incluye todos
};

  // Subestados por tipo de entrega (cuando estado es "Entregado")
  // Usando SelectItem con los IDs del servidor
  // 5: Entrega: Conforme (OK)
  // 11: Entrega: Rechazo Parcial
  // 10: Entrega: Rechazo Total



  actionDialogVisible = false;
  currentAction: ActionConfig | null = null;


  constructor(private ordenTransporteService: OrdenTransporteService,
              public dialogService: DialogService,
              private router: Router,
              private confirmationService: ConfirmationService,
              public messageService: MessageService,
              private clipboard: Clipboard
              ) { }

  ngOnInit() {


  
  

    this.user = JSON.parse(localStorage.getItem('user'));

    console.log('xD', this.user);

        this.items = [
          {label: 'Update', icon: 'pi pi-refresh', command: () => {
            // this.update();
          }},
          {label: 'Delete', icon: 'pi pi-times', command: () => {
              // this.delete();
          }},
          {label: 'Angular.io', icon: 'pi pi-info', url: 'http://angular.io'},
          {separator: true},
          {label: 'Setup', icon: 'pi pi-cog', routerLink: ['/setup']}
      ];

    this.model.idusuario = this.user.usr_int_id;
    this.estrafico = this.user.estrafico;

     console.log('user',this.user);


    this.dateInicio.setDate((new Date()).getDate() - 7);
    this.dateFin.setDate((new Date()).getDate() );
    this.model.numcp = '';
    this.model.docreferencia = '';
    this.model.grr = '';
    this.model.nummanifiesto = '';
    this.model.numhojaruta = '';
    this.model.referencia = '';



    this.cols =
    [
        {header: 'ACC', field: 'numcp'  ,  width: '200px' },
        {header: 'OT', field: 'numcp'  ,  width: '100px' },
        {header: 'F. RECOJO', field: 'fecharegistro' , width: '120px'  },
        {header: 'F. DESPACHO', field: 'fecharegistro' , width: '120px'  },
        {header: 'F. ENTREGA', field: 'fecharegistro' , width: '120px'  },
        {header: 'CLIENTE', field: 'razonsocial'  ,  width: '180px'  },
        {header: 'DESTINATARIO', field: 'razonsocial'  ,  width: '180px'  },
        // {header: 'MANIFIESTO TRONCAL', field: 'razonsocial'  ,  width: '280px'  },
        // {header: 'HOJA DE RUTA TRONCAL ', field: 'razonsocial'  ,  width: '280px'  },
        {header: 'ESTACIÓN ACTUAL', field: 'razonsocial'  ,  width: '180px'  },
        {header: 'ESTADO', field: 'estado'  , width: '120px'   },
        {header: 'SUB-ESTADO', field: 'subestado'  , width: '120px'   },
        {header: 'INCIDENCIA ENTREGA', field: 'tipoentrega'  , width: '120px'   },
        {header: 'ORIGEN', field: 'estado'  , width: '120px'   },
        {header: 'DESTINO', field: 'estado'  , width: '120px'   },
        {header: 'SUB TOTAL', field: 'subtotal' , width: '80px'  },
        {header: 'MANIFIESTO', field: 'razonsocial'  ,  width: '120px'  },
        {header: 'HOJA DE RUTA', field: 'razonsocial'  ,  width: '120px'  },
        {header: 'CANT', field: 'cantidad'  ,  width: '80px'  },
        {header: 'PESO', field: 'peso'  ,  width: '80px'  },
        {header: 'VOL', field: 'pesovol'  ,  width: '80px'  }

     ];



      this.es = {
        firstDayOfWeek: 1,
        dayNames: [ 'domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado' ],
        dayNamesShort: [ 'dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb' ],
        dayNamesMin: [ 'D', 'L', 'M', 'X', 'J', 'V', 'S' ],
        monthNames: [ 'enero', 'febrero', 'marzo', 'abril',
        'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre' ],
        monthNamesShort: [ 'ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic' ],
        today: 'Hoy',
        clear: 'Borrar'
    };


    this.ordenTransporteService.getClientes(this.user.idscliente).subscribe(resp => {
        this.clientes.push({ value: 0,  label : 'TODOS LOS CLIENTES'});
        resp.forEach(element => {
            this.clientes.push({ value: element.idCliente ,  label : element.razonSocial});
          });

        this.ProveedorLoaded = true;
        this.model.idcliente = 0;
      });


    this.ordenTransporteService.getUbigeo('').subscribe(resp => {
        this.ubigeo.push({ value: 0,  label : 'TODOS LOS DESTINOS'});
        resp.forEach(element => {
            this.ubigeo.push({ value: element.idDistrito ,  label : element.ubigeo});
          });
        this.UbigeoLoaded = true;
        this.model.iddistrito = 0;
      }, error => {
      }, () => {
        this.buscar();
      });
    this.estados.push({ value: 0,  label : 'TODOS LOS ESTADOS'});
    this.estados.push({ value: 1, label: 'Por despachar' });
    this.estados.push({ value: 2, label: 'Por entregar' });
    this.estados.push({ value: 3, label: 'Entregado' });

    // Inicializar subestados vacío
    this.subestados.push({ value: null, label: 'TODOS LOS SUB-ESTADOS' });
    this.model.idsubestado = null;

    this.model.idestado = 0;



  }

  editar(id) {
    this.router.navigate(['/seguimientoot/editarot', id]);
  }
editarConfirm(id) {
  this.model.idordentrabajo = id;
  this.dialogConfirm = true;
}
  verguias(id) {
    this.router.navigate(['/seguimiento/verorden', id]);
  }

  save(info: string) {
    let resumen = '';
    this.selected.forEach(res => {
      resumen = resumen + ',' + res.idordentrabajo.toString();
     });
    this.router.navigate(['/seguimiento/asignarequipotransporte', resumen]);
  }

  eliminar(id) {

    this.confirmationService.confirm({
      message: '¿Esta seguro que desea elminar esta OT?',
      accept: () => {
        
        this.model.idusuarioregistro = this.user.id;
        this.model.idordentrabajo = id;
  
        this.ordenTransporteService.eliminar(this.model).subscribe(resp => {
  
          this.messageService.add({severity: 'success', summary: 'Orden Transporte ', detail: 'Se ha eliminado con éxito.'});
  
          this.buscar();
  
        });
      }
  });
  
  }
  buscar() {
      // Validar que el rango de fechas no exceda 2 meses
      if (this.dateInicio && this.dateFin) {
        const fechaInicio = new Date(this.dateInicio);
        const fechaFin = new Date(this.dateFin);
        
        // Calcular la diferencia en meses
        const mesesDiferencia = (fechaFin.getFullYear() - fechaInicio.getFullYear()) * 12 + 
                                (fechaFin.getMonth() - fechaInicio.getMonth());
        
        if (mesesDiferencia > 2) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Rango de fechas inválido',
            detail: 'El rango de búsqueda no puede exceder 2 meses. Por favor, ajuste las fechas.'
          });
          return; // Detener la búsqueda
        }
        
        // Validar que la fecha de inicio no sea mayor que la fecha de fin
        if (fechaInicio > fechaFin) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Rango de fechas inválido',
            detail: 'La fecha de inicio no puede ser mayor que la fecha de fin.'
          });
          return; // Detener la búsqueda
        }
      }

      // Guardar el valor original del estado y subestado antes de convertirlos
      const estadoOriginal = this.model.idestado;
      const subestadoOriginal = this.model.idsubestado;

      this.model.fecinicio = this.dateInicio;
      this.model.fecfin = this.dateFin;
      this.model.idusuario =  this.user.id;
      this.model.tipoorden = '';

      // Convertir el estado para la búsqueda en el servidor
      const estadoParaBusqueda = this.getEstadosParaBusqueda(this.model.idestado);
      this.model.idestado = estadoParaBusqueda;

      // El idsubestado ya se envía directamente al servidor (es el ID numérico)

      this.ordenTransporteService.getAllOrder(this.model).subscribe(list => {

        this.ordenes =  list;
        
        // Restaurar el valor original del estado después de la búsqueda
        this.model.idestado = estadoOriginal;
        
        // Recargar los subestados si el estado es "Entregado" (antes de restaurar el subestado)
        if (estadoOriginal === 3) {
          // Guardar el subestado antes de recargar
          const subestadoTemp = subestadoOriginal;
          this.onChangeEstado();
          // Restaurar el subestado después de recargar los subestados
          if (subestadoTemp !== null && subestadoTemp !== undefined) {
            const existeSubestado = this.subestados.some(s => s.value === subestadoTemp);
            if (existeSubestado) {
              this.model.idsubestado = subestadoTemp;
            } else {
              this.model.idsubestado = null;
            }
          }
        } else {
          // Restaurar el subestado solo si no es "Entregado"
          this.model.idsubestado = subestadoOriginal;
          // Limpiar subestados si no es "Entregado"
          this.subestados = [];
          this.subestados.push({ value: null, label: 'TODOS LOS SUB-ESTADOS' });
        }
        
        // Inicializar ordenesFiltradas con todas las órdenes
        this.ordenesFiltradas = [...list];

        console.log('ordenes:' , this.ordenes);


      });
  }


   eliminarFotos(id) {
    this.confirmationService.confirm({
      message: '¿Está seguro que desea eliminar las fotos de esta OT?',
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.ordenTransporteService.deleteFotos(id).subscribe(
          (resp) => {
            this.messageService.add({
              severity: 'success', 
              summary: 'Éxito', 
              detail: 'Las fotos se han eliminado correctamente.'
            });
            this.buscar();
          },
          (error) => {
            this.messageService.add({
              severity: 'error', 
              summary: 'Error', 
              detail: 'Ocurrió un error al eliminar las fotos. Por favor, intente nuevamente.'
            });
          }
        );
      },
      reject: () => {
        // Usuario canceló la acción
      }
    });
   }
   createImageFromBlob(image: Blob) {

    const reader = new FileReader();
    reader.addEventListener('load', () => {
       this.imageToShow = reader.result;
       console.log(reader.result);

    }, false);

    if(image) {
       reader.readAsDataURL(image);
    }
 }
 getEstadosParaBusqueda(valueSeleccionado: number): string {
  const estadosArray = this.estadosMap[valueSeleccionado] || [valueSeleccionado];
  return estadosArray.join(","); // Convierte el array a una cadena separada por comas
}

  // Método para cargar subestados cuando se selecciona "Entregado"
  onChangeEstado() {
    const subestadoAnterior = this.model.idsubestado; // Guardar el valor anterior (ID)
    this.subestados = [];
    
    if (this.model.idestado === 3) { // Estado "Entregado"
      this.subestados.push({ value: null, label: 'TODOS LOS SUB-ESTADOS' });
      
      // Agregar los tipos principales de entrega usando SelectItem con IDs
      // this.subestados.push({ value: 5, label: 'Entrega Perfecta' });      // ID: 5 - Entrega: Conforme (OK)
      // this.subestados.push({ value: 5, label: 'Entrega Sin Cargo' });    // ID: 5 - Entrega: Conforme (OK)
      this.subestados.push({ value: 11, label: 'Rechazo Parcial' });      // ID: 11 - Entrega: Rechazo Parcial
      // "No Entrega" puede corresponder a los IDs 10 y 34
      this.subestados.push({ value: '10,34', label: 'No Entrega' });     // IDs: 10 y 34 - No Entrega
      
      // Restaurar el subestado anterior si existe y es válido
      if (subestadoAnterior !== null && subestadoAnterior !== undefined) {
        const existeSubestado = this.subestados.some(s => s.value === subestadoAnterior);
        if (existeSubestado) {
          this.model.idsubestado = subestadoAnterior;
        } else {
          this.model.idsubestado = null;
        }
      }
    } else {
      this.subestados.push({ value: null, label: 'TODOS LOS SUB-ESTADOS' });
      this.model.idsubestado = null; // Solo resetear si no es "Entregado"
    }
  }

  // Método cuando cambia el subestado - ahora dispara nueva búsqueda al servidor
  onChangeSubEstado() {
    // Si hay órdenes cargadas, hacer nueva búsqueda con el filtro de subestado
    if (this.ordenes.length > 0) {
      this.buscar();
    }
  }


verot(idOrdenTrabajo) {

    const url = `http://104.36.166.65/webreports/ot.aspx?idorden=${idOrdenTrabajo}`;
    window.open(url, '_blank');
}
vermanifiesto(idmanifiesto) {
  var url = "http://104.36.166.65/webreports/manifiesto.aspx?idmanifiesto=" + String(idmanifiesto);
  window.open(url);
}

vernummanifiesto(nummanifiesto) {

   var idmanifiesto = nummanifiesto.split('-')[1];

  var url = "http://104.36.166.65/webreports/manifiesto.aspx?idmanifiesto=" + String(idmanifiesto);
  window.open(url);
}


verhojaruta(iddespacho) {

  var url = "http://104.36.166.65/webreports/hojaruta.aspx?iddespacho=" + String(iddespacho);
  window.open(url);
}
vertracking(idordentransporte: number) {


  this.ordenTransporteService.getEventos(idordentransporte).subscribe(list => {

    let eventos =  list;
    this.events = [];

    this.ordenTransporteService.getOrden(idordentransporte).subscribe(ot => {

      console.log('ot', ot);

      this.ordenTransporte  = ot.ordenTransporte;
      this.guias = ot.guias;


    this.dialoglifecycle = true;

   eventos.forEach(x => {
  this.events.push({ 
    status: x.evento,
    dateRegister: x.fechaRegistro,
    dateEvent: x.fechaEvento,
    user: x.usuario === 'ADMIN ADMIN' ? 'CHATBOT' : x.usuario,
    icon: 'pi pi-shopping-cart',
    color: '#9C27B0'
  });
});



  });


  });




}
getColor(status: string): string {
  switch (status) {
      case 'Pendiente':
          return 'orange'; // Color para eventos pendientes
      case 'Completado':
          return 'green'; // Color para eventos completados
      case 'Cancelado':
          return 'red'; // Color para eventos cancelados
      default:
          return 'gray'; // Color por defecto
  }
}

saveConfirm(){

  this.model.idestado = 3;
  this.model.idusuarioentrega =  this.user.id;
  this.model.idusuarioregistro =  this.user.id;
  this.model.personaentrega =  "Sello";
  this.model.dnientrega =  "12345678";
  
  this.ordenTransporteService.saveConfirm(this.model).subscribe(list => {

     this.dialogConfirm =  false;
      this.buscar();

      this.messageService.add({severity: 'success', summary: 'Orden Transporte ', detail: 'Se ha actualizado la fecha de entrega con éxito.'});

  });


}
unConfirm(){

  this.model.idestado = 3;
  this.model.idusuarioentrega =  this.user.id;
  this.model.idusuarioregistro =  this.user.id;
  this.model.personaentrega =  "Sello";
  this.model.dnientrega =  "12345678";


  
  this.confirmationService.confirm({
    message: '¿Esta seguro que desea desconfirmar esta OT?',
    accept: () => {
      
      
      this.ordenTransporteService.unConfirm(this.model).subscribe(list => {

        this.dialogConfirm =  false;
          this.buscar();

          this.messageService.add({severity: 'success', summary: 'Orden Transporte ', detail: 'Se ha desconfirmado la OT con éxito.'});
            


      });

  }


  });

}

  verarchivos(id) {

        const ref = this.dialogService.open(FileModalComponent, {
          header: 'Visor Fotos',
          width: '30%',
          data : {id }
      });
  }

  
  /** Normaliza el texto del estado para rutear acciones */
  private normalizeStatus(s?: string): EventActionType {
    const txt = (s || '').toLowerCase();

    if (txt.includes('ot creada') || (txt.includes('registr') && txt.includes('orden de transporte'))) return 'ot-creada';
    if (txt.includes('planificada')) return 'ot-planificada';
    if (txt.includes('manifiesto') || txt.includes('hoja ruta') || txt.includes('hr generado')) return 'manifiesto-hr';
    if (txt.includes('despachada')) return 'ot-despachada';
    if (txt.includes('en zona')) return 'en-zona';
    if (txt.includes('en reparto')) return 'en-reparto';
    if (txt.includes('entrega') && (txt.includes('conforme') || txt.includes('(ok)'))) return 'entrega-ok';

    return 'none';
  }
  /**
   * Abre el visor de adjuntos del evento (imágenes / documentos).
   * El comportamiento concreto se define por tipo de evento — se irá conectando
   * gradualmente. Por ahora solo loggea el tipo y la fila para identificar el caso.
   */
  verAdjuntosEvento(row: EventRow): void {
    const type = this.normalizeStatus(row.status);

    switch (type) {
      // Evento "Se registró la orden de transporte" → reporte de OT en webreports
      case 'ot-creada': {
        const idOrden = this.ordenTransporte?.idordentrabajo;
        if (!idOrden) {
          console.warn('[adjuntos] no hay idordentrabajo para abrir el reporte de OT');
          return;
        }
        window.open(`http://104.36.166.65/webreports/ot.aspx?idorden=${idOrden}`, '_blank');
        return;
      }

      // TODO: agregar el resto de tipos a medida que se vayan definiendo
      default:
        console.log('[adjuntos] tipo evento sin handler aún:', type, '| row:', row);
    }
  }

   /** Abre el diálogo con la acción acorde al evento */
  openEventAction(row: EventRow) {
    const type = this.normalizeStatus(row.status);


    console.log('Tipo de evento:', this.ordenTransporte, row);

    if(type === 'ot-creada') {


       const url = `http://104.36.166.65/webreports/ot.aspx?idorden=${this.ordenTransporte.idordentrabajo}`;
       window.open(url, '_blank');
       return;


    }
    else if(type === 'manifiesto-hr') {
      
        var url = "http://104.36.166.65/webreports/manifiesto.aspx?idmanifiesto=" + String(this.ordenTransporte.idManifiesto);
       window.open(url, '_blank');
       return;
    }
     else if(type === 'entrega-ok') {
      
         const ref = this.dialogService.open(FileModalComponent, {
          header: 'Visor Fotos',
          width: '30%',
          data : {id: this.ordenTransporte.idordentrabajo }
      });
      return;
    }

    const baseTitle = row.status || 'Acción';

    this.currentAction = {
      type,
      title: this.buildTitle(baseTitle, type),
      payload: { row, ot: this.ordenTransporte }
    };

    this.actionDialogVisible = true;
  }

  private buildTitle(base: string, type: EventActionType) {
    const map: Record<EventActionType, string> = {
      'ot-creada': 'Detalles de creación',
      'ot-planificada': 'Planificación',
      'manifiesto-hr': 'Manifiesto / Hoja de Ruta',
      'ot-despachada': 'Despacho',
      'en-zona': 'En Zona',
      'en-reparto': 'En Reparto',
      'entrega-ok': 'Entrega conforme',
      'none': base
    };
    return map[type] || base;
  }

  /** Ejecuta la acción específica dentro del diálogo */
  executeAction(action: string) {
    switch (action) {
      case 'view-basic':
        // Ejemplo: podrías abrir otro diálogo/sidepanel o navegar
        // this.router.navigate(['/ots', this.ordenTransporte.numcp]);
        console.log('Ver datos básicos de la OT', this.ordenTransporte);
        break;

      case 'view-plan':
        // Llamar servicio para traer asignaciones, mostrar otro dialog, etc.
        console.log('Ver planificación de la OT');
        break;

      case 'copy-manifiesto':
        if (this.ordenTransporte?.nummanifiesto) {
          this.clipboard.copy(this.ordenTransporte.nummanifiesto);
        }
        break;

      case 'open-hr':
        // Si tienes una URL/ID para la HR, ábrela:
        // window.open(this.getHojaRutaUrl(this.ordenTransporte.numhojaruta), '_blank');
        console.log('Abrir HR', this.ordenTransporte?.numhojaruta);
        break;

      case 'view-despacho':
        console.log('Mostrar tracking de despacho / eventos asociados');
        break;

      case 'open-map':
        // Abrir mapa (puedes lanzar un dialog con iframe de Google Maps)
        console.log('Abrir mapa: en zona');
        break;

      case 'contact-driver':
        console.log('Lógica para contactar repartidor');
        break;

      case 'open-pod':
        console.log('Abrir constancia (POD) si existe');
        break;

      case 'download-evidence':
        console.log('Descargar evidencias (fotos/firma) si existen');
        break;

      default:
        console.warn('Acción no implementada:', action);
        break;
    }
  }


}
