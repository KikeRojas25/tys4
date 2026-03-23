import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { User } from '../../trafico.types';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { OrdenTransporteService } from 'app/modules/admin/recepcion/ordentransporte/ordentransporte.service';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { ChipsModule } from 'primeng/chips';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';

interface GuiaGRR {
  idguia?: number;
  nroGrr: string;
  nroDocumento: string;
  editando?: boolean;
}

@Component({
  selector: 'app-new',
  templateUrl: './new.component.html',
  styleUrls: ['./new.component.css'],
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
export class NewComponent implements OnInit {
  dialogGrr = false;
  dialogEtiqueta = false;
  es: any;
  public loading = false;
  model: any = {};
  // Cuando se crea una OTR vinculada, el backend requiere el proveedor
  idproveedor: number | null = null;
  guias: string[] = [];
  guiasGrr: GuiaGRR[] = [];
  mostrarTablaGuias = true;
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
  idotvinculada: number | null = null;
  private ordenVinculadaPrecarga: any | null = null;
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
    const idotvinculadaParam = this.activatedRoute.snapshot.queryParamMap.get('idotvinculada');
    if (idotvinculadaParam) {
      const parsed = Number(idotvinculadaParam);
      this.idotvinculada = Number.isFinite(parsed) ? parsed : null;
    }
    const idproveedorParam = this.activatedRoute.snapshot.queryParamMap.get('idproveedor');
    if (idproveedorParam) {
      const parsed = Number(idproveedorParam);
      this.idproveedor = Number.isFinite(parsed) ? parsed : null;
    }

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
      guiarecojo: [[]],
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

    console.log(this.user );
  

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

    // Si la OTR se está creando desde una OR vinculada, preseleccionar datos.
    this.precargarDesdeOrdenVinculada();


    //this.idordentrabajo  = this.activatedRoute.snapshot.params["uid"];
    //console.log( this.activatedRoute.snapshot.params["uid"], 'params');

  //   this.ordenTransporteService.getOrden(this.idordentrabajo).subscribe(resp => {
  //     this.modeltemp = resp;
  //  })








  }

  private precargarDesdeOrdenVinculada() {
    if (!this.idotvinculada) return;

    this.ordenTransporteService.getOrden(this.idotvinculada).subscribe({
      next: (resp: any) => {
        const orden = resp?.ordenTransporte ?? resp;
        if (!orden) return;
        this.ordenVinculadaPrecarga = orden;
        // Fallback: si no vino en querystring, intentar tomarlo de la OR vinculada
        if (!this.idproveedor) {
          const idp = Number(orden?.idproveedor);
          this.idproveedor = Number.isFinite(idp) ? idp : this.idproveedor;
        }
        this.aplicarPrecargaDesdeOrdenVinculada();
      },
      error: (error) => {
        console.error('No se pudo precargar OR vinculada:', error);
        this.messageService.add({
          severity: 'warn',
          summary: 'Preselección',
          detail: 'No se pudo precargar la OR vinculada. Puede completar la OTR manualmente.'
        });
      }
    });
  }

  private obtenerDestinoVillaElSalvadorId(): number | null {
    const match = (this.ubigeos ?? []).find((u) =>
      String(u?.label ?? '').toUpperCase().includes('VILLA EL SALVADOR')
    );
    const value = match?.value;
    return Number.isFinite(Number(value)) ? Number(value) : (value ?? null);
  }

  private aplicarPrecargaDesdeOrdenVinculada() {
    if (!this.ordenVinculadaPrecarga) return;
    // Necesitamos los combos cargados para poder preseleccionar y que los dropdowns muestren el label
    if (!this.ubigeos || this.ubigeos.length === 0) return;
    if (!this.clientes || this.clientes.length === 0) return;

    const orden = this.ordenVinculadaPrecarga;

    const idcliente = orden?.idcliente ?? null;
    const idorigen = orden?.idorigen ?? null;
    const puntopartida = orden?.puntopartida ?? '';
    const puntollegada = orden?.puntollegada ?? '';

    // Destino: en estos casos siempre es Villa El Salvador
    let iddestino = this.obtenerDestinoVillaElSalvadorId();
    if (!iddestino) {
      iddestino = orden?.iddestino ?? null;
      this.messageService.add({
        severity: 'warn',
        summary: 'Preselección',
        detail: 'No se encontró "Villa El Salvador" en el listado de destinos. Se usará el destino de la OR.'
      });
    }

    // Fecha/hora: preferir fecharecojo; si no, caer a fechacita/fechahoracita
    const fechaBaseRaw =
      orden?.fecharecojo ??
      orden?.fechacita ??
      orden?.fechahoracita ??
      null;

    const fechaBase = fechaBaseRaw ? new Date(fechaBaseRaw) : null;
    const horarecojoRaw: string | null = orden?.horarecojo ?? null;
    const horarecojo =
      horarecojoRaw
        ? String(horarecojoRaw).slice(0, 5)
        : fechaBase
          ? `${String(fechaBase.getHours()).padStart(2, '0')}:${String(fechaBase.getMinutes()).padStart(2, '0')}`
          : null;

    this.form.patchValue({
      idcliente,
      idorigen,
      iddestino,
      puntopartida,
      puntollegada,
      fecharecojo: fechaBase,
      horarecojo
    });

    // Setear remitente/destinatario igual al cliente, pero mantener editables.
    if (idcliente) {
      this.cargarDestinatario();
      this.mismoremitente = false;
      this.mismodestinatario = false;
    } else {
      // Si no hay cliente, al menos recalcular combos dependientes si aplica
      this.cargarFormula();
    }

    // Evitar re-aplicar
    this.ordenVinculadaPrecarga = null;
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

        // Si ya se obtuvo la OR vinculada (y ya tenemos ubigeos), aplicar precarga ahora.
        this.aplicarPrecargaDesdeOrdenVinculada();

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

    // Si ya se obtuvo la OR vinculada, aplicar precarga ahora que ya tenemos ubigeos.
    this.aplicarPrecargaDesdeOrdenVinculada();

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
      
      // Transformar guiasGrr a formato que espera el backend (List<GuiaGrrDto>)
      const guiasRemitenteDto = this.guiasGrr.map(guia => ({
        nroGrr: guia.nroGrr,
        nroDocumento: guia.nroDocumento || ''
      }));

      // Implementa la lógica de registro aquí.
      this.model = { 
        ...this.form.value, // Asignar todos los valores del formulario al modelo
        responsablecomercialid: this.user.id,
        tipoorden: 3,
        idusuarioregistro: this.user.id,
        idotvinculada: this.idotvinculada,
        ...(this.idotvinculada && this.idproveedor ? { idproveedor: this.idproveedor } : {}),
        guiasremitente: guiasRemitenteDto // Enviar como List<GuiaGrrDto>
    };



    this.confirmationService.confirm({
      message: '¿Esta seguro que desea registrar esta OTR?',
      header: '',
      accept: () => {
      

        console.log('modelo',this.model);


       this.ordenTransporteService.registrarOTR(this.model).subscribe(resp => {

          this.messageService.add({ severity: 'success', summary: 'Registro exitoso', detail: `Se ha registrado correctamente la orden de transporte 100-763633` });
         // this.router.navigate(['/seguimientoot/listadoordentransporte']);

          var url =  `http://104.36.166.65/webreports/ot.aspx?idorden= ${resp.idordentrabajo}` ;
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
      idusuarioregistro: this.user.id,
      idotvinculada: this.idotvinculada,
      ...(this.idotvinculada && this.idproveedor ? { idproveedor: this.idproveedor } : {})
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
    if (!this.model.cantidadguias || this.model.cantidadguias <= 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Ingrese una cantidad válida de guías a generar'
      });
      return;
    }

    if (!this.model.guiaInicial) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Ingrese el número de GRR inicial'
      });
      return;
    }
    
    const [prefix, initialNumber] = this.model.guiaInicial.split('-');
    const start = parseInt(initialNumber, 10);
    const numeroLength = initialNumber.length; // Longitud original del número (incluyendo ceros)

    if (isNaN(start)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'El formato del GRR inicial debe ser: PREFIJO-NUMERO (ej: GRR-001)'
      });
      return;
    }

    // Generar las guías en el array de strings (para mantener compatibilidad)
    this.guias = [...this.guias];

    // Generar las guías en la nueva tabla
    for (let i = 0; i < this.model.cantidadguias; i++) {
      // Mantener el formato exacto con ceros a la izquierda
      const numeroFormateado = String(start + i).padStart(numeroLength, '0');
      const nroGrr = `${prefix}-${numeroFormateado}`;
      
      // Evitar duplicados
      if (!this.guias.includes(nroGrr)) {
        this.guias.push(nroGrr);
        
        // Agregar a la tabla editable
        this.guiasGrr.push({
          nroGrr: nroGrr,
          nroDocumento: '',
          editando: false
        });
      }
    }

    this.mostrarTablaGuias = true;
    this.dialogGrr = false;

    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: `Se generaron ${this.model.cantidadguias} guías GRR`
    });

    // Actualizar el formControl con las guías
    this.form.patchValue({ guiasremitente: this.guias });
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

  // ===== MÉTODOS PARA TABLA DE GUÍAS GRR =====
  
  toggleTablaGuias(): void {
    this.mostrarTablaGuias = !this.mostrarTablaGuias;
  }

  editarGuiaGrr(guia: GuiaGRR): void {
    // Desactivar edición en todas las guías
    this.guiasGrr.forEach(g => g.editando = false);
    // Activar edición en la guía seleccionada
    guia.editando = true;
  }

  actualizarGuiaGrr(guia: GuiaGRR): void {
    if (!guia.nroGrr || guia.nroGrr.trim() === '') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'El número de GRR no puede estar vacío'
      });
      return;
    }

    // Desactivar modo edición
    guia.editando = false;

    // Actualizar el array de guías (para mantener sincronizado con el control chips)
    this.actualizarArrayGuias();

    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Guía actualizada correctamente'
    });
  }

  cancelarEdicionGuiaGrr(guia: GuiaGRR): void {
    guia.editando = false;
  }

  eliminarGuiaGrr(index: number): void {
    if (index >= 0 && index < this.guiasGrr.length) {
      this.guiasGrr.splice(index, 1);
      this.actualizarArrayGuias();
      
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Guía eliminada correctamente'
      });
    }
  }

  limpiarTodasLasGuiasGrr(): void {
    this.guiasGrr = [];
    this.guias = [];
    this.form.patchValue({ guiasremitente: [] });
    
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Todas las guías han sido eliminadas'
    });
  }

  private actualizarArrayGuias(): void {
    // Mantener sincronizado el array de guías con la tabla
    this.guias = this.guiasGrr.map(g => g.nroGrr);
    this.form.patchValue({ guiasremitente: this.guias });
  }

}
