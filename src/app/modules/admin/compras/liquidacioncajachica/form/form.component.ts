import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import moment from 'moment';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ComprasService } from '../../compras.service';
import { LiquidacionCajaDto, LiquidacionCajaForCreateDto, LiquidacionCajaForUpdateDto, OrdenTransporteLite } from '../../compras.types';
import { User } from 'app/core/user/user.types';
import { MantenimientoService } from 'app/modules/admin/mantenimiento/mantenimiento.service';
import { catchError, forkJoin, map, of } from 'rxjs';

@Component({
  selector: 'app-liquidacion-caja-chica-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatIconModule,
    InputTextModule,
    InputTextareaModule,
    InputNumberModule,
    DropdownModule,
    CalendarModule,
    TableModule,
    ButtonModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService, MessageService],
})
export class LiquidacionCajaChicaFormComponent implements OnInit {
  loading = false;
  isEdit = false;
  idliquidacion: number | null = null;
  private _numeroLiquidacion: string = '';
  isModal = false;

  user: User | null = null;

  conceptos: SelectItem[] = [];
  tiposTransferencia: SelectItem[] = [];
  private tiposTransferenciaMap: Record<number, string> = {};
  // Se usa en el template para mostrar/ocultar el asterisco y mensajes de requerido
  isEfectivoTipo: boolean = false;

  tiposComprobante: SelectItem[] = [
    { label: 'Recibo por Honorarios', value: 'Recibo por Honorarios' },
    { label: 'Factura', value: 'Factura' },
    { label: 'Caja de egreso', value: 'Caja de egreso' },
  ];

  // --- Buscador de OTs/Manifiesto (Detalles) ---
  searchMode: 'manifiesto' | 'ot' = 'manifiesto';
  searchModes: SelectItem[] = [
    { label: 'Manifiesto', value: 'manifiesto' },
    { label: 'OT', value: 'ot' },
  ];
  searchText: string = '';
  searchLoading = false;

  ots: Array<OrdenTransporteLite & { idmanifiesto: number | null; monto: number }> = [];

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private comprasService: ComprasService,
    private mantenimientoService: MantenimientoService,
    private route: ActivatedRoute,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    public dialogRef: DynamicDialogRef,
    public dialogConfig: DynamicDialogConfig
  ) {}

  get detalles(): FormArray {
    return this.form.get('detalles') as FormArray;
  }

  get cabeceraCompleta(): boolean {
    const fechaliquidacionOk = this.form.get('fechaliquidacion')?.valid ?? false;
    const conceptoOk = this.form.get('idconcepto')?.valid ?? false;
    const montoCtrl = this.form.get('monto');
    const montoOk = (montoCtrl?.valid ?? false) && (Number(montoCtrl?.value) > 0);

    const tipoTransfOk = this.form.get('idtipotransferencia')?.valid ?? false;
    const destinatarioOk = this.isEfectivoTipo ? true : (this.form.get('destinatariotransferencia')?.valid ?? false);
    const cuentaOk = this.isEfectivoTipo ? true : (this.form.get('cuentatransferencia')?.valid ?? false);
    const numeroOpOk = this.isEfectivoTipo ? true : (this.form.get('numerooperacion')?.valid ?? false);

    return fechaliquidacionOk && conceptoOk && montoOk && tipoTransfOk && destinatarioOk && cuentaOk && numeroOpOk;
  }

  ngOnInit(): void {
    this.initForm();
    this.user = this.safeParse<User>('user');

    this.cargarConceptos();
    this.cargarTiposTransferencia();

    // Validación condicional para datos bancarios según tipo de transferencia
    this.form.get('idtipotransferencia')?.valueChanges.subscribe((id) => {
      this.applyTransferValidators(id);
    });

    // Habilitar/Deshabilitar comprobante (no obligatorio)
    this.form.get('habilitarComprobante')?.valueChanges.subscribe((enabled) => {
      this.applyComprobanteState(!!enabled);
    });

    // Recalcular prorrateo cuando cambia el monto de cabecera
    this.form.get('monto')?.valueChanges.subscribe(() => {
      this.recalcularProrrateo();
      this.syncDetallesFromOts();
    });

    // Modo modal (si fue abierto desde el listado)
    this.isModal = !!this.dialogConfig?.data?.modal;

    const modalId = this.dialogConfig?.data?.id;
    const routeId = this.route.snapshot.paramMap.get('id');
    const idStr = modalId != null ? String(modalId) : routeId;

    this.idliquidacion = idStr ? Number(idStr) : null;
    this.isEdit = !!this.idliquidacion;

    if (this.isEdit && this.idliquidacion) {
      this.cargar(this.idliquidacion);
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      fechaliquidacion: [null as any, [Validators.required]],
      idconcepto: [null as any, [Validators.required]],
      monto: [null as any, [Validators.required, Validators.min(0)]],

      // Comprobante (no obligatorio; bloqueado por defecto)
      habilitarComprobante: [false as any],
      numerocomprobante: [{ value: '', disabled: true }, [Validators.maxLength(100)]],
      tipocomprobante: [{ value: null as any, disabled: true }],
      razonsocialdocumento: [{ value: '', disabled: true }, [Validators.maxLength(200)]],

      // Observación (opcional)
      observacion: ['', [Validators.maxLength(500)]],

      // Transferencia
      idtipotransferencia: [null as any, [Validators.required]],
      destinatariotransferencia: [{ value: '', disabled: false }, [Validators.maxLength(200)]],
      cuentatransferencia: [{ value: '', disabled: false }, [Validators.maxLength(20)]],
      numerooperacion: [{ value: '', disabled: false }, [Validators.maxLength(20)]],

      detalles: this.fb.array([]),
    });
  }

  private safeParse<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  private getCurrentUserId(): number {
    // En este proyecto se usa tanto user.id como user.usr_int_id; priorizamos id.
    return Number((this.user as any)?.id ?? (this.user as any)?.usr_int_id ?? 0);
  }

  addDetalle(): void {
    this.detalles.push(
      this.fb.group({
        idmanifiesto: [null as any],
        idordentransporte: [null as any],
        monto: [null as any, [Validators.required, Validators.min(0)]],
      })
    );
  }

  removeDetalle(index: number): void {
    this.detalles.removeAt(index);
  }

  getTotalDetalles(): number {
    return (this.detalles.value ?? []).reduce((acc: number, d: any) => acc + (Number(d?.monto) || 0), 0);
  }

  private cargar(id: number): void {
    this.loading = true;
    this.comprasService.getLiquidacionById(id).subscribe({
      next: (resp: LiquidacionCajaDto) => {
        // Limpiar detalles
        while (this.detalles.length) this.detalles.removeAt(0);
        this.ots = [];
        this._numeroLiquidacion = resp?.numeroliquidacion ?? '';

        const comprobante =
          String((resp as any)?.numerocomprobante ?? (resp as any)?.numeroComprobante ?? (resp as any)?.NumeroComprobante ?? '').trim();
        const tipoComprobante = String(
          (resp as any)?.tipocomprobante ??
            (resp as any)?.tipoComprobante ??
            (resp as any)?.TipoComprobante ??
            ''
        ).trim();
        const razonSocialDocumento = String(
          (resp as any)?.razonsocialdocumento ??
            (resp as any)?.razonSocialDocumento ??
            (resp as any)?.RazonSocialDocumento ??
            ''
        ).trim();

        const observacion = String(
          (resp as any)?.observacion ??
            (resp as any)?.Observacion ??
            (resp as any)?.observaciones ??
            (resp as any)?.Observaciones ??
            ''
        ).trim();

        this.form.patchValue({
          fechaliquidacion: resp?.fechaliquidacion ? new Date(resp.fechaliquidacion) : null,
          idconcepto: resp?.idconcepto ?? null,
          monto: resp?.monto ?? null,

          habilitarComprobante: comprobante.length > 0,
          numerocomprobante: comprobante,
          tipocomprobante: tipoComprobante.length > 0 ? tipoComprobante : null,
          razonsocialdocumento: razonSocialDocumento,

          observacion: observacion,

          idtipotransferencia: (resp as any)?.idtipotransferencia ?? (resp as any)?.idTipoTransferencia ?? (resp as any)?.idtipotransferencia ?? null,
          destinatariotransferencia:
            (resp as any)?.destinatariotransferencia ?? (resp as any)?.destinatarioTransferencia ?? (resp as any)?.DestinatarioTransferencia ?? '',
          cuentatransferencia:
            (resp as any)?.cuentatransferencia ?? (resp as any)?.cuentaTransferencia ?? (resp as any)?.CuentaTransferencia ?? '',
          numerooperacion:
            (resp as any)?.numerooperacion ?? (resp as any)?.numeroOperacion ?? (resp as any)?.NumeroOperacion ?? '',
        });

        // Asegura estado enable/disable según el checkbox (en edición)
        this.applyComprobanteState(comprobante.length > 0);

        // Aplicar validación condicional con el valor actual (si aún no cargó el mapa, se re-ejecuta al cargar tipos)
        this.applyTransferValidators(this.form.get('idtipotransferencia')?.value);

        const dets = resp?.detalles ?? [];
        if (dets?.length) {
          // Reconstruir tabla de OTs desde los detalles existentes
          const uniqueOtIds = Array.from(new Set((dets ?? []).map((d: any) => Number(d?.idordentransporte)).filter(Boolean)));

          const requests = uniqueOtIds.map((idOt) =>
            this.comprasService.getOrdenById(idOt).pipe(
              catchError(() => of(null))
            )
          );

          (requests.length ? forkJoin(requests) : of([])).subscribe({
            next: (ordenesResp: any[]) => {
              const map: Record<number, { numcp: string; peso: number }> = {};
              (ordenesResp ?? []).forEach((r: any) => {
                if (!r) return;
                const orden = r?.ordenTransporte ?? r?.OrdenTransporte ?? r?.data?.ordenTransporte ?? r?.data?.OrdenTransporte ?? r;
                const id = Number(orden?.idordentrabajo ?? orden?.idOrdenTrabajo ?? orden?.idordentransporte ?? orden?.id);
                if (!id) return;
                map[id] = {
                  numcp: String(orden?.numcp ?? orden?.numCp ?? orden?.NumCp ?? ''),
                  peso: Number(orden?.peso ?? orden?.Peso ?? 0) || 0,
                };
              });

              // Construye la tabla OTs usando detalles
              dets.forEach((d: any) => {
                const idOt = Number(d?.idordentransporte);
                if (!idOt) return;
                const info = map[idOt];
                this.ots.push({
                  idordentrabajo: idOt,
                  numcp: info?.numcp || String(idOt),
                  peso: Number(info?.peso) || 0,
                  idmanifiesto: d?.idmanifiesto != null ? Number(d.idmanifiesto) : null,
                  monto: Number(d?.monto) || 0,
                });
              });

              // Recalcula según monto de cabecera y sincroniza formarray
              this.recalcularProrrateo();
              this.syncDetallesFromOts();
            },
            error: () => {
              // Si falla traer OTs, al menos conserva detalles tal como vienen
              dets.forEach((d: any) =>
                this.detalles.push(
                  this.fb.group({
                    idmanifiesto: [d.idmanifiesto ?? null],
                    idordentransporte: [d.idordentransporte ?? null],
                    monto: [d.monto ?? null, [Validators.required, Validators.min(0)]],
                  })
                )
              );
            },
          });
        }
      },
      error: (err) => {
        console.error('Error cargando liquidación:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Compras',
          detail: 'No se pudo cargar la liquidación. Intente nuevamente.',
        });
      },
      complete: () => (this.loading = false),
    });
  }

  private cargarConceptos(): void {
    this.mantenimientoService.getValorTabla(43).subscribe({
      next: (valores: any[]) => {
        this.conceptos = (valores ?? []).map((v: any) => ({
          label: v.valor,
          value: v.idValorTabla ?? v.idvalortabla,
        }));
      },
      error: (err) => {
        console.error('Error al cargar conceptos (TablaId=43):', err);
        this.messageService.add({
          severity: 'warn',
          summary: 'Advertencia',
          detail: 'No se pudieron cargar los conceptos.',
        });
      },
    });
  }

  private cargarTiposTransferencia(): void {
    this.mantenimientoService.getValorTabla(44).subscribe({
      next: (valores: any[]) => {
        this.tiposTransferencia = (valores ?? []).map((v: any) => ({
          label: String(v.valor ?? '').trim(),
          value: v.idValorTabla ?? v.idvalortabla,
        }));

        this.tiposTransferenciaMap = (valores ?? []).reduce((acc: Record<number, string>, v: any) => {
          const id = Number(v.idValorTabla ?? v.idvalortabla);
          if (!Number.isNaN(id)) acc[id] = String(v.valor ?? '').trim();
          return acc;
        }, {});

        // Re-aplica reglas con el valor actual si ya hay uno seleccionado (p.ej. en editar)
        this.applyTransferValidators(this.form.get('idtipotransferencia')?.value);
      },
      error: (err) => {
        console.error('Error al cargar tipos de transferencia (TablaId=44):', err);
        this.messageService.add({
          severity: 'warn',
          summary: 'Advertencia',
          detail: 'No se pudieron cargar los tipos de transferencia.',
        });
      },
    });
  }

  private applyTransferValidators(idTipo: any): void {
    const id = Number(idTipo);
    const label = (Number.isFinite(id) ? this.tiposTransferenciaMap?.[id] : '') ?? '';
    const isEfectivo = String(label).toLowerCase().includes('efectivo');
    this.isEfectivoTipo = isEfectivo;

    const destinatarioCtrl = this.form.get('destinatariotransferencia');
    const cuentaCtrl = this.form.get('cuentatransferencia');
    const numeroOpCtrl = this.form.get('numerooperacion');

    if (!destinatarioCtrl || !cuentaCtrl || !numeroOpCtrl) return;

    if (isEfectivo) {
      // No obligatorios: se limpian, deshabilitan y se quita required
      destinatarioCtrl.clearValidators();
      destinatarioCtrl.setValidators([Validators.maxLength(200)]);
      cuentaCtrl.clearValidators();
      cuentaCtrl.setValidators([Validators.maxLength(20)]);
      numeroOpCtrl.clearValidators();
      numeroOpCtrl.setValidators([Validators.maxLength(20)]);

      destinatarioCtrl.setValue('', { emitEvent: false });
      cuentaCtrl.setValue('', { emitEvent: false });
      numeroOpCtrl.setValue('', { emitEvent: false });

      destinatarioCtrl.disable({ emitEvent: false });
      cuentaCtrl.disable({ emitEvent: false });
      numeroOpCtrl.disable({ emitEvent: false });
    } else {
      // Obligatorios para todo tipo distinto a Efectivo
      destinatarioCtrl.enable({ emitEvent: false });
      cuentaCtrl.enable({ emitEvent: false });
      numeroOpCtrl.enable({ emitEvent: false });

      destinatarioCtrl.setValidators([Validators.required, Validators.maxLength(200)]);
      cuentaCtrl.setValidators([Validators.required, Validators.maxLength(20)]);
      numeroOpCtrl.setValidators([Validators.required, Validators.maxLength(20)]);
    }

    destinatarioCtrl.updateValueAndValidity({ emitEvent: false });
    cuentaCtrl.updateValueAndValidity({ emitEvent: false });
    numeroOpCtrl.updateValueAndValidity({ emitEvent: false });
  }

  private applyComprobanteState(enabled: boolean): void {
    const numeroCtrl = this.form.get('numerocomprobante');
    const tipoCtrl = this.form.get('tipocomprobante');
    const razonCtrl = this.form.get('razonsocialdocumento');
    if (!numeroCtrl || !tipoCtrl || !razonCtrl) return;

    if (enabled) {
      numeroCtrl.enable({ emitEvent: false });
      tipoCtrl.enable({ emitEvent: false });
      razonCtrl.enable({ emitEvent: false });
      // No es obligatorio; solo límite de longitud
      numeroCtrl.setValidators([Validators.maxLength(100)]);
      tipoCtrl.setValidators([]);
      razonCtrl.setValidators([Validators.maxLength(200)]);
    } else {
      // Se limpia y se deshabilita
      numeroCtrl.setValue('', { emitEvent: false });
      tipoCtrl.setValue(null, { emitEvent: false });
      razonCtrl.setValue('', { emitEvent: false });

      numeroCtrl.disable({ emitEvent: false });
      tipoCtrl.disable({ emitEvent: false });
      razonCtrl.disable({ emitEvent: false });

      numeroCtrl.setValidators([Validators.maxLength(100)]);
      tipoCtrl.setValidators([]);
      razonCtrl.setValidators([Validators.maxLength(200)]);
    }

    numeroCtrl.updateValueAndValidity({ emitEvent: false });
    tipoCtrl.updateValueAndValidity({ emitEvent: false });
    razonCtrl.updateValueAndValidity({ emitEvent: false });
  }

  // -----------------------------------------------------------------------------------
  // Detalles: búsqueda y carga de OTs
  // -----------------------------------------------------------------------------------

  async buscar(): Promise<void> {
    if (!this.cabeceraCompleta) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Complete la cabecera (fecha, concepto, monto y comprobante) antes de buscar.',
      });
      return;
    }
    const criterio = String(this.searchText ?? '').trim();
    if (!criterio) {
      this.messageService.add({ severity: 'warn', summary: 'Validación', detail: 'Ingrese un criterio de búsqueda.' });
      return;
    }

    this.searchLoading = true;
    try {
      if (this.searchMode === 'manifiesto') {
        // NO usar BuscarManifiestoBot.
        // El usuario ingresa un nummanifiesto que contiene el id, ej: "man-123456".
        // Extraemos dígitos y tomamos el último grupo como idmanifiesto.
        const matches = criterio.match(/\d+/g) ?? [];
        const idmanifiesto = Number(matches[matches.length - 1]);
        if (!Number.isFinite(idmanifiesto) || idmanifiesto <= 0) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Manifiesto',
            detail: 'Ingrese un manifiesto válido (ej: man-123456).',
          });
          return;
        }

        const otsRaw = await this.comprasService.getAllOrdersForManifest(idmanifiesto).toPromise();
        const ots = (otsRaw ?? [])
          .map((x: any) => this.comprasService.mapOrdenLite(x))
          .filter(Boolean) as OrdenTransporteLite[];

        if (ots.length === 0) {
          this.messageService.add({ severity: 'warn', summary: 'Manifiesto', detail: 'El manifiesto no tiene OTs.' });
          return;
        }

        this.addOts(ots, idmanifiesto);
        this.searchText = '';
        return;
      }

      // OT
      const resp = await this.comprasService.buscarOTBot(criterio).toPromise();
      const results = Array.isArray(resp?.data) ? resp.data : Array.isArray(resp?.Data) ? resp.Data : [];

      const ots = (results ?? [])
        .map((x: any) => this.comprasService.mapOrdenLite(x))
        .filter(Boolean) as OrdenTransporteLite[];

      if (ots.length === 0) {
        this.messageService.add({ severity: 'warn', summary: 'OT', detail: 'No se encontraron OTs con ese criterio.' });
        return;
      }

      // Completar pesos faltantes en paralelo si hiciera falta
      const faltantes = ots.filter((x) => !(Number(x.peso) > 0));
      if (faltantes.length) {
        await forkJoin(
          faltantes.map((o) =>
            this.comprasService.getOrdenById(o.idordentrabajo).pipe(
              catchError(() => of(null)),
              map((r: any) => {
                if (!r) return null;
                const orden = r?.ordenTransporte ?? r?.OrdenTransporte ?? r?.data?.ordenTransporte ?? r?.data?.OrdenTransporte ?? r;
                const peso = Number(orden?.peso ?? orden?.Peso ?? 0);
                o.peso = Number.isFinite(peso) ? peso : 0;
                return null;
              })
            )
          )
        ).toPromise();
      }

      this.addOts(ots, null);
      this.searchText = '';
    } catch (err) {
      console.error('Error en búsqueda:', err);
      this.messageService.add({ severity: 'error', summary: 'Búsqueda', detail: 'Ocurrió un error al buscar.' });
    } finally {
      this.searchLoading = false;
    }
  }

  private addOts(list: OrdenTransporteLite[], idmanifiesto: number | null): void {
    const existingIds = new Set(this.ots.map((x) => Number(x.idordentrabajo)));
    const toAdd = list.filter((x) => !existingIds.has(Number(x.idordentrabajo)));
    if (toAdd.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Detalle', detail: 'Las OTs ya están agregadas.' });
      return;
    }

    toAdd.forEach((ot) => {
      this.ots.push({
        ...ot,
        idmanifiesto,
        monto: 0,
      });
    });

    this.recalcularProrrateo();
    this.syncDetallesFromOts();
  }

  quitarOt(index: number): void {
    if (index < 0 || index >= this.ots.length) return;
    this.ots.splice(index, 1);
    this.recalcularProrrateo();
    this.syncDetallesFromOts();
  }

  // Nota: ensurePeso ya no es necesaria (se completa en buscarOt si falta)

  private extractManifiestoId(resp: any): number | null {
    const candidates = [
      resp?.idmanifiesto,
      resp?.idManifiesto,
      resp?.IdManifiesto,
      resp?.manifiesto?.idmanifiesto,
      resp?.manifiesto?.idManifiesto,
      resp?.data?.idmanifiesto,
      resp?.data?.idManifiesto,
      resp?.cabecera?.idmanifiesto,
      resp?.cabecera?.idManifiesto,
    ];
    for (const c of candidates) {
      const n = Number(c);
      if (Number.isFinite(n) && n > 0) return n;
    }
    return null;
  }

  // -----------------------------------------------------------------------------------
  // Prorrateo y sincronización de detalles
  // -----------------------------------------------------------------------------------

  private round2(n: number): number {
    return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
  }

  getTotalPeso(): number {
    return this.ots.reduce((acc, x) => acc + (Number(x.peso) || 0), 0);
  }

  getTotalMontoProrrateado(): number {
    return this.round2(this.ots.reduce((acc, x) => acc + (Number(x.monto) || 0), 0));
  }

  getMontoCabecera(): number {
    return Number(this.form.get('monto')?.value) || 0;
  }

  getDiferenciaMonto(): number {
    return this.round2(this.getMontoCabecera() - this.getTotalMontoProrrateado());
  }

  private recalcularProrrateo(): void {
    const total = Number(this.form.get('monto')?.value) || 0;
    if (!this.ots || this.ots.length === 0) return;

    const totalPeso = this.getTotalPeso();

    // Trabajamos en centavos para asegurar suma exacta
    const totalCents = Math.round(total * 100);
    const cents: number[] = [];

    if (totalPeso > 0) {
      // reparto proporcional a peso
      for (const ot of this.ots) {
        const ratio = (Number(ot.peso) || 0) / totalPeso;
        cents.push(Math.round(totalCents * ratio));
      }
    } else {
      // fallback igualitario si no hay peso
      const base = Math.floor(totalCents / this.ots.length);
      for (let i = 0; i < this.ots.length; i++) cents.push(base);
    }

    const sumCents = cents.reduce((a, b) => a + b, 0);
    const diff = totalCents - sumCents;
    // Ajuste al último para cuadrar exacto
    cents[cents.length - 1] = (cents[cents.length - 1] ?? 0) + diff;

    for (let i = 0; i < this.ots.length; i++) {
      this.ots[i].monto = this.round2((cents[i] ?? 0) / 100);
    }
  }

  private syncDetallesFromOts(): void {
    // Limpia y vuelve a crear el FormArray de detalles (no editable inline)
    while (this.detalles.length) this.detalles.removeAt(0);

    this.ots.forEach((ot) => {
      this.detalles.push(
        this.fb.group({
          idmanifiesto: [ot.idmanifiesto],
          idordentransporte: [ot.idordentrabajo],
          monto: [ot.monto, [Validators.required, Validators.min(0)]],
        })
      );
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Complete los campos obligatorios.',
      });
      return;
    }

    if (!this.detalles || this.detalles.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Agregue al menos una OT en el detalle.',
      });
      return;
    }

    const esTrafico = !!this.user?.estrafico;
    const esAlmacen = !!this.user?.esalmacen;
    // Regla: prioridad Tráfico y fallback=1
    const IdTipoLiquidacion = esTrafico ? 1 : esAlmacen ? 2 : 1;

    const fecha = this.form.value.fechaliquidacion as any;
    const fechaliquidacion = fecha ? moment(fecha).format('YYYY-MM-DD') : null;
    const observacionRaw = String(this.form.get('observacion')?.value ?? '').trim();
    const observacion = observacionRaw.length > 0 ? observacionRaw : null;
    const observaciones = observacion;

    const habilitarComprobante = !!this.form.get('habilitarComprobante')?.value;
    const tipocomprobante = habilitarComprobante ? String(this.form.get('tipocomprobante')?.value ?? '').trim() : null;
    const razonsocialdocumento = habilitarComprobante ? String(this.form.get('razonsocialdocumento')?.value ?? '').trim() : null;

    const payloadBase: LiquidacionCajaForCreateDto = {
      // Se autogenera en backend; en edición preservamos el número actual
      numeroliquidacion: String(this._numeroLiquidacion ?? '').trim(),
      fechaliquidacion: String(fechaliquidacion ?? ''),
      idusuarioregistro: this.getCurrentUserId(),
      idconcepto: Number(this.form.value.idconcepto),
      monto: Number(this.form.value.monto),
      numerocomprobante: String(this.form.get('numerocomprobante')?.value ?? '').trim(),
      tipocomprobante: tipocomprobante && tipocomprobante.length > 0 ? tipocomprobante : null,
      razonsocialdocumento: razonsocialdocumento && razonsocialdocumento.length > 0 ? razonsocialdocumento : null,
      observacion,
      observaciones,
      IdTipoLiquidacion,

      idtipotransferencia: Number(this.form.value.idtipotransferencia),
      destinatariotransferencia: this.isEfectivoTipo ? null : String(this.form.get('destinatariotransferencia')?.value ?? '').trim(),
      cuentatransferencia: this.isEfectivoTipo ? null : String(this.form.get('cuentatransferencia')?.value ?? '').trim(),
      numerooperacion: this.isEfectivoTipo ? null : String(this.form.get('numerooperacion')?.value ?? '').trim(),

      detalles: (this.detalles.value ?? []).map((d: any) => ({
        idmanifiesto: d?.idmanifiesto != null ? Number(d.idmanifiesto) : null,
        idordentransporte: d?.idordentransporte != null ? Number(d.idordentransporte) : null,
        monto: Number(d?.monto) || 0,
      })),
    };

    const confirmMessage = this.isEdit
      ? '¿Desea actualizar los datos de esta liquidación?'
      : '¿Desea registrar una nueva liquidación?';

    this.confirmationService.confirm({
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      message: confirmMessage,
      acceptLabel: 'Sí, guardar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.loading = true;
        const request = this.isEdit && this.idliquidacion
          ? this.comprasService.updateLiquidacion(this.idliquidacion, {
              ...(payloadBase as any),
              idliquidacion: this.idliquidacion,
            } as LiquidacionCajaForUpdateDto)
          : this.comprasService.createLiquidacion(payloadBase);

        request.subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Compras',
              detail: this.isEdit ? 'Liquidación actualizada correctamente.' : 'Liquidación registrada correctamente.',
            });
            if (this.isModal) {
              setTimeout(() => this.dialogRef.close(true), 300);
            } else {
              setTimeout(() => this.router.navigate(['/compras/liquidacioncajachica']), 900);
            }
          },
          error: (err) => {
            console.error('Error guardando liquidación:', err);
            this.loading = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Compras',
              detail: 'No se pudo guardar la liquidación. Verifique los datos e intente nuevamente.',
            });
          },
          complete: () => (this.loading = false),
        });
      },
    });
  }

  cancelar(): void {
    if (this.isModal) {
      this.dialogRef.close(false);
    } else {
      this.router.navigate(['/compras/liquidacioncajachica']);
    }
  }
}

