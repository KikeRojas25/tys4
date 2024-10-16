
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
  model: any = {};
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
  modeltemp : any = {};
  form: FormGroup;

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
      puntopartida2: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(150)]],
      iddestino: [null, Validators.required],
      puntollegada: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(150)]],
      idvehiculo: [null, Validators.required],
      idchofer: [null, Validators.required],
      fecharecojo: [null,Validators.required],
      grrchip: [[]],
      bulto: [null, [Validators.min(0), Validators.max(5000)]],
      peso: [null, [Validators.min(0), Validators.max(30000)]],
      volumen: [null, [Validators.min(0), Validators.max(1000)]],
      pesovol: [null, [Validators.min(0), Validators.max(1000)]],
      idformula: [null, Validators.required],
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
    this.cargarDropDows();


    //this.idordentrabajo  = this.activatedRoute.snapshot.params["uid"];
    //console.log( this.activatedRoute.snapshot.params["uid"], 'params');

  //   this.ordenTransporteService.getOrden(this.idordentrabajo).subscribe(resp => {
  //     this.modeltemp = resp;
  //  })








  }

  cargarDropDows() {


    this.user.idscliente === 'null' ? '': this.user.idscliente ;
    
    this.ordenTransporteService.getValorTabla(4).subscribe(resp => {
      resp.forEach(element => {
          this.tipounidad.push({ value: element.idValorTabla ,  label : element.valor});
        });
    });

    this.ordenTransporteService.getValorTabla(16).subscribe(resp => {
      resp.forEach(element => {
          this.mercaderiasEspeciales.push({ value: element.idValorTabla ,  label : element.valor});
        });
    });

    
    this.ordenTransporteService.getClientes(this.user.idscliente).subscribe({
      next: resp => {
        resp.forEach(element => {
          this.clientes.push({ value: element.idCliente ,  label : element.razonSocial});
        });

        this.model.idcliente = this.modeltemp.idcliente;
        this.model.idremitente =  this.modeltemp.idcliente ;
        this.model.iddestinatario =   this.modeltemp.idcliente ;
        // this.mismoremitente = true;
        // this.mismodestinatario = true;
      }

    }); 

    this.ordenTransporteService.getVehiculos('').subscribe({
      next: resp => {
        resp.forEach(element => {
          this.vehiculos.push({ value: element.idVehiculo ,  label : element.placa});
        });


      }
    });
    this.ordenTransporteService.getChoferes('').subscribe({
      next: resp => {
        resp.forEach(element => {
          this.choferes.push({ value: element.idChofer ,  label : `DNI: ${element.dni} NOMBRE: ${element.nombreChofer} ${element.apellidoChofer}` });
        });


      }
    })



    

  this.ordenTransporteService.getUbigeo('').subscribe(resp => {

    resp.forEach(element => {
        this.ubigeo.push({ value: element.idDistrito ,  label : element.ubigeo});
      });


  }, error => {

  }, () => {
    this.model.idorigen =   this.modeltemp.idorigen;
    this.model.iddestino =   this.modeltemp.iddestino;

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
      console.log(this.form.value);
      // Implementa la lógica de registro aquí.
    }
    else {
      this.form.markAllAsTouched(); // Para mostrar los errores en todos los campos
      return ;
    }

    this.confirmationService.confirm({
      message: '¿Esta seguro que desea registrar esta OT?',
      header: '',
      accept: () => {
        this.loading = true;
        this.model.responsablecomercialid = this.user.usr_int_id;
        this.model.tipoorden = 3;

        console.log(this.model, this.values, 'grabar')



     //   this.ordenTransporteService.registrarOTR(this.model,this.values).subscribe(resp => {

          this.messageService.add({ severity: 'success', summary: 'Registro exitoso', detail: `Se ha registrado correctamente la orden de transporte 100-763633` });
          this.router.navigate(['/seguimientoot/listadoordentransporte']);


       // });
      }
  });



  }
  calcular() {


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
       this.model.idremitente =   this.model.idcliente ;
       this.model.iddestinatario =   this.model.idcliente ;

       this.mismoremitente = true;
       this.mismodestinatario = true;



       this.cargarFormula();
    }

    cargarFormula() {


      this.ordenTransporteService.getFormulas(this.model.idcliente,this.model.idorigen, this.model.iddestino ).subscribe({
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
    this.ordenTransporteService.getConceptos(this.model.idcliente,this.model.idorigen, this.model.iddestino
                                    ,this.model.idformula, this.model.idtipotransporte ).subscribe({
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


    this.etiquetas.push({ idtipo: this.model.idtipoetiqueta, tipo: this.model.etiqueta , cantidad: this.model.cantidadetiqueta  });
  }



}
