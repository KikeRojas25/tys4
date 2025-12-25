import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { ConfirmationService, MenuItem, MessageService, SelectItem } from 'primeng/api';
import { DynamicDialogModule, DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { MessageModule } from 'primeng/message';
import { Router } from '@angular/router';
import { OverlayPanel } from 'primeng/overlaypanel';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { MantenimientoService } from '../../mantenimiento/mantenimiento.service';
import { RecojoService } from '../recojo.service';
import moment from 'moment';
import { MatIcon } from '@angular/material/icon';
import { User } from 'app/core/user/user.types';
import { drop } from 'lodash';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';

@Component({
  selector: 'app-nuevaordenrecojo',
  templateUrl: './new.component.html',
  styleUrls: ['./new.component.scss'],
  styles: [`
  :host ::ng-deep button {
      margin-right: .25em;
  }
`],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    MatIcon,
    ReactiveFormsModule ,
    MessageModule,
    ToastModule,
    ConfirmDialogModule,
    DropdownModule,
    CalendarModule,
    TableModule
  ],
  providers: [
    ConfirmationService ,
    DialogService ,
    MessageService
  ]
})
export class NuevaordenrecojoComponent implements OnInit {

  es: any;
  public loading = false;
  model: any = {};

  clientes: SelectItem[] = [];
  tipounidad: SelectItem[] = [];
  ubigeo: SelectItem[] = [];

  puntospartida: SelectItem[] = [];

  dateInicio: Date = new Date(Date.now()) ;
  user: User ;
  IdNuevaOrden = 0;
nuevoDestino: any = {
  idDestinoFinal: null,
  cantidad: null,
  peso: null,
  volumen: null
};

destinosFinales: any[] = [];

  horacita: any;

  date: Date = new Date();
  settings = {
    bigBanner: true,
    timePicker: false,
    format: 'dd-MM-yyyy',
    defaultOpen: true
  };
 
  constructor(private mantenimientoService: MantenimientoService,
    public dialogService: DialogService,
    private confirmationService: ConfirmationService ,
    private recojoService: RecojoService,
    private messageService: MessageService,
     private router: Router  
  ) { }


  ngOnInit() {


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

  this.recojoService.getUbigeo('').subscribe(resp => {
    resp.forEach(element => {
        this.ubigeo.push({ value: element.idDistrito ,  label : element.ubigeo});
      });

  });



    this.user = JSON.parse(localStorage.getItem('user'));


    this.mantenimientoService.getAllClientes('', this.user.id).subscribe(resp => {
      resp.forEach(element => {
          this.clientes.push({ value: element.idCliente ,  label : element.razonSocial});
        });
    });

    this.mantenimientoService.getValorTabla(8).subscribe(resp => {
      resp.forEach(element => {
          this.tipounidad.push({ value: element.idValorTabla ,  label : element.valor});
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

registrar(): void {
  // Validar campos obligatorios
  if (!this.model.idcliente || !this.model.fechaCita || !this.model.horaCita || !this.model.idorigen) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Validación',
      detail: 'Complete los campos obligatorios marcados con (*).'
    });
    return;
  }

  this.confirmationService.confirm({
    message: '¿Está seguro que desea registrar esta Orden de Recojo?',
    header: 'Confirmación',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Sí, guardar',
    rejectLabel: 'Cancelar',
    accept: () => {
      this.loading = true;

      const payload = {
        ...this.model,
        responsablecomercialid: this.user.id,
        idusuarioregistro: this.user.id,
        tipoorden: 2,
        fechaCita: moment(this.model.fechaCita).format('YYYY-MM-DD'),
        horaCita: moment(this.model.horaCita).format('HH:mm:ss'),
        destinosFinales: this.destinosFinales.map(d => ({
        idDestino: d.idDestino,
        cantidad: d.cantidad,
        peso: d.peso || null,
        volumen: d.volumen || null
      })),
      };

      this.recojoService.registrar(payload).subscribe({
        next: (resp) => {
          this.loading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Orden registrada',
            detail: 'La orden de recojo se ha registrado correctamente.'
          });

        setTimeout(() => this.router.navigate(['/seguimiento/ordenrecojo']), 100);
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo registrar la orden. Intente nuevamente.'
          });
        }
      });
    }
  });
}

cancelar(): void {
         setTimeout(() => this.router.navigate(['/seguimiento/ordenrecojo']), 100);
}

 cargarDirecciones() {

  this.puntospartida = [];

  this.recojoService.GetAllDireccionesByClienteId(this.model.idcliente).subscribe(x => {

    x.forEach(item => {
      this.puntospartida.push({ label: (item.codigo === null? ' ': item.codigo) + ' - '  +  item.direccion , value: item.iddireccion })
    })

  });


 }
 // Método para agregar destino final
agregarDestinoFinal() {
  if (!this.nuevoDestino.idDestinoFinal || !this.nuevoDestino.cantidad) {
    this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Seleccione destino y cantidad' });
    return;
  }

  const destinoSeleccionado = this.ubigeo.find(u => u.value === this.nuevoDestino.idDestinoFinal);

  // Agregar a la lista
  this.destinosFinales.push({
    idDestino: this.nuevoDestino.idDestinoFinal || null,
    nombreDestino: destinoSeleccionado?.label || '(sin destino)',
    cantidad: this.nuevoDestino.cantidad,
    peso: this.nuevoDestino.peso || null,
    volumen: this.nuevoDestino.volumen || null
  });

  // Limpiar el formulario
  this.nuevoDestino = { idDestinoFinal: null, cantidad: null, peso: null, volumen: null };
}

getTotal(campo: 'cantidad' | 'peso' | 'volumen'): number {
  return this.destinosFinales.reduce((acc, cur) => acc + (Number(cur[campo]) || 0), 0);
}



}
