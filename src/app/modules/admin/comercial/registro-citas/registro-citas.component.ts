import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ComercialService } from '../comercial.service';
import { MantenimientoService } from '../../mantenimiento/mantenimiento.service';
import { RecojoService } from '../../recojo/recojo.service';
import { TipoRegistro, OTPendiente } from './registro-citas.types';
import moment from 'moment';

@Component({
  selector: 'app-registro-citas',
  templateUrl: './registro-citas.component.html',
  styleUrls: ['./registro-citas.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    DropdownModule,
    CalendarModule,
    InputTextModule,
    InputTextareaModule,
    ButtonModule,
    CardModule,
    TableModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
})
export class RegistroCitasComponent implements OnInit {
  form: FormGroup;
  clientes: SelectItem[] = [];
  ubigeo: SelectItem[] = [];
  otsPendientes: OTPendiente[] = [];
  selectedOT: OTPendiente | null = null;
  loadingOTs = false;
  loading = false;

  nuevoDestino: any = { idDestinoFinal: null, cantidad: null, peso: null, volumen: null };
  destinosFinales: any[] = [];
  busquedaOT = '';

  // ── Incidencias ──────────────────────────────────────────────
  subtipoIncidencia: string | null = null;
  subtipoTrafico: string | null = null;

  subtiposIncidencia = [
    { id: 'programacion-local',     label: 'Programación local',     icon: 'heroicons_solid:map-pin' },
    { id: 'programacion-provincia', label: 'Programación provincia',  icon: 'heroicons_solid:building-office' },
    { id: 'trafico',                label: 'Tráfico provincia',       icon: 'heroicons_solid:truck' },
    { id: 'almacen',                label: 'Almacén',                 icon: 'heroicons_solid:archive-box' },
  ];

  subtiposTrafico = [
    { id: 'incumplimiento-entrega',  label: 'Incumplimiento de entrega' },
    { id: 'incumplimiento-li',       label: 'Incumplimiento de LI' },
    { id: 'falta-actualizacion',     label: 'Falta de actualización del sistema' },
    { id: 'falta-carga',             label: 'Falta de carga' },
  ];

  subtiposAlmacen = [
    { id: 'error-despacho',     label: 'Error en despacho',          otSearch: false },
    { id: 'error-digitacion',   label: 'Error en digitación',        otSearch: false },
    { id: 'falta-ingreso',      label: 'Falta de ingreso al sistema (recepción log inversa o recepción carga a provincia)', otSearch: true },
    { id: 'faltante-carga',     label: 'Faltante de carga local (en recojos para provincia)', otSearch: true },
  ];

  subtipoAlmacen: string | null = null;

  // OR search (Programación local)
  busquedaOR = '';
  resultadosOR: any[] = [];
  loadingOR = false;
  orSeleccionada: any = null;

  // OT search (Programación provincia / Almacén)
  busquedaOTProv = '';
  resultadosOTProv: any[] = [];
  loadingOTProv = false;
  otProvSeleccionada: any = null;

  get otsFiltradas(): OTPendiente[] {
    const q = this.busquedaOT.trim().toLowerCase();
    if (!q) return this.otsPendientes;
    return this.otsPendientes.filter(o =>
      (o.numcp        ?? '').toLowerCase().includes(q) ||
      (o.remitente    ?? '').toLowerCase().includes(q) ||
      (o.destinatario ?? '').toLowerCase().includes(q) ||
      (o.destino      ?? '').toLowerCase().includes(q)
    );
  }

  user: any;

  tipos: { id: TipoRegistro; label: string; icon: string; desc: string }[] = [
    { id: 'recojo',     label: 'Registro de Recojos',          icon: 'heroicons_solid:truck',                    desc: 'Registrar orden de recojo' },
    { id: 'cita',       label: 'Cita de Orden de Transporte',   icon: 'heroicons_solid:calendar',                 desc: 'Agendar cita para OT' },
    { id: 'incidencia', label: 'Instrucción de Incidencias',    icon: 'heroicons_solid:exclamation-triangle',     desc: 'Registrar instrucción' },
  ];

  constructor(
    private fb: FormBuilder,
    private comercialService: ComercialService,
    private mantenimientoService: MantenimientoService,
    private recojoService: RecojoService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.form = this.fb.group({
      idCliente:        [null, Validators.required],
      tipo:             [null as TipoRegistro | null, Validators.required],
      // cita
      idOT:             [null],
      fechaCita:        [null],
      horaCita:         [null],
      // recojo
      idorigen:         [null],
      puntoOrigen:      [null],
      contacto:         [null],
      telefonoContacto: [null],
      iddestino:        [null],
      centroAcopio:     [null],
      // compartido
      observaciones:    [null],
      // incidencia / reclamo
      tipoReclamo:      [null],
    });
  }

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('user') ?? 'null');
    this.cargarClientes();
    this.cargarUbigeo();

    this.form.get('idCliente')?.valueChanges.subscribe((id) => {
      this.form.patchValue({ tipo: null });
      this.resetCamposDetalle();
      if (id) this.cargarOTsPendientes(id);
    });

    this.form.get('tipo')?.valueChanges.subscribe(() => {
      this.resetCamposDetalle();
    });
  }

  private resetCamposDetalle(): void {
    this.form.patchValue({
      idOT: null, fechaCita: null, horaCita: null,
      idorigen: null, puntoOrigen: null, contacto: null,
      telefonoContacto: null, iddestino: null, centroAcopio: null,
      observaciones: null, tipoReclamo: null,
    });
    this.selectedOT = null;
    this.destinosFinales = [];
    this.nuevoDestino = { idDestinoFinal: null, cantidad: null, peso: null, volumen: null };
    this.busquedaOT         = '';
    this.subtipoIncidencia  = null;
    this.subtipoTrafico     = null;
    this.subtipoAlmacen     = null;
    this.orSeleccionada     = null;
    this.otProvSeleccionada = null;
    this.resultadosOR       = [];
    this.resultadosOTProv   = [];
    this.busquedaOR         = '';
    this.busquedaOTProv     = '';
  }

  cargarClientes(): void {
    this.mantenimientoService.getAllClientes('', this.user?.id ?? 2, true).subscribe({
      next: (clientes) => {
        this.clientes = clientes.map((c) => ({ value: c.idCliente, label: c.razonSocial ?? '' }));
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los clientes' });
      },
    });
  }

  cargarUbigeo(): void {
    this.recojoService.getUbigeo('').subscribe({
      next: (resp) => {
        this.ubigeo = resp.map(e => ({ value: e.idDistrito, label: e.ubigeo }));
      },
      error: () => {}
    });
  }

  cargarOTsPendientes(idcliente: number): void {
    this.loadingOTs = true;
    this.selectedOT = null;
    this.comercialService.getOTsCitasPendientesPorCliente(idcliente).subscribe({
      next: (list) => { this.otsPendientes = list ?? []; this.loadingOTs = false; },
      error: () => { this.otsPendientes = []; this.loadingOTs = false; },
    });
  }

  get tipoSeleccionado(): TipoRegistro | null { return this.form.get('tipo')?.value; }
  get esCita(): boolean      { return this.tipoSeleccionado === 'cita'; }
  get esRecojo(): boolean     { return this.tipoSeleccionado === 'recojo'; }
  get esIncidencia(): boolean { return this.tipoSeleccionado === 'incidencia'; }

  agregarDestinoFinal(): void {
    if (!this.nuevoDestino.idDestinoFinal || !this.nuevoDestino.cantidad) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Seleccione destino y cantidad' });
      return;
    }
    const dest = this.ubigeo.find(u => u.value === this.nuevoDestino.idDestinoFinal);
    this.destinosFinales.push({
      idDestino: this.nuevoDestino.idDestinoFinal,
      nombreDestino: dest?.label ?? '(sin destino)',
      cantidad: this.nuevoDestino.cantidad,
      peso: this.nuevoDestino.peso || null,
      volumen: this.nuevoDestino.volumen || null,
    });
    this.nuevoDestino = { idDestinoFinal: null, cantidad: null, peso: null, volumen: null };
  }

  eliminarDestinoFinal(index: number): void {
    this.destinosFinales.splice(index, 1);
  }

  getTotal(campo: 'cantidad' | 'peso' | 'volumen'): number {
    return this.destinosFinales.reduce((acc, cur) => acc + (Number(cur[campo]) || 0), 0);
  }

  guardar(): void {
    const v = this.form.value;

    if (!v.idCliente || !v.tipo) {
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Complete los campos requeridos' });
      return;
    }

    if (this.esRecojo) {
      if (!v.fechaCita || !v.horaCita || !v.idorigen) {
        this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Complete los campos obligatorios del recojo (*)' });
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
            idcliente:            v.idCliente,
            fechaCita:            moment(v.fechaCita).format('YYYY-MM-DD'),
            horaCita:             moment(v.horaCita).format('HH:mm:ss'),
            idorigen:             v.idorigen,
            puntoOrigen:          v.puntoOrigen,
            contacto:             v.contacto,
            telefonoContacto:     v.telefonoContacto,
            iddestino:            v.iddestino,
            centroAcopio:         v.centroAcopio,
            observaciones:        v.observaciones,
            responsablecomercialid: this.user?.id,
            idusuarioregistro:    this.user?.id,
            tipoorden:            2,
            destinosFinales: this.destinosFinales.map(d => ({
              idDestino: d.idDestino,
              cantidad:  d.cantidad,
              peso:      d.peso || null,
              volumen:   d.volumen || null,
            })),
          };
          this.recojoService.registrar(payload).subscribe({
            next: () => {
              this.loading = false;
              this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Orden de recojo registrada correctamente' });
              this.form.reset({ idCliente: v.idCliente, tipo: null });
            },
            error: () => {
              this.loading = false;
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo registrar la orden de recojo' });
            },
          });
        }
      });
      return;
    }

    if (this.esCita) {
      if (!this.selectedOT) {
        this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Debe seleccionar una OT de la tabla' });
        return;
      }
      if (!v.fechaCita || !v.horaCita) {
        this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Debe seleccionar fecha y hora de la cita' });
        return;
      }
      const fecha = moment(v.fechaCita).format('YYYY-MM-DD');
      const hora  = moment(v.horaCita).format('HH:mm:ss');
      this.confirmationService.confirm({
        message: `¿Confirma agendar la cita para la OT <strong>${this.selectedOT.numcp}</strong> el <strong>${moment(v.fechaCita).format('DD/MM/YYYY')}</strong> a las <strong>${hora}</strong>?`,
        header: 'Confirmar cita',
        icon: 'pi pi-calendar',
        acceptLabel: 'Sí, guardar',
        rejectLabel: 'Cancelar',
        accept: () => {
          this.loading = true;
          this.comercialService.guardarCita({
            idOrdenTrabajo:    this.selectedOT.idordentrabajo,
            idCliente:         v.idCliente,
            fechaCita:         fecha,
            horaCita:          hora,
            idUsuarioRegistro: this.user?.id ?? 0,
            observaciones:     v.observaciones ?? undefined,
          }).subscribe({
            next: () => {
              this.loading = false;
              this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Cita guardada correctamente' });
              this.form.patchValue({ tipo: null });
              this.resetCamposDetalle();
            },
            error: () => {
              this.loading = false;
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar la cita' });
            },
          });
        }
      });
      return;
    }
  }

  onOTSelect(event: { data: OTPendiente }): void { this.form.patchValue({ idOT: event.data.numcp }); }
  onOTUnselect(): void { this.form.patchValue({ idOT: null }); }

  // ── Incidencias ──────────────────────────────────────────────
  seleccionarSubtipoIncidencia(id: string): void {
    this.subtipoIncidencia  = id;
    this.subtipoTrafico     = null;
    this.subtipoAlmacen     = null;
    this.orSeleccionada     = null;
    this.otProvSeleccionada = null;
    this.resultadosOR       = [];
    this.resultadosOTProv   = [];
    this.busquedaOR         = '';
    this.busquedaOTProv     = '';
  }

  buscarOR(): void {
    const q = this.busquedaOR.trim();
    if (q.length < 3) {
      this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'Ingrese al menos 3 caracteres' });
      return;
    }
    this.loadingOR = true;
    this.orSeleccionada = null;
    this.recojoService.buscarOrPorNumcp(q).subscribe({
      next: (data) => { this.resultadosOR = Array.isArray(data) ? data : (data ? [data] : []); this.loadingOR = false; },
      error: ()     => { this.resultadosOR = []; this.loadingOR = false; },
    });
  }

  buscarOTProv(): void {
    const q = this.busquedaOTProv.trim();
    if (q.length < 3) {
      this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'Ingrese al menos 3 caracteres' });
      return;
    }
    this.loadingOTProv = true;
    this.otProvSeleccionada = null;
    this.comercialService.buscarOTPorNumcp(q).subscribe({
      next: (data) => { this.resultadosOTProv = data ? [data] : []; this.loadingOTProv = false; },
      error: ()    => { this.resultadosOTProv = []; this.loadingOTProv = false; },
    });
  }
}
