import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { OrdenTransporteService } from 'app/modules/admin/recepcion/ordentransporte/ordentransporte.service';
import { TraficoService } from 'app/modules/admin/trafico/trafico.service';
import { SelectItem } from 'primeng/api';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { User } from 'app/core/user/user.types';

interface Despacho {
  numDespacho: string;
  tipoUnidad: string;
  planificador: string;
  estado: string;
  fechaRegistro: Date;
  peso: number;
  volumen: number;
  subtotal: number;
}

interface OrdenTransporte {
  idordentrabajo: number;
  numordentrabajo: string;
  razonsocial: string;
  destino: string;
  peso?: number;
  bultos?: number;
  subtotal?: number;
  tipooperacion?: string;
  proveedor?: string;
}

interface GrupoOTs {
  tipoOperacion: string;
  repartidor: string;
  ots: OrdenTransporte[];
  totalPeso: number;
  totalBultos: number;
  totalSubtotal: number;
}

interface Etapa {
  id: number;
  idDespacho: string; // Número de despacho al que pertenece
  nombre: string;
  descripcion: string;
  orden: number;
  tipoOperacion?: number;
  tipoOperacionLabel?: string;
  // OTs seleccionadas
  otsSeleccionadas?: OrdenTransporte[];
  // Datos de proveedor
  idRemitente?: number;
  remitenteLabel?: string;
  idDestinatario?: number;
  destinatarioLabel?: string;
  idDireccion?: number;
  direccionLabel?: string;
  // Datos de agencia (si tipoOperacion === 123)
  pesoAgencia?: number;
  bultoAgencia?: number;
  nroFactura?: string;
  consignadoAgencia?: string;
  claveAgencia?: string;
  nroRemito?: string;
  costoEnvio?: number;
  idAgencia?: number;
  agenciaLabel?: string;
}

@Component({
  selector: 'app-despachos-generados',
  templateUrl: './despachos-generados.component.html',
  styleUrls: ['./despachos-generados.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIcon,
    RouterModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    CalendarModule,
    DropdownModule,
    InputNumberModule,
    CheckboxModule,
    RadioButtonModule
  ]
})
export class DespachosGeneradosComponent implements OnInit {
  despachos: Despacho[] = [];
  todasLasEtapas: Etapa[] = []; // Todas las etapas de todos los despachos
  etapas: Etapa[] = []; // Etapas filtradas del despacho seleccionado
  cols: any[] = [];
  colsEtapas: any[] = [];
  tiposOperacion: SelectItem[] = [];
  
  despachoSeleccionado: Despacho | null = null;
  mostrarAgregarEtapa = false;
  nuevaEtapa: Etapa = {
    id: 0,
    idDespacho: '',
    nombre: '',
    descripcion: '',
    orden: 0,
    tipoOperacion: undefined,
    tipoOperacionLabel: '',
    otsSeleccionadas: []
  };
  origenNuevaEtapa: 'nueva' | 'etapa' | 'grupo' = 'nueva'; // Origen de la nueva etapa
  etapaOrigenSeleccionada: Etapa | null = null; // Etapa anterior seleccionada
  grupoOrigenSeleccionado: GrupoOTs | null = null; // Grupo seleccionado
  otsParaNuevaEtapa: OrdenTransporte[] = []; // OTs disponibles para la nueva etapa

  // Datos para formularios
  otsDisponibles: OrdenTransporte[] = [];
  proveedores: SelectItem[] = [];
  proveedoresDestino: SelectItem[] = [];
  direcciones: SelectItem[] = [];
  agencias: SelectItem[] = [];
  etapaExpandida: number | null = null; // ID de la etapa que está expandida
  user: User;
  idcargaEspecifico: number | null = null; // ID del despacho específico cuando viene desde otra pantalla
  mostrarTablaDespachos: boolean = true; // Controla si se muestra la tabla de despachos
  gruposOTs: GrupoOTs[] = []; // OTs agrupadas por tipo operación y repartidor
  gruposExpandidos: Set<string> = new Set(); // Claves de grupos expandidos (formato: "tipoOperacion|repartidor")

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private ordenService: OrdenTransporteService,
    private traficoService: TraficoService
  ) {}

  ngOnInit() {
    // Configurar columnas de despachos
    this.cols = [
      { field: 'numDespacho', header: 'N° Despacho', width: '150px' },
      { field: 'tipoUnidad', header: 'Tipo de Unidad', width: '120px' },
      { field: 'planificador', header: 'Planificador', width: '200px' },
      { field: 'estado', header: 'Estado', width: '120px' },
      { field: 'fechaRegistro', header: 'Fecha de Registro', width: '150px' },
      { field: 'peso', header: 'Peso', width: '100px' },
      { field: 'volumen', header: 'Volumen', width: '100px' },
      { field: 'subtotal', header: 'SubTotal', width: '120px' },
      { field: 'acciones', header: 'ACCIONES', width: '150px' }
    ];

    // Configurar columnas de etapas
    this.colsEtapas = [
      { field: 'orden', header: 'Orden', width: '80px' },
      { field: 'nombre', header: 'Nombre', width: '200px' },
      { field: 'descripcion', header: 'Descripción', width: '250px' },
      { field: 'tipoOperacion', header: 'Tipo de Operación', width: '200px' },
      { field: 'acciones', header: 'Acciones', width: '120px' }
    ];

    // Cargar tipos de operación
    this.ordenService.getValorTabla(23).subscribe(resp => {
      resp.forEach(element => {
        this.tiposOperacion.push({ value: element.idValorTabla, label: element.valor });
      });
    });

    // Cargar usuario
    this.user = JSON.parse(localStorage.getItem('user'));

    // Leer query params para ver si viene un idcarga específico
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['idcarga']) {
        this.idcargaEspecifico = +params['idcarga'];
        this.mostrarTablaDespachos = false;
        this.cargarDespachoEspecifico(this.idcargaEspecifico);
      } else {
        this.cargarTodosLosDespachos();
      }
    });

    // Cargar proveedores (repartidores)
    this.traficoService.getProveedores("", 21514).subscribe(resp => {
      resp.forEach(element => {
        this.proveedores.push({ value: element.idProveedor, label: element.razonSocial + ' - ' + element.ruc });
      });
      this.proveedoresDestino = [...this.proveedores];
    });

    // Cargar agencias
    this.traficoService.getProveedores("", 24669).subscribe(resp => {
      resp.forEach(element => {
        this.agencias.push({ value: element.idProveedor, label: element.razonSocial.toUpperCase() });
      });
    });

    // Data ficticia de etapas (inicialmente vacía)
    this.todasLasEtapas = [];
    this.etapas = [];
  }

  cargarDespachoEspecifico(idcarga: number) {
    // Cargar el despacho específico desde el servicio
    this.ordenService.GetAllCargasTemporal(1, this.user.idestacionorigen).subscribe(list => {
      // Buscar el despacho con el idcarga específico
      const despachoEncontrado = list.find(d => d.idcarga === idcarga);
      
      if (despachoEncontrado) {
        // Mapear el despacho al formato esperado
        // El objeto puede tener campos adicionales como 'estado' aunque no esté en la interfaz
        const despachoMapeado: Despacho = {
          numDespacho: despachoEncontrado.numcarga || '',
          tipoUnidad: despachoEncontrado.tipounidad || '',
          planificador: despachoEncontrado.planificador || '',
          estado: (despachoEncontrado as any).estado || 'Pendiente',
          fechaRegistro: despachoEncontrado.fecharegistro ? new Date(despachoEncontrado.fecharegistro) : new Date(),
          peso: despachoEncontrado.peso || 0,
          volumen: despachoEncontrado.vol || 0,
          subtotal: despachoEncontrado.subtotal || 0
        };
        
        this.despachos = [despachoMapeado];
        // Seleccionar automáticamente el despacho
        this.despachoSeleccionado = despachoMapeado;
        
        // Crear la primera etapa automáticamente si el despacho está planificado
        this.crearPrimeraEtapa(despachoMapeado);
        
        this.filtrarEtapasPorDespacho(despachoMapeado.numDespacho);
        // Cargar OTs del despacho
        this.cargarOTsDelDespacho();
      }
    });
  }

  crearPrimeraEtapa(despacho: Despacho) {
    // Verificar si ya existe una etapa para este despacho
    const etapaExistente = this.todasLasEtapas.find(e => e.idDespacho === despacho.numDespacho && e.orden === 1);
    
    if (!etapaExistente && despacho.estado === 'Planificada') {
      // Crear la primera etapa basada en la planificación inicial
      const primeraEtapa: Etapa = {
        id: this.todasLasEtapas.length > 0 ? Math.max(...this.todasLasEtapas.map(e => e.id)) + 1 : 1,
        idDespacho: despacho.numDespacho,
        nombre: 'Planificación Inicial',
        descripcion: `Etapa inicial de planificación del despacho ${despacho.numDespacho}. Tipo de unidad: ${despacho.tipoUnidad}. Planificador: ${despacho.planificador}`,
        orden: 1,
        tipoOperacion: undefined,
        tipoOperacionLabel: '',
        otsSeleccionadas: []
      };
      
      // Agregar a todas las etapas
      this.todasLasEtapas.push(primeraEtapa);
    }
  }

  cargarTodosLosDespachos() {
    // Data ficticia de despachos (mantener para cuando no hay idcarga específico)
    const todosLosDespachos = [
      {
        numDespacho: 'OC01-195402',
        tipoUnidad: '5TN',
        planificador: 'Joan Velasquez',
        estado: 'Planificada',
        fechaRegistro: new Date('2025-11-14'),
        peso: 5197.5,
        volumen: 0,
        subtotal: 5808.15
      },
      {
        numDespacho: 'OC01-194706',
        tipoUnidad: '5TN',
        planificador: 'Joan Velasquez',
        estado: 'Pendiente',
        fechaRegistro: new Date('2025-10-28'),
        peso: 638,
        volumen: 0,
        subtotal: 2710.22
      },
      {
        numDespacho: 'OC01-194085',
        tipoUnidad: '1.5',
        planificador: 'Johnny Jesus Vargas Anticona',
        estado: 'Pendiente',
        fechaRegistro: new Date('2025-10-14'),
        peso: 1558,
        volumen: 0,
        subtotal: 1806.61
      },
      {
        numDespacho: 'OC01-190710',
        tipoUnidad: '15TN',
        planificador: 'Joan Velasquez',
        estado: 'Planificada',
        fechaRegistro: new Date('2025-07-22'),
        peso: 8158.68,
        volumen: 3.52,
        subtotal: 19155.16
      },
      {
        numDespacho: 'OC01-190706',
        tipoUnidad: '15TN',
        planificador: 'Joan Velasquez',
        estado: 'Planificada',
        fechaRegistro: new Date('2025-07-22'),
        peso: 574.71,
        volumen: 0,
        subtotal: 461.14
      },
      {
        numDespacho: 'OC01-190547',
        tipoUnidad: '15TN',
        planificador: 'Joan Velasquez',
        estado: 'Planificada',
        fechaRegistro: new Date('2025-07-17'),
        peso: 2227.55,
        volumen: 0,
        subtotal: 1810.23
      }
    ];

    // Filtrar solo despachos con estado "Planificada"
    this.despachos = todosLosDespachos.filter(despacho => despacho.estado === 'Planificada');
  }

  onDespachoSelect(event: any) {
    if (event && event.data) {
      this.despachoSeleccionado = event.data;
      
      // Crear la primera etapa automáticamente si el despacho está planificado
      this.crearPrimeraEtapa(event.data);
      
      this.filtrarEtapasPorDespacho(event.data.numDespacho);
      // Cargar OTs del despacho
      this.cargarOTsDelDespacho();
    } else {
      this.despachoSeleccionado = null;
      this.etapas = [];
    }
  }

  onDespachoUnselect() {
    this.despachoSeleccionado = null;
    this.etapas = [];
    this.mostrarAgregarEtapa = false;
  }

  filtrarEtapasPorDespacho(numDespacho: string) {
    // Filtrar etapas que pertenecen al despacho seleccionado
    this.etapas = this.todasLasEtapas.filter(etapa => etapa.idDespacho === numDespacho);
    // Ordenar por orden
    this.etapas.sort((a, b) => a.orden - b.orden);
  }

  cargarOTsDelDespacho() {
    if (!this.despachoSeleccionado) return;
    
    // Si tenemos un idcarga específico, cargar las OTs desde el servicio
    if (this.idcargaEspecifico) {
      this.ordenService.GetAllOrdersCargasTemporal(this.idcargaEspecifico).subscribe(resp => {
        this.otsDisponibles = resp.map(ot => ({
          idordentrabajo: ot.idordentrabajo,
          numordentrabajo: ot.numcp || '',
          razonsocial: ot.razonsocial || '',
          destino: ot.destino || '',
          peso: ot.peso || 0,
          bultos: ot.bulto || 0,
          subtotal: ot.subtotal || 0,
          tipooperacion: ot.tipooperacion || '',
          proveedor: ot.proveedor || ''
        }));
        // Agrupar las OTs
        this.agruparOTs();
        // Asignar OTs a la primera etapa si existe
        this.asignarOTsAPrimeraEtapa();
      });
    } else {
      // Datos ficticios para ejemplo cuando no hay idcarga específico
      this.otsDisponibles = [
        { idordentrabajo: 1, numordentrabajo: 'OT-001', razonsocial: 'Cliente 1', destino: 'Lima', peso: 100, bultos: 5, subtotal: 500, tipooperacion: 'Distribución', proveedor: 'Repartidor A' },
        { idordentrabajo: 2, numordentrabajo: 'OT-002', razonsocial: 'Cliente 2', destino: 'Arequipa', peso: 200, bultos: 10, subtotal: 1000, tipooperacion: 'Distribución', proveedor: 'Repartidor A' },
        { idordentrabajo: 3, numordentrabajo: 'OT-003', razonsocial: 'Cliente 3', destino: 'Trujillo', peso: 150, bultos: 7, subtotal: 750, tipooperacion: 'Recojo', proveedor: 'Repartidor B' },
        { idordentrabajo: 4, numordentrabajo: 'OT-004', razonsocial: 'Cliente 4', destino: 'Cusco', peso: 80, bultos: 3, subtotal: 400, tipooperacion: '', proveedor: '' }
      ];
      // Agrupar las OTs
      this.agruparOTs();
      // Asignar OTs a la primera etapa si existe
      this.asignarOTsAPrimeraEtapa();
    }
  }

  asignarOTsAPrimeraEtapa() {
    if (!this.despachoSeleccionado || this.otsDisponibles.length === 0) return;
    
    // Buscar la primera etapa del despacho
    const primeraEtapa = this.todasLasEtapas.find(
      e => e.idDespacho === this.despachoSeleccionado.numDespacho && e.orden === 1
    );
    
    if (primeraEtapa && (!primeraEtapa.otsSeleccionadas || primeraEtapa.otsSeleccionadas.length === 0)) {
      // Asignar todas las OTs a la primera etapa
      primeraEtapa.otsSeleccionadas = [...this.otsDisponibles];
    }
  }

  agruparOTs() {
    const gruposMap = new Map<string, GrupoOTs>();
    
    // Agrupar OTs por tipo de operación y repartidor
    this.otsDisponibles.forEach(ot => {
      const tipoOperacion = ot.tipooperacion || 'No Asignado';
      const repartidor = ot.proveedor || 'No Asignado';
      const clave = `${tipoOperacion}|${repartidor}`;
      
      if (!gruposMap.has(clave)) {
        gruposMap.set(clave, {
          tipoOperacion: tipoOperacion,
          repartidor: repartidor,
          ots: [],
          totalPeso: 0,
          totalBultos: 0,
          totalSubtotal: 0
        });
      }
      
      const grupo = gruposMap.get(clave)!;
      grupo.ots.push(ot);
      grupo.totalPeso += ot.peso || 0;
      grupo.totalBultos += ot.bultos || 0;
      grupo.totalSubtotal += ot.subtotal || 0;
    });
    
    // Convertir el Map a array y ordenar
    this.gruposOTs = Array.from(gruposMap.values());
    
    // Ordenar: primero los asignados (con tipo operación y repartidor), luego los no asignados
    this.gruposOTs.sort((a, b) => {
      const aAsignado = a.tipoOperacion !== 'No Asignado' && a.repartidor !== 'No Asignado';
      const bAsignado = b.tipoOperacion !== 'No Asignado' && b.repartidor !== 'No Asignado';
      
      if (aAsignado && !bAsignado) return -1;
      if (!aAsignado && bAsignado) return 1;
      
      // Si ambos están asignados o ambos no, ordenar por tipo operación y luego por repartidor
      if (a.tipoOperacion !== b.tipoOperacion) {
        return a.tipoOperacion.localeCompare(b.tipoOperacion);
      }
      return a.repartidor.localeCompare(b.repartidor);
    });
  }

  getClaveGrupo(grupo: GrupoOTs): string {
    return `${grupo.tipoOperacion}|${grupo.repartidor}`;
  }

  toggleGrupo(grupo: GrupoOTs) {
    const clave = this.getClaveGrupo(grupo);
    if (this.gruposExpandidos.has(clave)) {
      this.gruposExpandidos.delete(clave);
    } else {
      this.gruposExpandidos.add(clave);
    }
  }

  isGrupoExpandido(grupo: GrupoOTs): boolean {
    return this.gruposExpandidos.has(this.getClaveGrupo(grupo));
  }

  expandirEtapa(etapa: Etapa) {
    if (this.etapaExpandida === etapa.id) {
      this.etapaExpandida = null;
    } else {
      this.etapaExpandida = etapa.id;
      // Cargar OTs si no están cargadas
      if (this.otsDisponibles.length === 0) {
        this.cargarOTsDelDespacho();
      } else if (this.gruposOTs.length === 0) {
        // Si las OTs están cargadas pero no agrupadas, agruparlas
        this.agruparOTs();
      }
    }
  }

  toggleOTEnEtapa(etapa: Etapa, ot: OrdenTransporte) {
    if (!etapa.otsSeleccionadas) {
      etapa.otsSeleccionadas = [];
    }
    const index = etapa.otsSeleccionadas.findIndex(o => o.idordentrabajo === ot.idordentrabajo);
    if (index > -1) {
      etapa.otsSeleccionadas.splice(index, 1);
    } else {
      etapa.otsSeleccionadas.push({ ...ot });
    }
  }

  isOTSeleccionada(etapa: Etapa, ot: OrdenTransporte): boolean {
    return etapa.otsSeleccionadas?.some(o => o.idordentrabajo === ot.idordentrabajo) || false;
  }

  cargarProveedoresPorDestino(etapa: Etapa) {
    // Esta función se llamará cuando cambie el destino
    // Por ahora solo reseteamos direcciones
    this.direcciones = [];
    etapa.idDireccion = undefined;
    etapa.direccionLabel = '';
  }

  compararDestinos(etapa: Etapa) {
    if (!etapa.idDestinatario) return;
    
    this.traficoService.getDireccionesProveedor(etapa.idDestinatario).subscribe(response => {
      this.direcciones = [];
      etapa.idDireccion = undefined;
      etapa.direccionLabel = '';
      
      response.direcciones.forEach(element => {
        this.direcciones.push({ value: element.iddireccion, label: element.direccion });
      });
    });
  }

  esDistribucionPorAgencia(tipoOperacion: number): boolean {
    return tipoOperacion === 123;
  }

  eliminarDespacho(despacho: Despacho) {
    const index = this.despachos.indexOf(despacho);
    if (index > -1) {
      this.despachos.splice(index, 1);
    }
  }

  confirmarDespacho(despacho: Despacho) {
    console.log('Confirmar despacho:', despacho);
    // Lógica para confirmar despacho
  }

  verDespacho(despacho: Despacho) {
    console.log('Ver despacho:', despacho);
    // Lógica para ver detalles del despacho
  }

  agregarEtapa() {
    if (!this.despachoSeleccionado) {
      alert('Por favor, seleccione un despacho primero');
      return;
    }
    this.mostrarAgregarEtapa = true;
    this.origenNuevaEtapa = 'nueva';
    this.etapaOrigenSeleccionada = null;
    this.grupoOrigenSeleccionado = null;
    this.otsParaNuevaEtapa = [];
    const nuevoId = this.todasLasEtapas.length > 0 ? Math.max(...this.todasLasEtapas.map(e => e.id)) + 1 : 1;
    this.nuevaEtapa = {
      id: nuevoId,
      idDespacho: this.despachoSeleccionado.numDespacho,
      nombre: '',
      descripcion: '',
      orden: this.etapas.length + 1,
      tipoOperacion: undefined,
      tipoOperacionLabel: '',
      otsSeleccionadas: []
    };
    // Cargar OTs del despacho
    this.cargarOTsDelDespacho();
    // Inicializar OTs para nueva etapa
    this.otsParaNuevaEtapa = [...this.otsDisponibles];
  }

  onOrigenNuevaEtapaChange() {
    this.etapaOrigenSeleccionada = null;
    this.grupoOrigenSeleccionado = null;
    this.otsParaNuevaEtapa = [];
    this.nuevaEtapa.otsSeleccionadas = [];
    
    if (this.origenNuevaEtapa === 'nueva') {
      // Cargar todas las OTs disponibles
      if (this.otsDisponibles.length === 0) {
        this.cargarOTsDelDespacho();
      }
      setTimeout(() => {
        this.otsParaNuevaEtapa = [...this.otsDisponibles];
      }, 100);
    }
  }

  onEtapaOrigenSeleccionada() {
    if (this.etapaOrigenSeleccionada && this.etapaOrigenSeleccionada.otsSeleccionadas) {
      // Cargar las OTs de la etapa seleccionada
      this.otsParaNuevaEtapa = [...this.etapaOrigenSeleccionada.otsSeleccionadas];
      // Pre-seleccionar todas las OTs
      this.nuevaEtapa.otsSeleccionadas = [...this.otsParaNuevaEtapa];
      // Pre-llenar el tipo de operación si existe
      if (this.etapaOrigenSeleccionada.tipoOperacion) {
        this.nuevaEtapa.tipoOperacion = this.etapaOrigenSeleccionada.tipoOperacion;
      }
    }
  }

  onGrupoOrigenSeleccionado() {
    if (this.grupoOrigenSeleccionado) {
      // Cargar las OTs del grupo seleccionado
      this.otsParaNuevaEtapa = [...this.grupoOrigenSeleccionado.ots];
      // Pre-seleccionar todas las OTs
      this.nuevaEtapa.otsSeleccionadas = [...this.otsParaNuevaEtapa];
    }
  }

  toggleOTParaNuevaEtapa(ot: OrdenTransporte) {
    if (!this.nuevaEtapa.otsSeleccionadas) {
      this.nuevaEtapa.otsSeleccionadas = [];
    }
    const index = this.nuevaEtapa.otsSeleccionadas.findIndex(o => o.idordentrabajo === ot.idordentrabajo);
    if (index > -1) {
      this.nuevaEtapa.otsSeleccionadas.splice(index, 1);
    } else {
      this.nuevaEtapa.otsSeleccionadas.push({ ...ot });
    }
  }

  isOTSeleccionadaParaNuevaEtapa(ot: OrdenTransporte): boolean {
    return this.nuevaEtapa.otsSeleccionadas?.some(o => o.idordentrabajo === ot.idordentrabajo) || false;
  }

  getOpcionesEtapas(): SelectItem[] {
    return this.etapas.map(e => ({
      value: e,
      label: `${e.orden}. ${e.nombre} - ${e.tipoOperacionLabel || 'Sin tipo'}`
    }));
  }

  getOpcionesGrupos(): SelectItem[] {
    return this.gruposOTs.map(g => ({
      value: g,
      label: `${g.tipoOperacion} | ${g.repartidor} (${g.ots.length} OTs)`
    }));
  }

  guardarEtapa() {
    if (!this.nuevaEtapa.nombre || !this.nuevaEtapa.descripcion || !this.nuevaEtapa.tipoOperacion) {
      alert('Por favor, complete todos los campos requeridos');
      return;
    }
    if (!this.despachoSeleccionado) {
      alert('Por favor, seleccione un despacho primero');
      return;
    }
    if (!this.nuevaEtapa.otsSeleccionadas || this.nuevaEtapa.otsSeleccionadas.length === 0) {
      alert('Por favor, seleccione al menos una OT para la etapa');
      return;
    }

    // Obtener el label del tipo de operación seleccionado
    const tipoOperacionSeleccionado = this.tiposOperacion.find(t => t.value === this.nuevaEtapa.tipoOperacion);
    this.nuevaEtapa.tipoOperacionLabel = tipoOperacionSeleccionado ? tipoOperacionSeleccionado.label : '';

    // Agregar a todas las etapas
    this.todasLasEtapas.push({ ...this.nuevaEtapa });
    
    // Actualizar la lista filtrada
    this.filtrarEtapasPorDespacho(this.despachoSeleccionado.numDespacho);
    
    this.mostrarAgregarEtapa = false;
    this.origenNuevaEtapa = 'nueva';
    this.etapaOrigenSeleccionada = null;
    this.grupoOrigenSeleccionado = null;
    this.otsParaNuevaEtapa = [];
    this.nuevaEtapa = {
      id: 0,
      idDespacho: '',
      nombre: '',
      descripcion: '',
      orden: 0,
      tipoOperacion: undefined,
      tipoOperacionLabel: '',
      otsSeleccionadas: []
    };
  }

  cancelarAgregarEtapa() {
    this.mostrarAgregarEtapa = false;
    this.origenNuevaEtapa = 'nueva';
    this.etapaOrigenSeleccionada = null;
    this.grupoOrigenSeleccionado = null;
    this.otsParaNuevaEtapa = [];
    this.nuevaEtapa = {
      id: 0,
      idDespacho: '',
      nombre: '',
      descripcion: '',
      orden: 0,
      tipoOperacion: undefined,
      tipoOperacionLabel: '',
      otsSeleccionadas: []
    };
  }

  eliminarEtapa(etapa: Etapa) {
    // Eliminar de todas las etapas
    const indexTodas = this.todasLasEtapas.findIndex(e => e.id === etapa.id);
    if (indexTodas > -1) {
      this.todasLasEtapas.splice(indexTodas, 1);
    }
    
    // Actualizar la lista filtrada
    if (this.despachoSeleccionado) {
      this.filtrarEtapasPorDespacho(this.despachoSeleccionado.numDespacho);
      // Reordenar
      this.etapas.forEach((e, i) => {
        e.orden = i + 1;
      });
    }
  }

  agregarEtapaDesdeDespacho(despacho: Despacho) {
    console.log('Agregar etapa desde despacho:', despacho);
    // Seleccionar el despacho automáticamente
    this.despachoSeleccionado = despacho;
    this.filtrarEtapasPorDespacho(despacho.numDespacho);
    // Mostrar el formulario
    this.agregarEtapa();
    // Scroll hacia la sección de etapas
    setTimeout(() => {
      const etapasSection = document.querySelector('.card:last-child');
      if (etapasSection) {
        etapasSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }
}

