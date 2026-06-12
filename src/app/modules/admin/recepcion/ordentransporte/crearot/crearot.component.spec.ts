/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { of, Subject, throwError } from 'rxjs';

import { CrearotComponent } from './crearot.component';
import { OrdenTransporteService } from '../ordentransporte.service';
import { MantenimientoService } from '../../../mantenimiento/mantenimiento.service';
import { RecojoService } from 'app/modules/admin/recojo/recojo.service';

describe('CrearotComponent - Caso de uso: Crear OT', () => {
  let component: CrearotComponent;
  let fixture: ComponentFixture<CrearotComponent>;

  let ordenTransporteServiceSpy: jasmine.SpyObj<OrdenTransporteService>;
  let mantenimientoServiceSpy: jasmine.SpyObj<MantenimientoService>;
  let recojoServiceSpy: jasmine.SpyObj<RecojoService>;
  let confirmationServiceSpy: jasmine.SpyObj<ConfirmationService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;
  let dialogServiceSpy: jasmine.SpyObj<DialogService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const fakeUser = {
    id: 99,
    idestacionorigen: 7,
    name: 'Tester',
    email: 'tester@tys.local',
  };

  /** Llena el formulario con valores válidos para que pase la validación de `registrar`. */
  function llenarFormularioValido(): void {
    component.form.patchValue({
      idcliente: 60,
      idremitente: 60,
      iddestinatario: 60,
      idorigen: 1,
      puntopartida: 'Lima 123',
      iddestino: 1389,
      puntollegada: 'Piura 123',
      idvehiculo: 28,
      idchofer: 14,
      fecharecojo: new Date('2026-05-09T10:00:00'),
      horarecojo: '12:00',
      guiarecojo: ['001-001'],
      bulto: 1,
      peso: 12.2,
      volumen: 2,
      pesovol: 2,
      idformula: 8,
      idtipotransporte: 1,
      idconceptocobro: 1,
      idtipomercaderia: 1,
      docgeneral: 'DOC-001',
      descripciongeneral: 'Mercadería general',
      guiasremitente: ['F001-1'],
    });
  }

  beforeEach(async () => {
    ordenTransporteServiceSpy = jasmine.createSpyObj<OrdenTransporteService>(
      'OrdenTransporteService',
      [
        'getValorTabla',
        'getVehiculos',
        'getChoferes',
        'getUbigeo',
        'getFormulas',
        'getConceptos',
        'registrarOT',
        'calcularPrecio',
        'obtenerResumenPorClienteYOrigen',
      ],
    );
    mantenimientoServiceSpy = jasmine.createSpyObj<MantenimientoService>(
      'MantenimientoService',
      ['getAllClientes'],
    );
    recojoServiceSpy = jasmine.createSpyObj<RecojoService>('RecojoService', [
      'buscarOrPorNumcp',
      'getOtsPendientesRecepcionCreacionOt',
    ]);
    confirmationServiceSpy = jasmine.createSpyObj<ConfirmationService>(
      'ConfirmationService',
      ['confirm'],
    );
    messageServiceSpy = jasmine.createSpyObj<MessageService>('MessageService', ['add']);
    dialogServiceSpy = jasmine.createSpyObj<DialogService>('DialogService', ['open']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    // Devolver listas vacías por defecto para que `cargarDropDows` resuelva sin tocar nada.
    ordenTransporteServiceSpy.getValorTabla.and.returnValue(of([]));
    ordenTransporteServiceSpy.getVehiculos.and.returnValue(of([]));
    ordenTransporteServiceSpy.getChoferes.and.returnValue(of([]));
    ordenTransporteServiceSpy.getUbigeo.and.returnValue(of([]));
    ordenTransporteServiceSpy.getFormulas.and.returnValue(of([]));
    ordenTransporteServiceSpy.getConceptos.and.returnValue(of([]));
    ordenTransporteServiceSpy.obtenerResumenPorClienteYOrigen.and.returnValue(of([]));
    mantenimientoServiceSpy.getAllClientes.and.returnValue(of([]));

    // Simular usuario en localStorage (lo lee `ngOnInit`).
    spyOn(localStorage, 'getItem').and.callFake((key: string) =>
      key === 'user' ? JSON.stringify(fakeUser) : null,
    );

    await TestBed.configureTestingModule({
      imports: [CrearotComponent, NoopAnimationsModule],
      providers: [
        { provide: OrdenTransporteService, useValue: ordenTransporteServiceSpy },
        { provide: MantenimientoService, useValue: mantenimientoServiceSpy },
        { provide: RecojoService, useValue: recojoServiceSpy },
        { provide: ConfirmationService, useValue: confirmationServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: DialogService, useValue: dialogServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { params: {} } } },
      ],
    })
      // Sobrescribimos los providers del componente standalone para que ConfirmationService y
      // MessageService usen los spies en vez de las instancias originales.
      .overrideComponent(CrearotComponent, {
        set: {
          providers: [
            { provide: MessageService, useValue: messageServiceSpy },
            { provide: ConfirmationService, useValue: confirmationServiceSpy },
            { provide: DialogService, useValue: dialogServiceSpy },
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(CrearotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('Inicialización del formulario', () => {
    it('debe construir el FormGroup con los controles requeridos', () => {
      const controles = [
        'idcliente',
        'idremitente',
        'iddestinatario',
        'idorigen',
        'puntopartida',
        'iddestino',
        'puntollegada',
        'idvehiculo',
        'idchofer',
        'fecharecojo',
        'horarecojo',
        'guiarecojo',
        'bulto',
        'peso',
        'volumen',
        'pesovol',
        'idformula',
        'idtipotransporte',
        'idconceptocobro',
        'idtipomercaderia',
        'docgeneral',
        'descripciongeneral',
        'guiasremitente',
      ];
      controles.forEach((c) => expect(component.form.get(c)).withContext(c).toBeTruthy());
    });

    it('el formulario debe ser inválido al inicio', () => {
      expect(component.form.valid).toBeFalse();
    });

    it('debe leer el usuario desde localStorage', () => {
      expect(component.user).toEqual(jasmine.objectContaining({ id: 99, idestacionorigen: 7 }));
    });
  });

  describe('cargarDestinatario', () => {
    it('debe copiar el idcliente a idremitente e iddestinatario y disparar la carga de fórmulas', () => {
      component.form.patchValue({ idcliente: 60, idorigen: 1, iddestino: 1389 });

      component.cargarDestinatario();

      expect(component.form.get('idremitente').value).toBe(60);
      expect(component.form.get('iddestinatario').value).toBe(60);
      expect(component.mismoremitente).toBeTrue();
      expect(component.mismodestinatario).toBeTrue();
      expect(ordenTransporteServiceSpy.getFormulas).toHaveBeenCalledWith(60, 1, 1389);
    });
  });

  describe('generarGrr', () => {
    it('debe generar la cantidad solicitada manteniendo el padding del número', () => {
      component.model = { cantidadguias: 3, guiaInicial: 'GRR-001' };

      component.generarGrr();

      expect(component.guiasGrr.length).toBe(3);
      expect(component.guiasGrr.map((g) => g.nroGrr)).toEqual([
        'GRR-001',
        'GRR-002',
        'GRR-003',
      ]);
      expect(component.form.get('guiasremitente').value).toEqual([
        'GRR-001',
        'GRR-002',
        'GRR-003',
      ]);
    });

    it('debe avisar si la cantidad es inválida', () => {
      component.model = { cantidadguias: 0, guiaInicial: 'GRR-001' };

      component.generarGrr();

      expect(messageServiceSpy.add).toHaveBeenCalledWith(
        jasmine.objectContaining({ severity: 'warn' }),
      );
      expect(component.guiasGrr.length).toBe(0);
    });

    it('debe avisar si el formato del GRR inicial es inválido', () => {
      component.model = { cantidadguias: 2, guiaInicial: 'SINGUION' };

      component.generarGrr();

      expect(messageServiceSpy.add).toHaveBeenCalledWith(
        jasmine.objectContaining({ severity: 'warn' }),
      );
      expect(component.guiasGrr.length).toBe(0);
    });

    it('no debe duplicar GRR ya existentes', () => {
      component.guias = ['GRR-001'];
      component.guiasGrr = [{ nroGrr: 'GRR-001', nroDocumento: '', editando: false }];
      component.model = { cantidadguias: 2, guiaInicial: 'GRR-001' };

      component.generarGrr();

      expect(component.guiasGrr.length).toBe(2);
      expect(component.guiasGrr.map((g) => g.nroGrr)).toEqual(['GRR-001', 'GRR-002']);
    });
  });

  describe('Mantenimiento de guías GRR', () => {
    beforeEach(() => {
      component.guiasGrr = [
        { nroGrr: 'GRR-001', nroDocumento: 'D1', editando: false },
        { nroGrr: 'GRR-002', nroDocumento: 'D2', editando: false },
      ];
      component.guias = ['GRR-001', 'GRR-002'];
    });

    it('eliminarGuiaGrr debe quitar la guía y sincronizar el formulario', () => {
      component.eliminarGuiaGrr(0);

      expect(component.guiasGrr.length).toBe(1);
      expect(component.form.get('guiasremitente').value).toEqual(['GRR-002']);
    });

    it('limpiarTodasLasGuiasGrr debe vaciar las guías', () => {
      component.limpiarTodasLasGuiasGrr();

      expect(component.guiasGrr).toEqual([]);
      expect(component.guias).toEqual([]);
      expect(component.form.get('guiasremitente').value).toEqual([]);
    });

    it('actualizarGuiaGrr debe rechazar un nroGrr vacío', () => {
      const guia = { nroGrr: '   ', nroDocumento: '', editando: true };

      component.actualizarGuiaGrr(guia);

      expect(messageServiceSpy.add).toHaveBeenCalledWith(
        jasmine.objectContaining({ severity: 'warn' }),
      );
      expect(guia.editando).toBeTrue();
    });
  });

  describe('Etiquetas', () => {
    it('agregaretiqueta debe agregar una entrada de tipo Bulto cuando idtipoetiqueta=2', () => {
      component.model = { idtipoetiqueta: 2, cantidadetiqueta: 5 };

      component.agregaretiqueta();

      expect(component.etiquetas).toEqual([
        { idtipoetiqueta: 2, tipo: 'Bulto', cantidad: 5 },
      ]);
    });

    it('agregaretiqueta debe agregar Paleta cuando idtipoetiqueta!=2', () => {
      component.model = { idtipoetiqueta: 1, cantidadetiqueta: 3 };

      component.agregaretiqueta();

      expect(component.etiquetas[0].tipo).toBe('Paleta');
    });

    it('eliminaretiqueta debe quitar el índice indicado', () => {
      component.etiquetas = [
        { idtipoetiqueta: 1, tipo: 'Paleta', cantidad: 1 },
        { idtipoetiqueta: 2, tipo: 'Bulto', cantidad: 2 },
      ];

      component.eliminaretiqueta(0);

      expect(component.etiquetas.length).toBe(1);
      expect(component.etiquetas[0].tipo).toBe('Bulto');
    });
  });

  describe('numberOnly', () => {
    it('debe permitir dígitos', () => {
      expect(component.numberOnly({ which: 53 } as any)).toBeTrue(); // '5'
    });

    it('debe rechazar letras', () => {
      expect(component.numberOnly({ which: 65 } as any)).toBeFalse(); // 'A'
    });
  });

  describe('Caso de uso: registrar OT', () => {
    it('no debe registrar si no hay OR vinculada y no se marcó "sin recojo"', () => {
      llenarFormularioValido();
      component.sinRecojo = false;
      component.orVinculada = null;

      component.registrar();

      expect(component.orTouched).toBeTrue();
      expect(confirmationServiceSpy.confirm).not.toHaveBeenCalled();
      expect(ordenTransporteServiceSpy.registrarOT).not.toHaveBeenCalled();
    });

    it('no debe registrar si el formulario es inválido (debe marcar todos los campos como touched)', () => {
      component.sinRecojo = true; // saltar la validación de OR
      const markSpy = spyOn(component.form, 'markAllAsTouched').and.callThrough();

      component.registrar();

      expect(markSpy).toHaveBeenCalled();
      expect(confirmationServiceSpy.confirm).not.toHaveBeenCalled();
      expect(ordenTransporteServiceSpy.registrarOT).not.toHaveBeenCalled();
    });

    it('debe construir el modelo, confirmar y registrar correctamente con OR vinculada', () => {
      llenarFormularioValido();
      component.sinRecojo = false;
      component.orVinculada = { idordentrabajo: 555, numcp: 'OR-555' };
      component.guiasGrr = [
        { nroGrr: 'GRR-001', nroDocumento: 'DOC-1', editando: false },
        { nroGrr: 'GRR-002', nroDocumento: '', editando: false },
      ];
      component.etiquetas = [{ idtipoetiqueta: 1, tipo: 'Paleta', cantidad: 2 }];

      // Capturar el callback `accept` y dispararlo manualmente.
      confirmationServiceSpy.confirm.and.callFake((opts: any) => opts.accept());
      ordenTransporteServiceSpy.registrarOT.and.returnValue(
        of({ validado: true, idordentrabajo: 1234, numcp: 'OT-1234' } as any),
      );
      spyOn(window, 'open');

      component.registrar();

      expect(confirmationServiceSpy.confirm).toHaveBeenCalled();
      expect(ordenTransporteServiceSpy.registrarOT).toHaveBeenCalledTimes(1);

      const modelEnviado = ordenTransporteServiceSpy.registrarOT.calls.mostRecent().args[0];
      expect(modelEnviado.responsablecomercialid).toBe(fakeUser.id);
      expect(modelEnviado.idusuarioregistro).toBe(fakeUser.id);
      expect(modelEnviado.idestacionorigen).toBe(fakeUser.idestacionorigen);
      expect(modelEnviado.tipoorden).toBe(1);
      expect(modelEnviado.idorvinculada).toBe(555);
      expect(modelEnviado.guiasremitente).toEqual([
        { nroGrr: 'GRR-001', nroDocumento: 'DOC-1' },
        { nroGrr: 'GRR-002', nroDocumento: '' },
      ]);
      expect(modelEnviado.etiquetas).toEqual([
        { idtipoetiqueta: 1, tipo: 'Paleta', cantidad: 2 },
      ]);

      expect(messageServiceSpy.add).toHaveBeenCalledWith(
        jasmine.objectContaining({ severity: 'success' }),
      );
      // Se abren reportes (ot + etiquetas).
      expect(window.open).toHaveBeenCalledTimes(2);
      // El formulario debe quedar habilitado tras una respuesta válida.
      expect(component.form.disabled).toBeFalse();
    });

    it('debe registrar cuando se marca "sin recojo" y enviar idorvinculada=null', () => {
      llenarFormularioValido();
      component.sinRecojo = true;
      component.orVinculada = null;

      confirmationServiceSpy.confirm.and.callFake((opts: any) => opts.accept());
      ordenTransporteServiceSpy.registrarOT.and.returnValue(
        of({ validado: true, idordentrabajo: 9, numcp: 'OT-9' } as any),
      );
      spyOn(window, 'open');

      component.registrar();

      const modelEnviado = ordenTransporteServiceSpy.registrarOT.calls.mostRecent().args[0];
      expect(modelEnviado.idorvinculada).toBeNull();
      expect(ordenTransporteServiceSpy.registrarOT).toHaveBeenCalledTimes(1);
    });

    it('debe mostrar advertencia y rehabilitar el formulario cuando el backend devuelve validado=false', () => {
      llenarFormularioValido();
      component.sinRecojo = true;

      confirmationServiceSpy.confirm.and.callFake((opts: any) => opts.accept());
      ordenTransporteServiceSpy.registrarOT.and.returnValue(
        of({ validado: false, mensaje: 'Cliente sin crédito' } as any),
      );

      component.registrar();

      expect(messageServiceSpy.add).toHaveBeenCalledWith(
        jasmine.objectContaining({ severity: 'warn' }),
      );
      expect(component.form.disabled).toBeFalse();
    });

    it('no debe llamar al backend si el usuario cancela la confirmación', () => {
      llenarFormularioValido();
      component.sinRecojo = true;

      // No invocamos `accept` → simulamos que el usuario rechaza la confirmación.
      confirmationServiceSpy.confirm.and.callFake(() => confirmationServiceSpy);

      component.registrar();

      expect(confirmationServiceSpy.confirm).toHaveBeenCalled();
      expect(ordenTransporteServiceSpy.registrarOT).not.toHaveBeenCalled();
    });
  });

  describe('buscarOr', () => {
    it('con criterio < 3 chars y sin cliente, debe avisar y no abrir el diálogo', () => {
      component.numBusquedaOr = 'AB';
      component.form.patchValue({ idcliente: null });

      component.buscarOr();

      expect(messageServiceSpy.add).toHaveBeenCalledWith(
        jasmine.objectContaining({ severity: 'warn' }),
      );
      expect(dialogServiceSpy.open).not.toHaveBeenCalled();
    });

    it('con criterio >= 3 chars debe consultar por numcp y abrir el diálogo', () => {
      component.numBusquedaOr = 'OR1';
      const fakeRef = { onClose: of(null) } as DynamicDialogRef;
      dialogServiceSpy.open.and.returnValue(fakeRef);
      recojoServiceSpy.buscarOrPorNumcp.and.returnValue(of([{ idordentrabajo: 1, numcp: 'OR1' }]));

      component.buscarOr();

      expect(recojoServiceSpy.buscarOrPorNumcp).toHaveBeenCalledWith('OR1');
      expect(dialogServiceSpy.open).toHaveBeenCalled();
    });

    it('al cerrar el diálogo con un item, debe asignarlo a orVinculada', () => {
      component.numBusquedaOr = 'OR1';
      const item = { idordentrabajo: 77, numcp: 'OR-77' };
      const fakeRef = { onClose: of(item) } as DynamicDialogRef;
      dialogServiceSpy.open.and.returnValue(fakeRef);
      recojoServiceSpy.buscarOrPorNumcp.and.returnValue(of([item]));

      component.buscarOr();

      expect(component.orVinculada).toEqual({ idordentrabajo: 77, numcp: 'OR-77' });
    });
  });
});
