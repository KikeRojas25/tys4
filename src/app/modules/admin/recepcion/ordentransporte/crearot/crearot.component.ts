
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { User } from 'app/core/user/user.types';
import { OrdenTransporteService } from '../ordentransporte.service';
import { ToastModule } from 'primeng/toast'; 
import { PanelModule } from 'primeng/panel';
import { CheckboxModule } from 'primeng/checkbox';
import { CalendarModule } from 'primeng/calendar';
import { ChipsModule } from 'primeng/chips';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputMaskModule } from 'primeng/inputmask';
import { forkJoin } from 'rxjs';


@Component({
  selector: 'app-crearot',
  templateUrl: './crearot.component.html',
  styleUrls: ['./crearot.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIcon,
    RouterModule,
    DropdownModule,
    InputTextModule,
    ButtonModule,
    InputNumberModule,
    ToastModule ,
    PanelModule,
    CheckboxModule,
    CalendarModule,
    ChipsModule,
    DialogModule ,
    TableModule,
    ConfirmDialogModule ,
    ReactiveFormsModule,
    InputMaskModule 
  
  ],
  providers: [MessageService,ConfirmationService]
})
export class CrearotComponent implements OnInit {

  dialogGrr = false;
  dialogEtiqueta = false;
  es: any;
  public loading = false;
  guias: string[] = [];
  etiquetas: any[] = [];
  tipos = [
    { label: 'Paleta', value: 1 },
    { label: 'Bultos', value: 2 }
  ];
  

  clientes: SelectItem[] = [];
  tipounidad: SelectItem[] = [];
  mercaderiasEspeciales: SelectItem[] = [];
  ubigeo: SelectItem[] = [];
  vehiculos: SelectItem[] = [];
  formulas: SelectItem[] = [];
  conceptos: SelectItem[] = [];
  choferes: SelectItem[] = [];


  mismoremitente: boolean = false;
  mismodestinatario: boolean = false;

  dateInicio: Date = new Date(Date.now()) ;
  user: User ;
  IdNuevaOrden = 0;
  idordentrabajo: number;
  values: string[] = [];
  form: FormGroup;
  model: any = {};

  horacita: any;

  date: Date = new Date();
  settings = {
    bigBanner: true,
    timePicker: false,
    format: 'dd-MM-yyyy',
    defaultOpen: true
  };
  constructor(private ordenTransporteService: OrdenTransporteService
            , private confirmationService: ConfirmationService
            , private router: Router
            ,private fb: FormBuilder
            ,private messageService: MessageService
            , private activatedRoute: ActivatedRoute) { }


  ngOnInit() {

    this.form = this.fb.group({
      idcliente: [null, Validators.required],
      idremitente: [{ value: null, disabled: false }, Validators.required],
      iddestinatario: [{ value: null, disabled: false }, Validators.required],
      idorigen: [null, Validators.required],
      puntopartida: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(150)]],
      iddestino: [null, Validators.required],
      puntollegada: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(150)]],
      idvehiculo: [null, Validators.required],
      idchofer: [null, Validators.required],
      fecharecojo: [null,Validators.required],
      horarecojo: [null,Validators.required],
      guiarecojo: [null,Validators.required],
      bulto: [null, [Validators.min(0), Validators.max(5000)]],
      peso: [null, [Validators.min(0), Validators.max(30000)]],
      volumen: [null, [Validators.min(0), Validators.max(1000)]],
      pesovol: [null, [Validators.min(0), Validators.max(1000)]],
      idformula: [null, Validators.required],
      idtipotransporte: [null, Validators.required],
      idconceptocobro: [null, Validators.required],
      idtipomercaderia:[null, Validators.required],
      docgeneral:[null, Validators.required],
      descripciongeneral:[null, Validators.required],
      guiasremitente: [null, Validators.required],
    });


    this.user = JSON.parse(localStorage.getItem('user'));
  

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

   // Cargar los combos.
    this.cargarDropDows().then(() => {
     // this.realizarAsignaciones();
    });


    //this.idordentrabajo  = this.activatedRoute.snapshot.params["uid"];
    //console.log( this.activatedRoute.snapshot.params["uid"], 'params');

  //   this.ordenTransporteService.getOrden(this.idordentrabajo).subscribe(resp => {
  //     this.modeltemp = resp;
  //  })








  }
  realizarAsignaciones(): void {
    this.form.patchValue({ idcliente: 60
      , idorigen : 1
      , iddestino: 1389
      , puntopartida: 'Lima 123'
      , puntollegada: 'Piura 123'
      , idvehiculo: 28
      , idchofer: 14
      , fecharecojo : new Date()
      , horarecojo: '12:00'
      ,guiarecojo: ['123-123']
      , bulto : 1
      , peso : 12.2
      , pesovol: 2
      , volumen: 2
      , idformula : 8
      ,docgeneral : 'hola'
      , descripciongeneral: 'que es'
      , guiasremitente: ['12-2']

    });
    this.cargarDestinatario();

  }

  cargarDropDows(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Prepara todas las llamadas como observables
      const valorTabla4$ = this.ordenTransporteService.getValorTabla(4);
      const valorTabla16$ = this.ordenTransporteService.getValorTabla(16);
      const clientes$ = this.ordenTransporteService.getClientes(this.user.idscliente || '');
      const vehiculos$ = this.ordenTransporteService.getVehiculos('');
      const choferes$ = this.ordenTransporteService.getChoferes('');
      const ubigeo$ = this.ordenTransporteService.getUbigeo('');
  
      // Combina todas las llamadas en un forkJoin
      forkJoin({
        valorTabla4: valorTabla4$,
        valorTabla16: valorTabla16$,
        clientes: clientes$,
        vehiculos: vehiculos$,
        choferes: choferes$,
        ubigeo: ubigeo$
      }).subscribe({
        next: (result) => {
          // Procesa los resultados
          result.valorTabla4.forEach(element => {
            this.tipounidad.push({ value: element.idValorTabla, label: element.valor });
          });
  
          result.valorTabla16.forEach(element => {
            this.mercaderiasEspeciales.push({ value: element.idValorTabla, label: element.valor });
          });
  
          result.clientes.forEach(element => {
            this.clientes.push({ value: element.idCliente, label: element.razonSocial });
          });
  
          result.vehiculos.forEach(element => {
            this.vehiculos.push({ value: element.idVehiculo, label: element.placa });
          });
  
          result.choferes.forEach(element => {
            this.choferes.push({ 
              value: element.idChofer, 
              label: `DNI: ${element.dni} NOMBRE: ${element.nombreChofer} ${element.apellidoChofer}` 
            });
          });
  
          result.ubigeo.forEach(element => {
            this.ubigeo.push({ value: element.idDistrito, label: element.ubigeo });
          });
        },
        error: (err) => {
          console.error('Error al cargar los datos:', err);
          reject(err); // Rechaza la promesa en caso de error
        },
        complete: () => {
          console.log('Carga de dropdowns completada.');
          resolve(); // Resuelve la promesa al finalizar todas las llamadas
        }
      });
    });
  }
  
  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
   }

  registrar() {

   
    

    if (this.form.valid) {
     
      // Implementa la lógica de registro aquí.
      this.model = { 
        ...this.form.value, // Asignar todos los valores del formulario al modelo
        responsablecomercialid: this.user.id,
        tipoorden: 1,
        idestacionorigen: this.user.idestacionorigen,
        idusuarioregistro: this.user.id,
        etiquetas: [...this.etiquetas] // Agregar las etiquetas actualizadas al modelo  
    };


    console.log('model',this.model);

 
    this.confirmationService.confirm({
      message: '¿Esta seguro que desea registrar esta OT?',
      header: '',

      accept: () => {

         this.form.disable();



        this.ordenTransporteService.registrarOT(this.model).subscribe(resp => {

          console.log( 'respuesta',  resp);

          if(resp.validado) {

          

          this.messageService.add({ severity: 'success', summary: 'Registro exitoso', detail: `Se ha registrado correctamente la orden de transporte ${resp.numcp}`   });
        //  this.router.navigate(['/seguimientoot/listadoordentransporte']);


            var url =  `http://104.36.166.65/webreports/ot.aspx?idorden= ${resp.idordentrabajo}` ;
            window.open(url);


            
            var url =  `http://104.36.166.65/webreports/etiquetas.aspx?idorden= ${resp.idordentrabajo}` ;
            window.open(url);


         this.form.enable();
          
         this.model.precio = 0;
         this.form.patchValue({ 
         
           guiasremitente: []
           , bulto : 0
           , peso : 0
           , pesovol: 0
           , volumen: 0

    
        });
      }
      else {
        this.messageService.add({ severity: 'warn', summary: 'No registrado', detail: `Ocurrió un problema: ${resp.mensaje}`   });
        this.form.enable();
      }



       });
      }
  });

}
else {
  this.form.markAllAsTouched(); // Para mostrar los errores en todos los campos
  return ;
}




  }
  calcular() {

    this.model = { 
      ...this.form.value, // Asignar todos los valores del formulario al modelo
      responsablecomercialid: this.user.id,
      tipoorden: 3,
      idusuarioregistro: this.user.id
  };

    console.log(this.model,'para calcular');
    this.ordenTransporteService.calcularPrecio(this.model).subscribe(x => {
      this.model.precio = x;
      console.log(this.model.precio);
      if(this.model.precio === 0)
      {

        this.messageService.add({ severity: 'error', summary: 'Error en Tarifa', detail: 'No existe una tarifa asociada'});


        this.loading = false;
        return ;
      }
      if(this.model.precio === undefined)
      {
        this.messageService.add({ severity: 'error', summary: 'Error en Tarifa', detail: 'No existe una tarifa asociada'});
        this.loading = false;
        return ;
      }

      this.messageService.add({ severity: 'success', summary: 'Cálculo de tarifa exitoso', detail: `Se ha realizado el cálculo de manera correcta.` });
      this.loading = false;
    }, (error) => {
      this.loading = false;
      this.messageService.add({ severity: 'error', summary: 'Error en Tarifa', detail: 'Revise los datos seleccionados'});
    } );



  }

 cargarDestinatario() {
      //  this.model.idremitente =   this.model.idcliente ;
      //  this.model.iddestinatario =   this.model.idcliente ;

       this.mismoremitente = true;
       this.mismodestinatario = true;

       const idCliente = this.form.get('idcliente')?.value; // Obtener el valor del idcliente desde el formulario

       this.form.patchValue({
         idremitente: idCliente,      // Asignar el valor a idremitente
         iddestinatario: idCliente,    // Asignar el valor a iddestinatario
       });
   
       this.mismoremitente = true;
       this.mismodestinatario = true;
   
       this.cargarFormula(); // Llamar a la función que necesitas


    }

    cargarFormula() {

      const idCliente = this.form.get('idcliente')?.value; // Obtener el valor del idcliente desde el formulario
      const idDestino = this.form.get('iddestino')?.value; // Obtener el valor del idcliente desde el formulario
      const idOrigen = this.form.get('idorigen')?.value; // Obtener el valor del idcliente desde el formulario


      this.ordenTransporteService.getFormulas(idCliente,idOrigen, idDestino ).subscribe({
        next: response => {
          this.formulas = [];


          response.forEach(element => {
            this.formulas.push({ value: element.idFormula ,  label : element.formula  });
          });

          this.cargarConcepto();
  
        } 
      });

    }
  cargarConcepto() {


    
    const idCliente = this.form.get('idcliente')?.value; // Obtener el valor del idcliente desde el formulario
    const idDestino = this.form.get('iddestino')?.value; // Obtener el valor del idcliente desde el formulario
    const idOrigen = this.form.get('idorigen')?.value; // Obtener el valor del idcliente desde el formulario
    const idFormula = this.form.get('idformula')?.value; // Obtener el valor del idcliente desde el formulario
    const idTransporte = this.form.get('idtipotransporte')?.value; // Obtener el valor del idcliente desde el formulario


    this.ordenTransporteService.getConceptos(idCliente,idOrigen, idDestino
      ,idFormula, idTransporte ).subscribe({
      next: response => {
        this.conceptos = [];


        response.forEach(element => {
          this.conceptos.push({ value: element.idConceptoCobro ,  label : element.concepto  });
        });

      } 
    });
  }
  grr() {
    this.dialogGrr = true;
  }
  generarGrr(){

    
    const [prefix, initialNumber] = this.model.guiaInicial.split('-');
    const start = parseInt(initialNumber, 10);

    this.guias = [];
    for (let i = 0; i < this.model.cantidadguias; i++) {
      this.guias.push(`${prefix}-${start + i}`);
    }
  }

  agregaretiqueta() {

  if( this.model.idtipoetiqueta === 2) {
      this.model.etiqueta = 'Bulto';
  }
  else {
    this.model.etiqueta = 'Paleta';
  }


    this.etiquetas.push({ idtipoetiqueta: this.model.idtipoetiqueta, tipo: this.model.etiqueta , cantidad: this.model.cantidadetiqueta  });
  }

  eliminaretiqueta(index) {
    // Confirma que el índice es válido antes de eliminar
    if (index >= 0 && index < this.etiquetas.length) {
      this.etiquetas.splice(index, 1);
    }
  }

}
