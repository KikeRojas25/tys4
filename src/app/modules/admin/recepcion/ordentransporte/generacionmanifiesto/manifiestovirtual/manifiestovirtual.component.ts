import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DataViewModule } from 'primeng/dataview';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { OrderListModule } from 'primeng/orderlist';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { SidebarModule } from 'primeng/sidebar';
import { TableModule } from 'primeng/table';
import { TimelineModule } from 'primeng/timeline';
import { ToastModule } from 'primeng/toast';
import { OrdenTransporteService } from '../../ordentransporte.service';
import { TraficoService } from 'app/modules/admin/trafico/trafico.service';
import { DatePipe } from '@angular/common';
import { User } from 'app/core/user/user.types';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { thumbnailsDownIcon } from '@progress/kendo-svg-icons';

@Component({
  selector: 'app-manifiestovirtual',
  templateUrl: './manifiestovirtual.component.html',
  styleUrls: ['./manifiestovirtual.component.css'],
  standalone: true,
  imports: [ 
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
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
    SidebarModule,
    DataViewModule,
    ToastModule,
    OrderListModule,
    ConfirmDialogModule,
    InputNumberModule
    
  ],
  providers: [
    ConfirmationService,
    DialogService,
    MessageService,
    DatePipe
  ]
})
export class ManifiestovirtualComponent implements OnInit {
  manifiestoForm: FormGroup;
  hojasRuta: any[] = [];
  origenes: any[] = [];
  destinos: any[] = [];

  direcciones: any[] = [];



  ids: any;
  model: any = {};
  placas: SelectItem[] = [];
  conductores: SelectItem[] = [];
  ubigeo: SelectItem[] = [];

  ubigeoDestino: SelectItem[] = [];

  tiposoperacion: SelectItem[] = [];
  hojasruta: SelectItem[] = [];
  isNuevaHojaRuta: boolean = true;
  display: boolean = false;
  
  
  proveedores: SelectItem[] = [];

  proveedoresDestino: SelectItem[] = [];

  estadosMap = {
    0: [0],
    1: [6], // "Por despachar" se mapea a "Pend. Programacion"
    2: [11, 13], // "Por entregar" se mapea a "En Ruta", "En Reparto" y "Entregado"
    3: [34,35], // "TODOS LOS ESTADOS" incluye todos
};


  agencias: SelectItem[] = [];
  user: User;
  baseUrlHRu: string = 'http://104.36.166.65/webreports/hojaruta.aspx';


  constructor(private activatedRoute: ActivatedRoute,
    private ordenService: OrdenTransporteService,
    private traficoService: TraficoService,
    private datePipe: DatePipe,
    private messageService: MessageService,
    private confirmationService: ConfirmationService ,
    private router: Router,
  ) { }

  ngOnInit() {

    this.ids  = this.activatedRoute.snapshot.params['uid'];
    this.model.ids = this.ids;
    
    if (this.ids.startsWith(',')) {
         this.ids = this.ids.substring(1);
      }


    this.model.ots = this.ids;
    this.model.referencia = '';

    

    this.user = JSON.parse(localStorage.getItem('user'));
    this.model.IdUsuarioRegistro = this.user.id;



    this.ordenService.getValorTabla(23).subscribe(resp => {
      resp.forEach(element => {
        this.tiposoperacion.push({ value: element.idValorTabla ,  label : element.valor});
      });
    });

    this.traficoService.getProveedores("", 24669).subscribe(resp => {
      resp.forEach(element => {
        this.agencias.push({ value: element.idProveedor ,  label : element.razonSocial.toUpperCase() });
      });
    });
    
    this.ordenService.getHojasRuta(2).subscribe(resp => {

      console.log('hojas',resp);

      
      resp.forEach(element => {
        this.hojasRuta.push({ value: element.numHojaRuta ,  label : element.numHojaRuta});
      });

    });

    this.ordenService.getVehiculos('').subscribe({
      next: resp => {
        resp.forEach(element => {
          this.placas.push({ value: element.idVehiculo ,  label : element.placa});
        });


      }
    });


    this.ordenService.getChoferes('').subscribe({
      next: resp => {
        resp.forEach(element => {
          this.conductores.push({ value: element.idChofer ,  label : `DNI: ${element.dni} NOMBRE: ${element.nombreChofer} ${element.apellidoChofer}` });
        });


      }
    });


      this.traficoService.getProveedores("", 21514).subscribe(resp => {
        resp.forEach(element => {
          this.proveedores.push({ value: element.idProveedor ,  label : element.razonSocial  +   '-'   +    element.ruc});
        });
        this.proveedoresDestino = this.proveedores;
      });

      

  this.ordenService.getUbigeo('').subscribe(resp => {

    resp.forEach(element => {
        this.ubigeo.push({ value: element.idDistrito ,  label : element.ubigeo});
      });

    });

    this.ubigeoDestino =  this.ubigeo;


  }

  onSubmit() {
    if (this.manifiestoForm.valid) {
      // Implement your submission logic
      console.log(this.manifiestoForm.value);
    } else {
      console.log('Formulario inválido');
    }
  }
  onHojaRutaChange(event: any): void {
    // Si selecciona algo distinto a "Nueva Hoja de Ruta", ocultamos placa y conductor
    this.isNuevaHojaRuta = event.value === 'Nueva Hoja de Ruta';
  }

  // Función para verificar si el tipo de operación es 'Entrega a Tercero'
  

  // Función para verificar si el tipo de operación requiere 'Placa y Conductor'
  isLogisticaInversa(): boolean {
    return this.model.idtipoOperacion === 25085;
  }
  isEntregaTercero(): boolean {
    return this.model.idtipoOperacion === 18139;
  }
  
  isHojaRutaSeleccionada(): boolean {
    return this.model.hojaRutaSeleccionada !== null; // Asegúrate de tener un campo que indique si una hoja está seleccionada
  }


  showDialog() {
    
    if(this.model.fechasalida === undefined || this.model.fechasalida === null ) {
      this.messageService.add({ severity: 'info', summary: 'No puede continuar', detail: 'Ingrese una Fecha de salida' });
      return;
    }
    if (this.model.idtipoOperacion === undefined || this.model.idtipoOperacion === null) {
      this.messageService.add({ severity: 'info', summary: 'No puede continuar', detail: 'Seleccione un Tipo de Operación' });
      return;
    }

  // Validar origen
  if (this.model.idorigen === undefined || this.model.idorigen === null) {
    this.messageService.add({ severity: 'info', summary: 'No puede continuar', detail: 'Seleccione un Origen' });
    return;
  }

  // Validar destino
  if (this.model.idtipoOperacion !== 112){
      if(this.model.iddestino === undefined || this.model.iddestino === null) {
      this.messageService.add({ severity: 'info', summary: 'No puede continuar', detail: 'Seleccione un Destino' });
      return;
    }
  }
  

    this.display = true;
  }

  obtenerInformacion() {

    const tipoOperacionLabel = this.tiposoperacion.find(item => item.value === this.model.idtipoOperacion)?.label || 'Sin datos';
    // Formatear la fecha
    const fechaEnvioFormateada = this.datePipe.transform(this.model.fechasalida, 'dd/MM/yyyy') || 'Sin datos';

      // Buscar el label correspondiente al origen
  const origenLabel = this.ubigeo.find(item => item.value === this.model.idorigen)?.label || 'Sin datos';

  // Buscar el label correspondiente al destino
  const destinoLabel = this.ubigeo.find(item => item.value === this.model.iddestino)?.label || 'Sin datos';

  // Buscar el label correspondiente a la agencia
  const agenciaLabel = this.agencias.find(item => item.value === this.model.idagencia)?.label || 'Sin datos';



    return `
      Hoja de Ruta: ${this.model.numHojaRuta || 'Nueva Hoja de Ruta'}
      Tipo de Operación: ${tipoOperacionLabel}
      Fecha de Envío: ${fechaEnvioFormateada || 'Sin datos'}
      Origen: ${origenLabel|| 'Sin datos'}
      Destino: ${destinoLabel || 'Sin datos'}


      Peso: ${this.model.peso || 'Sin datos'}
      Bultos: ${this.model.bultos || 'Sin datos'}
      Precio: ${this.model.precio || 'Sin datos'}
      Consignado: ${this.model.consignado || 'Sin datos'}
      Agencia: ${agenciaLabel || 'Sin datos'}
   
    `;
  }

  generarmanifiesto() {
   


    
  this.confirmationService.confirm({
    message: '¿Está seguro que desea generar el manifiesto?',
    header: 'Generar',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
        
        this.ordenService.generarManifiesto(this.model).subscribe(resp => {

              console.log('generado',resp);

              this.messageService.add({ severity: 'success', summary: 'Generación de Manifiesto', detail: 'Se ha generado el manifiesto de manera correcta.' });
              
              var url = "http://104.36.166.65/webreports/manifiesto.aspx?idmanifiesto=" + String(resp.idManifiesto);
              window.open(url);


              const url2 = `${this.baseUrlHRu}?iddespacho=${resp.idDespacho}`;
              window.open(url2, '_blank');

              this.router.navigate(['/seguimiento/generacionmanifiestos']);

        });
      
      },
      reject: () => {

      }

    });


  }


  cargarProveedores() {

    this.proveedoresDestino = this.proveedores;

    this.model.IdDestinatario = null;

    this.traficoService.getProveedorxDireccion(this.model.iddestino ).subscribe(response =>  {
      console.log('bd',response.proveedores);


      this.direcciones = [];
      this.model.iddireccion = null;

      const proveedoresFiltered = this.proveedoresDestino.filter(c => 
          response.proveedores.some(p => p.idProveedor === c.value)
       );


      console.log('proveedores',proveedoresFiltered);


      if (proveedoresFiltered.length > 0) {
        this.proveedoresDestino = proveedoresFiltered; // Asigna solo los destinos válidos
      }
      else {
        this.messageService.add({ severity: 'warn', summary: 'Generación de Manifiesto', detail: 'El destino seleccionado no tiene proveedores asociados.' });
      }

    });
  }
  compararDestinos() {


    this.traficoService.getDireccionesProveedor(this.model.IdDestinatario ).subscribe(response=>  {


      this.direcciones = [];
      this.model.iddireccion = null;

      
      console.log('respuesta' ,  response.direcciones );
   
           

            response.direcciones.forEach(element => {
              this.direcciones.push({ value: element.iddireccion ,  label : element.direccion });
            });

      //  this.messageService.add({ severity: 'warn', summary: 'Generación de Manifiesto', detail: 'El destino del manifiesto no le corresponde al proveedor seleccionado.' });

       // this.ubigeoDestino

    });

     
  }
}
