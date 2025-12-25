import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { Router, ActivatedRoute } from '@angular/router';
import { User } from 'app/core/user/user.types';
import moment from 'moment';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';

import { MantenimientoService } from '../../mantenimiento/mantenimiento.service';
import { RecojoService } from '../recojo.service';
import { OrdenRecojoFullDto } from '../recojo.types';
import { forkJoin, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    MatIcon,
    MessageModule,
    ToastModule,
    ConfirmDialogModule,
    DropdownModule,
    CalendarModule,
    TableModule
  ],
  providers: [
    ConfirmationService,
    DialogService,
    MessageService
  ]
})
export class EditComponent implements OnInit {

  es: any;
  loading = false;
  model: any = {};

  clientes: SelectItem[] = [];
  tipounidad: SelectItem[] = [];
  ubigeo: SelectItem[] = [];
  puntospartida: SelectItem[] = [];

  ordenRecojo!: OrdenRecojoFullDto | null;

  destinosFinales: any[] = [];
  nuevoDestino: any = { idDestinoFinal: null, cantidad: null };

  dateInicio: Date = new Date();
  user: User;
  orderId: number; // ID obtenido de la ruta (para edición)

  constructor(
    private mantenimientoService: MantenimientoService,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private recojoService: RecojoService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.es = {
      firstDayOfWeek: 1,
      dayNames: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
      dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
      dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
      monthNames: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
      monthNamesShort: ['ene', 'feb', 'mar', 'abr', 'may', 'jun',
        'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
      today: 'Hoy',
      clear: 'Borrar'
    };

    this.user = JSON.parse(localStorage.getItem('user') || '{}');
    this.orderId = Number(this.route.snapshot.paramMap.get('id'));

    // Cargar combos y, cuando terminen, cargar la orden (si hay id)
    this.cargarCombosOrden(this.orderId);
  }

  /** Carga todos los combos en paralelo y luego la orden (si aplica) */
  private cargarCombosOrden(id?: number) {
    this.loading = true;

    forkJoin({
      ubigeo: this.recojoService.getUbigeo(''),
      clientes: this.mantenimientoService.getAllClientes('', this.user?.id),
     // tipounidad: this.mantenimientoService.getValorTabla(8)
    })
    .pipe(
      switchMap(({ ubigeo, clientes }) => {
        // mapear a SelectItem[]
        this.ubigeo = (ubigeo ?? []).map((x: any) => ({ value: Number(x.idDistrito), label: x.ubigeo }));
        this.clientes = (clientes ?? []).map((x: any) => ({ value: Number(x.idCliente), label: x.razonSocial }));
      //  this.tipounidad = (tipounidad ?? []).map((x: any) => ({ value: Number(x.idValorTabla), label: x.valor }));

        // si hay id, cargamos la orden; si no, devolvemos observable vacío
        return id ? this.recojoService.getOrdenRecojoById(id) : of(null);
      })
    )
    .subscribe({
      next: (data) => {
        if (data) {
          this.ordenRecojo = data;

          console.log('Orden recojo cargada para edición:', data);

          // Parsear fecha/hora desde fechahoracita ISO
          const fechaHora = data?.cabecera?.fechahoracita
            ? moment(data.cabecera.fechahoracita)
            : null;

          this.model = {
            idordenrecojo: data?.cabecera?.idordenrecojo,
            idcliente: Number(data?.cabecera?.idcliente),       // <- number coercion
            idorigen: Number(data?.cabecera?.idorigen),        
            iddestino: Number(data?.cabecera?.iddestino),       // <- number coercion
            fechaCita: fechaHora ? fechaHora.toDate() : null,   // Date para p-calendar (date)
            horaCita: fechaHora ? fechaHora.toDate() : null,    // Date para p-calendar (time)
            contacto: data?.cabecera?.personarecojo,
            
            observaciones: data?.cabecera?.observaciones,
            idtipounidad: Number(data?.cabecera?.idtipounidad), // <- number coercion
            pesoestimado: data?.cabecera?.pesoestimado,
            bultoestimado: data?.cabecera?.bultoestimado,
            centroAcopio: data?.cabecera?.centroAcopio,
            puntoOrigen: data?.cabecera?.puntoOrigen,
            telefonoContacto: data?.cabecera?.telefonoContacto,
            personarecojo: data?.cabecera?.personarecojo

          };

          // Con el cliente ya seteado, carga sus direcciones
       //   this.cargarDirecciones();

        this.destinosFinales = (data?.destinos ?? []).map((d: any) => ({
          idDestino: d.iddestino,
          nombreDestino: d.nombreDestino || d.ubicacion || '', // por si el SP devuelve diferentes alias
          cantidad: d.cantidad ?? 0,
          peso: d.peso ?? null,
          volumen: d.volumen ?? null,
          destino : d.destino
        }));

        console.log('Destinos cargados:', this.destinosFinales);


        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando combos/orden:', err);
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar la información inicial.'
        });
      }
    });
  }
getTotalCantidad(): number {
  return this.destinosFinales?.reduce((acc, d) => acc + (d.cantidad || 0), 0) || 0;
}

getTotalPeso(): number {
  return this.destinosFinales?.reduce((acc, d) => acc + (d.peso || 0), 0) || 0;
}

getTotalVolumen(): number {
  return this.destinosFinales?.reduce((acc, d) => acc + (d.volumen || 0), 0) || 0;
}

  numberOnly(event: KeyboardEvent): boolean {
    const charCode = (event.which) ? event.which : (event as any).keyCode;
    return !(charCode > 31 && (charCode < 48 || charCode > 57));
  }

  cargarDirecciones() {
    this.puntospartida = [];
    if (!this.model.idcliente) return;

    this.recojoService.GetAllDireccionesByClienteId(this.model.idcliente).subscribe(x => {
      this.puntospartida = (x ?? []).map((item: any) => ({
        label: `${item.codigo ?? ''} - ${item.direccion}`,
        value: Number(item.iddireccion)
      }));
    });
  }

agregarDestinoFinal() {
  if (!this.nuevoDestino.idDestinoFinal || !this.nuevoDestino.cantidad) {
    this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Seleccione destino y cantidad' });
    return;
  }

  const destinoSeleccionado = this.ubigeo.find(u => u.value === this.nuevoDestino.idDestinoFinal);

  // Agregar a la lista
  this.destinosFinales.push({
    idDestino: this.nuevoDestino.idDestinoFinal || null,
    destino: destinoSeleccionado?.label || '(sin destino)',
    cantidad: this.nuevoDestino.cantidad,
    peso: this.nuevoDestino.peso || null,
    volumen: this.nuevoDestino.volumen || null
  });

  // Limpiar el formulario
  this.nuevoDestino = { idDestinoFinal: null, cantidad: null, peso: null, volumen: null };
}

  eliminarDestinoFinal(index: number) {
    this.destinosFinales.splice(index, 1);
  }

guardar(): void {
  if (!this.model.idcliente || !this.model.fechaCita || !this.model.horaCita || !this.model.idorigen) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Validación',
      detail: 'Complete los campos obligatorios marcados con (*).'
    });
    return;
  }

  // 🔹 Calculamos los totales de los destinos
  const totalCantidad = this.destinosFinales.reduce((acc, d) => acc + (Number(d.cantidad) || 0), 0);
  const totalPeso = this.destinosFinales.reduce((acc, d) => acc + (Number(d.peso) || 0), 0);
  const totalVolumen = this.destinosFinales.reduce((acc, d) => acc + (Number(d.volumen) || 0), 0);

  this.confirmationService.confirm({
    message: this.orderId
      ? '¿Desea actualizar los datos de esta orden de recojo?'
      : '¿Desea registrar una nueva orden de recojo?',
    header: 'Confirmación',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Sí, guardar',
    rejectLabel: 'Cancelar',
    accept: () => {
      this.loading = true;

      const payload = {
        ...this.model,
        idcliente: Number(this.model.idcliente),
        idorigen: Number(this.model.idorigen),
        idtipounidad: Number(this.model.idtipounidad),
        responsablecomercialid: this.user.id,
        idusuarioregistro: this.user.id,
        tipoorden: 2,
        fechaCita: moment(this.model.fechaCita).format('YYYY-MM-DD'),
        horaCita: moment(this.model.horaCita).format('HH:mm:ss'),

        // 🔹 Totales de cabecera
        bulto: totalCantidad,
        peso: totalPeso,
        volumen: totalVolumen,

        // 🔹 Lista de destinos con nuevos campos
        destinosFinales: this.destinosFinales.map(d => ({
          idDestino: Number(d.idDestino),
          cantidad: Number(d.cantidad) || 0,
          peso: Number(d.peso) || null,
          volumen: Number(d.volumen) || null
        }))
      };

      // 🔹 Determina si es registro o actualización
      const request = this.orderId
        ? this.recojoService.actualizar(this.orderId, payload)
        : this.recojoService.registrar(payload);

      request.subscribe({
        next: () => {
          this.loading = false;
          this.messageService.add({
            severity: 'success',
            summary: this.orderId ? 'Orden actualizada' : 'Orden registrada',
            detail: this.orderId
              ? 'La orden fue actualizada correctamente.'
              : 'La orden fue registrada correctamente.'
          });
          setTimeout(() => this.router.navigate(['/seguimiento/ordenrecojo']), 900);
        },
        error: (err) => {
          console.error('Error al guardar la orden:', err);
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo guardar la orden. Intente nuevamente.'
          });
        }
      });
    }
  });
}


  cancelar(): void {
          setTimeout(() => this.router.navigate(['/seguimiento/ordenrecojo']), 900);
  }
}
