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
import { InputMaskModule } from 'primeng/inputmask';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ComercialService } from '../comercial.service';
import { MantenimientoService } from '../../mantenimiento/mantenimiento.service';
import { RecojoService } from '../../recojo/recojo.service';
import { listarOrdenRecojoComponent } from '../../recojo/list/list.component';
import { ReclamoService } from '../reclamos/reclamo.service';
import { SeguimientoReclamosComponent } from '../reclamos/seguimiento/seguimiento-reclamos.component';
import { ReclamoAreaCodigo, ReclamoCreatePayload } from '../reclamos/reclamo.types';
import { TipoRegistro, OTPendiente, OTObservada } from './registro-citas.types';
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
    InputMaskModule,
    ButtonModule,
    CardModule,
    TableModule,
    ToastModule,
    TooltipModule,
    ConfirmDialogModule,
    listarOrdenRecojoComponent,
    SeguimientoReclamosComponent,
  ],
  providers: [MessageService, ConfirmationService],
})
export class RegistroCitasComponent implements OnInit {
  /** Toggle del listado de OR embebido. */
  mostrarListadoOR = false;
  /** Toggle del seguimiento de reclamos embebido. */
  mostrarReclamos = false;
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

  // OT observadas (entrada del flujo Instrucción de Incidencias)
  otsObservadas: OTObservada[] = [];
  loadingOTsObservadas = false;
  selectedOTObservada: OTObservada | null = null;
  busquedaOTObs = '';

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

  subtiposProgramacionLocal = [
    { id: 'no-recojo',                 label: 'No se ejecutó el recojo programado' },
    { id: 'no-li',                     label: 'No se ejecutó la LI programada' },
    { id: 'arribo-tarde',              label: 'Arribo tarde al cliente' },
    { id: 'falta-actualizacion-drive', label: 'Falta de actualización de datos drive' },
    { id: 'no-procedimiento',          label: 'No se cumplió procedimiento del cliente' },
  ];

  subtipoProgramacionLocal: string | null = null;

  subtiposProgramacionProvincia = [
    { id: 'no-despacho-ot', label: 'No se cumplió el despacho de la OT' },
    { id: 'otros',          label: 'Otros:' },
  ];

  subtipoProgramacionProvincia: string | null = null;
  otrosProgramacionProvincia: string = '';

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

  get otsObservadasFiltradas(): OTObservada[] {
    const q = this.busquedaOTObs.trim().toLowerCase();
    if (!q) return this.otsObservadas;
    return this.otsObservadas.filter(o =>
      (o.numcp        ?? '').toLowerCase().includes(q) ||
      (o.remitente    ?? '').toLowerCase().includes(q) ||
      (o.destinatario ?? '').toLowerCase().includes(q) ||
      (o.destino      ?? '').toLowerCase().includes(q) ||
      (o.tipoentrega  ?? '').toLowerCase().includes(q) ||
      (o.observacion  ?? '').toLowerCase().includes(q)
    );
  }

  user: any;
  minFechaRecojo: Date = moment().startOf('day').toDate();

  tipos: { id: TipoRegistro; label: string; icon: string; desc: string }[] = [
    { id: 'recojo',     label: 'Registro de OR',         icon: 'heroicons_solid:truck',                desc: 'Registrar orden de recojo' },
    { id: 'cita',       label: 'Cita de OT', icon: 'heroicons_solid:calendar',             desc: 'Agendar cita para OT' },
    { id: 'reclamo',    label: 'Registro de Reclamos',        icon: 'heroicons_solid:chat-bubble-left-right', desc: 'Registrar reclamos del cliente' },
    { id: 'incidencia', label: 'Instrucción de Incidencias',  icon: 'heroicons_solid:exclamation-triangle', desc: 'Sobre OT con observaciones' },
  ];

  constructor(
    private fb: FormBuilder,
    private comercialService: ComercialService,
    private mantenimientoService: MantenimientoService,
    private recojoService: RecojoService,
    private reclamoService: ReclamoService,
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
      this.otsObservadas = [];
      if (id) this.cargarOTsPendientes(id);
    });

    this.form.get('tipo')?.valueChanges.subscribe((tipo) => {
      this.resetCamposDetalle();
      const idCliente = this.form.value.idCliente;
      if (tipo === 'incidencia' && idCliente) {
        this.cargarOTsObservadas(idCliente);
      }
      if (tipo === 'recojo') {
        this.form.patchValue({ fechaCita: moment().add(1, 'day').startOf('day').toDate() });
      }
    });
  }

  get puedeRetrocederFechaRecojo(): boolean {
    const actual = this.form.get('fechaCita')?.value;
    if (!actual) return true;
    return moment(actual).startOf('day').isAfter(moment().startOf('day'));
  }

  ajustarFechaRecojo(dias: number): void {
    const actual = this.form.get('fechaCita')?.value;
    const base = actual ? moment(actual) : moment().add(1, 'day');
    const nueva = base.add(dias, 'day');
    const hoy = moment().startOf('day');
    if (nueva.isBefore(hoy)) {
      this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'No se permiten fechas anteriores a hoy' });
      return;
    }
    this.form.patchValue({ fechaCita: nueva.toDate() });
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
    this.selectedOTObservada = null;
    this.busquedaOTObs      = '';
    this.subtipoIncidencia  = null;
    this.subtipoTrafico     = null;
    this.subtipoProgramacionLocal = null;
    this.subtipoProgramacionProvincia = null;
    this.otrosProgramacionProvincia = '';
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

  cargarOTsObservadas(idcliente: number): void {
    this.loadingOTsObservadas = true;
    this.selectedOTObservada = null;
    this.comercialService.getOTsObservadasPorCliente(idcliente).subscribe({
      next: (list) => { this.otsObservadas = list ?? []; this.loadingOTsObservadas = false; },
      error: () => { this.otsObservadas = []; this.loadingOTsObservadas = false; },
    });
  }

  get tipoSeleccionado(): TipoRegistro | null { return this.form.get('tipo')?.value; }
  get esCita(): boolean       { return this.tipoSeleccionado === 'cita'; }
  get esRecojo(): boolean     { return this.tipoSeleccionado === 'recojo'; }
  get esReclamo(): boolean    { return this.tipoSeleccionado === 'reclamo'; }
  get esIncidencia(): boolean { return this.tipoSeleccionado === 'incidencia'; }

  onOTObservadaSelect(event: { data: OTObservada }): void {
    this.selectedOTObservada = event.data;
  }
  onOTObservadaUnselect(): void {
    this.selectedOTObservada = null;
  }

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
      const horaRecojo = moment(v.horaCita, 'HH:mm');
      if (!horaRecojo.isValid() || horaRecojo.hours() > 23 || horaRecojo.minutes() > 59) {
        this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Hora inválida (HH:mm)' });
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
            horaCita:             horaRecojo.format('HH:mm:ss'),
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
      const horaParsed = moment(v.horaCita, 'HH:mm');
      if (!horaParsed.isValid() || horaParsed.hours() > 23 || horaParsed.minutes() > 59) {
        this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Hora inválida (HH:mm)' });
        return;
      }
      const hora  = horaParsed.format('HH:mm:ss');
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

    if (this.esReclamo || this.esIncidencia) {
      this.guardarReclamo();
      return;
    }
  }

  // ── Persistencia de reclamo / instrucción de incidencia ──────
  private subtipoSeleccionadoActual(): string | null {
    switch (this.subtipoIncidencia) {
      case 'programacion-local':     return this.subtipoProgramacionLocal;
      case 'programacion-provincia': return this.subtipoProgramacionProvincia;
      case 'trafico':                return this.subtipoTrafico;
      case 'almacen':                return this.subtipoAlmacen;
      default:                        return null;
    }
  }

  private guardarReclamo(): void {
    const v = this.form.value;

    if (!v.idCliente) {
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Seleccione el cliente' });
      return;
    }

    let areaCodigo:    ReclamoAreaCodigo;
    let subtipoCodigo: string;
    let idOT:          number | null;
    let textoLibre:    string | null = null;

    if (this.esIncidencia) {
      // Flujo Incidencia: solo OT observada + instrucción.
      if (!this.selectedOTObservada) {
        this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Seleccione una OT con observaciones' });
        return;
      }
      const instruccion = (v.observaciones ?? '').trim();
      if (!instruccion) {
        this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Escriba la instrucción de la observación' });
        return;
      }
      areaCodigo    = 'incidencia' as ReclamoAreaCodigo;
      subtipoCodigo = 'ot-observada';
      idOT          = this.selectedOTObservada.idordentrabajo;
    } else {
      // Flujo Reclamo: requiere área + subtipo + OT/OR relacionada.
      if (!this.subtipoIncidencia) {
        this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Seleccione el área' });
        return;
      }
      const sub = this.subtipoSeleccionadoActual();
      if (!sub) {
        this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Seleccione una alternativa' });
        return;
      }
      if (this.subtipoIncidencia === 'programacion-provincia'
          && this.subtipoProgramacionProvincia === 'otros'
          && !this.otrosProgramacionProvincia.trim()) {
        this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Especifique el detalle en "Otros"' });
        return;
      }
      const esLocal = this.subtipoIncidencia === 'programacion-local';
      if (esLocal && !this.orSeleccionada) {
        this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Busque y seleccione la Orden de Recojo (OR) relacionada' });
        return;
      }
      if (!esLocal && !this.otProvSeleccionada) {
        this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Busque y seleccione la Orden de Transporte (OT) relacionada' });
        return;
      }
      areaCodigo    = this.subtipoIncidencia as ReclamoAreaCodigo;
      subtipoCodigo = sub;
      idOT          = esLocal
        ? (this.orSeleccionada?.idordentrabajo ?? null)
        : (this.otProvSeleccionada?.idordentrabajo ?? null);
      textoLibre    = (this.subtipoIncidencia === 'programacion-provincia' && this.subtipoProgramacionProvincia === 'otros')
        ? this.otrosProgramacionProvincia.trim()
        : null;
    }

    const payload: ReclamoCreatePayload = {
      idcliente:         v.idCliente,
      area_codigo:       areaCodigo,
      subtipo_codigo:    subtipoCodigo,
      texto_libre:       textoLibre,
      idordentrabajo:    idOT,
      observaciones:     v.observaciones ?? null,
      idusuarioregistro: this.user?.id ?? 0,
    };

    const confirmMsg = this.esIncidencia
      ? '¿Confirma el registro de la instrucción para esta OT observada?'
      : '¿Confirma el registro del reclamo?';

    this.confirmationService.confirm({
      message: confirmMsg,
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, guardar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.loading = true;
        this.reclamoService.guardar(payload).subscribe({
          next: (resp) => {
            this.loading = false;
            this.messageService.add({
              severity: 'success', summary: 'Éxito',
              detail: this.esIncidencia
                ? `Instrucción registrada (#${resp.idreclamo})`
                : `Reclamo registrado (#${resp.idreclamo})`,
            });
            this.form.patchValue({ tipo: null });
            this.resetCamposDetalle();
          },
          error: () => {
            this.loading = false;
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo registrar' });
          },
        });
      }
    });
  }

  onOTSelect(event: { data: OTPendiente }): void { this.form.patchValue({ idOT: event.data.numcp }); }
  onOTUnselect(): void { this.form.patchValue({ idOT: null }); }

  // ── Incidencias ──────────────────────────────────────────────
  seleccionarSubtipoIncidencia(id: string): void {
    this.subtipoIncidencia            = id;
    this.subtipoTrafico               = null;
    this.subtipoProgramacionLocal     = null;
    this.subtipoProgramacionProvincia = null;
    this.otrosProgramacionProvincia   = '';
    this.subtipoAlmacen               = null;
    this.orSeleccionada               = null;
    this.otProvSeleccionada           = null;
    this.resultadosOR                 = [];
    this.resultadosOTProv             = [];
    this.busquedaOR                   = '';
    this.busquedaOTProv               = '';
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
