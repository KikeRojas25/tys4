import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { User } from 'app/core/user/user.types';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { ChipsModule } from 'primeng/chips';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService } from 'primeng/dynamicdialog';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { forkJoin } from 'rxjs';
import { OrdenTransporteService } from '../ordentransporte.service';

@Component({
  selector: 'app-editarot',
  templateUrl: './editarot.component.html',
  styleUrls: ['./editarot.component.css'],
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
    providers: [
      ConfirmationService,
      DialogService,
      MessageService
    ]
})
export class EditarotComponent implements OnInit {

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
  ubigeos: SelectItem[] = [];
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
              this.user = JSON.parse(localStorage.getItem('user'));
              this.idordentrabajo = this.activatedRoute.snapshot.params.uid;
            
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
                fecharecojo: [null, Validators.required],
                horarecojo: [null, Validators.required],
                guiarecojo: [[]],
                bulto: [null, [Validators.min(0), Validators.max(5000)]],
                peso: [null, [Validators.min(0), Validators.max(100000)]],
                volumen: [null, [Validators.min(0), Validators.max(100000)]],
                pesovol: [null, [Validators.min(0), Validators.max(100000)]],
                idformula: [null, Validators.required],
                idtipotransporte: [null, Validators.required],
                idconceptocobro: [null, Validators.required],
                idtipomercaderia: [null, Validators.required],
                docgeneral: [null, Validators.required],
                descripciongeneral: [null, Validators.required],
                guiasremitente: [null, Validators.required],
              });
            
              const loadDropdowns$ = forkJoin({
                tipoUnidad: this.ordenTransporteService.getValorTabla(4),
                mercaderiasEspeciales: this.ordenTransporteService.getValorTabla(16),
                clientes: this.ordenTransporteService.getClientes(this.user.idscliente || ''),
                vehiculos: this.ordenTransporteService.getVehiculos(''),
                choferes: this.ordenTransporteService.getChoferes(''),
                ubigeo: this.ordenTransporteService.getUbigeo(''),
              });

              this.form.get('idcliente')?.valueChanges.subscribe(() => this.cargarFormula());
                this.form.get('idorigen')?.valueChanges.subscribe(() => this.cargarFormula());
                this.form.get('iddestino')?.valueChanges.subscribe(() => this.cargarFormula());



                this.form.get('idcliente')?.valueChanges.subscribe(() => this.cargarConcepto());
                this.form.get('idorigen')?.valueChanges.subscribe(() => this.cargarConcepto());
                this.form.get('iddestino')?.valueChanges.subscribe(() => this.cargarConcepto());
                this.form.get('idformula')?.valueChanges.subscribe(() => this.cargarConcepto());
                this.form.get('idtipotransporte')?.valueChanges.subscribe(() => this.cargarConcepto());


            
              loadDropdowns$.subscribe({
                next: ({ tipoUnidad, mercaderiasEspeciales, clientes, vehiculos, choferes, ubigeo }) => {
                  this.tipounidad = tipoUnidad.map(element => ({ value: element.idValorTabla, label: element.valor }));
                  this.mercaderiasEspeciales = mercaderiasEspeciales.map(element => ({ value: element.idValorTabla, label: element.valor }));
                  this.clientes = clientes.map(element => ({ value: element.idCliente, label: element.razonSocial }));
                  this.vehiculos = vehiculos.map(element => ({ value: element.idVehiculo, label: element.placa }));
                  this.choferes = choferes.map(element => ({
                    value: element.idChofer,
                    label: `DNI: ${element.dni} NOMBRE: ${element.nombreChofer} ${element.apellidoChofer}`
                  }));
                  this.ubigeos = ubigeo.map(element => ({ value: element.idDistrito, label: element.ubigeo }));
                },
                error: (err) => {
                  console.error('Error al cargar los datos de los dropdowns', err);
                },
                complete: () => {
                  if (this.idordentrabajo) {
                    this.ordenTransporteService.getOrden(this.idordentrabajo).subscribe({
                      
                      next: (resp) => {


                        const { ordenTransporte, guias } = resp;

                        console.log('orden',resp);

                        this.form.patchValue({
                          idcliente: ordenTransporte.idcliente || null,
                          idremitente: ordenTransporte.idremitente || null,
                          iddestinatario: ordenTransporte.iddestinatario || null,
                          idorigen: ordenTransporte.idorigen || null,
                          puntopartida: ordenTransporte.puntopartida || '',
                          iddestino: ordenTransporte.iddestino || null,
                          puntollegada: ordenTransporte.puntollegada || '',
                          idvehiculo: ordenTransporte.idvehiculo || null,
                          idchofer: ordenTransporte.idchofer || null,
                          fecharecojo: ordenTransporte.fecharecojo ? new Date(ordenTransporte.fecharecojo) : null,
                          

                          horarecojo: resp.ordenTransporte.fecharecojo
                          ? `${new Date(resp.ordenTransporte.fecharecojo).getHours().toString().padStart(2, '0')}:${new Date(resp.ordenTransporte.fecharecojo).getMinutes().toString().padStart(2, '0')}`
                          : null,


                          guiarecojo: ordenTransporte.guiarecojo ? [ordenTransporte.guiarecojo] : [],
                          bulto: ordenTransporte.bulto || null,
                          peso: ordenTransporte.peso || 0.00,
                          volumen: ordenTransporte.volumen || 0.00,
                          pesovol: ordenTransporte.pesovol || 0.00,
                          idformula: ordenTransporte.idformula || null,
                          idtipotransporte: ordenTransporte.idtipotransporte || null,
                          idconceptocobro: ordenTransporte.idconceptocobro || null,
                          idtipomercaderia: ordenTransporte.idtipomercaderia || null,
                          docgeneral: ordenTransporte.docgeneral || null,
                          descripciongeneral: ordenTransporte.descripciongeneral || null,
                          guiasremitente: resp.guias.map(guia => guia.nroguia),
                        });
                        this.model.precio = ordenTransporte.precio;
                      },
                      error: (err) => {
                        console.error('Error al cargar la orden', err);
                      }
                    });
                  }
                }
              });
            
              this.es = {
                firstDayOfWeek: 1,
                dayNames: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
                dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
                dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
                monthNames: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
                monthNamesShort: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
                today: 'Hoy',
                clear: 'Borrar'
              };
            }
            

  cargarDropDows() {


    this.user.idscliente === null ? '': this.user.idscliente;
    console.log(this.user.idscliente);
    
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

        // this.model.idcliente = this.modeltemp.idcliente;
        // this.model.idremitente =  this.modeltemp.idcliente ;
        // this.model.iddestinatario =   this.modeltemp.idcliente ;
        // // this.mismoremitente = true;
        // // this.mismodestinatario = true;
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
        this.ubigeos.push({ value: element.idDistrito ,  label : element.ubigeo});
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

    console.log(this.user);

    if (this.form.valid) {
      console.log(this.form.value);
      // Implementa la lógica de registro aquí.

      this.model = { 
        ...this.form.value, // Asignar todos los valores del formulario al modelo
        responsablecomercialid: this.user.id,
        tipoorden: 3,
        idusuarioregistro: this.user.id,
        idordentrabajo: this.idordentrabajo
    };



    this.confirmationService.confirm({
      message: '¿Esta seguro que desea actualizar esta OT?',
      header: '',
      accept: () => {
      

        this.form.disable();


       this.ordenTransporteService.actualizarOTR(this.model).subscribe(resp => {

          this.messageService.add({ severity: 'success', summary: 'Actualización exitosa', detail: `Se ha actualizado correctamente la orden de transporte` });

    
          this.router.navigate(['/seguimientoot/listadoordentransporte']);


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

      //  this.mismoremitente = true;
      //  this.mismodestinatario = true;



      //  this.cargarFormula();
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


      // Validar que los tres valores no sean null o undefined o vacíos
      if (!idCliente || !idOrigen || !idDestino) {
        this.formulas = []; // Vaciar la lista de fórmulas en caso de que alguno esté vacío
        return; // Salir de la función si falta algún dato
      }

      this.ordenTransporteService.getFormulas(idCliente,idOrigen, idDestino ).subscribe({
        next: response => {
          this.formulas = [];


          response.forEach(element => {
            this.formulas.push({ value: element.idFormula ,  label : element.formula  });
          });

          const idFormulaSeleccionada = this.form.get('idformula')?.value;
          if (idFormulaSeleccionada) {
            this.form.patchValue({ idformula: idFormulaSeleccionada });
          }

          console.log('formulaseleccionada',idFormulaSeleccionada)

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

        const idConceptoSeleccionada = this.form.get('idconceptocobro')?.value;
        if (idConceptoSeleccionada) {
          this.form.patchValue({ idconceptocobro: idConceptoSeleccionada });
        }
        else {
          this.form.patchValue({ idconceptocobro: 0 });
        }
        console.log('entre',idConceptoSeleccionada);

      } 
    });
  }
  grr() {
    this.dialogGrr = true;
  }
  generarGrr(){

    
    const [prefix, initialNumber] = this.model.guiaInicial.split('-');
    const start = parseInt(initialNumber, 10);

    this.guias = [...this.guias];

    
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
