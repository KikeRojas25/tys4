import { Route } from '@angular/router';
import { initialDataResolver } from 'app/app.resolvers';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';

// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [

    // Redirect empty path to '/example'
    {path: '', pathMatch : 'full', redirectTo: 'example'},

    // Redirect signed-in user to the '/example'
    //
    // After the user signs in, the sign-in page will redirect the user to the 'signed-in-redirect'
    // path. Below is another redirection for that path to redirect the user to the desired
    // location. This is a small convenience to keep all main routes together here on this file.
    {path: 'signed-in-redirect', pathMatch : 'full', redirectTo: 'example'},

    // Auth routes for guests
    {
        path: '',
        canActivate: [NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'confirmation-required', loadChildren: () => import('app/modules/auth/confirmation-required/confirmation-required.routes')},
            {path: 'forgot-password', loadChildren: () => import('app/modules/auth/forgot-password/forgot-password.routes')},
            {path: 'reset-password', loadChildren: () => import('app/modules/auth/reset-password/reset-password.routes')},
            {path: 'sign-in', loadChildren: () => import('app/modules/auth/sign-in/sign-in.routes')},
            {path: 'sign-up', loadChildren: () => import('app/modules/auth/sign-up/sign-up.routes')}
        ]
    },

    // Auth routes for authenticated users
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'sign-out', loadChildren: () => import('app/modules/auth/sign-out/sign-out.routes')},
            {path: 'unlock-session', loadChildren: () => import('app/modules/auth/unlock-session/unlock-session.routes')}
        ]
    },

    // Landing routes
    {
        path: '',
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'home', loadChildren: () => import('app/modules/landing/home/home.routes')},
        ]
    },

    // Admin routes
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            {
                path: 'example',
                loadComponent: () => import('app/modules/admin/example/example.component')
                  .then(m => m.ExampleComponent)
            },
            {
                path: 'trafico',
                loadComponent: () => import('./modules/admin/trafico/trafico.component')
                                      .then(m => m.TraficoComponent),
                children: [
                  {
                    path: 'integrado',
                    loadComponent: () => import('./modules/admin/trafico/integrado/integrado.component')
                                          .then(m => m.IntegradoComponent)
                  },
                  {
                    path: 'traficolocal',
                    loadComponent: () => import('./modules/admin/trafico/integradolocal/integradolocal.component')
                                          .then(m => m.IntegradolocalComponent)
                  },
                  // {
                  //   path: 'equipos',
                  //   loadComponent: () => import('./modules/admin/trafico/ equipos/equipos.component')
                  //                         .then(m => m.EquiposComponent)
                  // },
                  {
                    path: 'vistamanifiesto/:id',
                    loadComponent: () => import('./modules/admin/trafico/vistamanifiestos/vistamanifiestos.component')
                                          .then(m => m.VistamanifiestosComponent)
                  },
                  {
                    path: 'vistamanifiestolocal/:id',
                    loadComponent: () => import('./modules/admin/trafico/vistamanifiestolocal/vistamanifiestolocal.component')
                                          .then(m => m.VistamanifiestoLocalComponent)
                  },
                  {
                    // :idproveedor = primer segmento, :iddepartamento = segundo segmento
                    path: 'vistarepartidor/:idproveedor/:iddepartamento/:idprovincia',
                    loadComponent: () => import('./modules/admin/trafico/vistarepartidor/vistarepartidor.component')
                                          .then(m => m.VistarepartidorComponent)
                  },
                  {
                    // Compatibilidad: ruta antigua sin idprovincia
                    path: 'vistarepartidor/:idproveedor/:iddepartamento',
                    loadComponent: () => import('./modules/admin/trafico/vistarepartidor/vistarepartidor.component')
                                          .then(m => m.VistarepartidorComponent)
                  },
                  {
                    path: 'seguimientootr',
                    loadComponent: () => import('./modules/admin/trafico/ordentransporteremoto/list/list.component')
                                          .then(m => m.ListComponent)
                  },
                  {
                    path: 'nuevaotr',
                    loadComponent: () => import('./modules/admin/trafico/ordentransporteremoto/new/new.component')
                                          .then(m => m.NewComponent)
                  },
                  {
                    path: 'editarotr/:uid',
                    loadComponent: () => import('./modules/admin/trafico/ordentransporteremoto/edit/edit.component')
                                          .then(m => m.EditComponent)
                  },
                   {
                    path: 'equipos',
                    loadComponent: () => import('./modules/admin/trafico/equipos/equipos.component')
                                          .then(m => m.EquiposComponent)
                  }


                  //confirmarentregas

                 
                ]
              },
              {
                path: 'seguimientoot',
                loadComponent: () => import('./modules/admin/recepcion/recepcion.component')
                                      .then(m => m.RecepcionComponent),
                children: [
                  {
                    path: 'crearot',
                    loadComponent: () => import('./modules/admin/recepcion/ordentransporte/crearot/crearot.component')
                                          .then(m => m.CrearotComponent)
                  },
                  {
                    path: 'editarot/:uid',
                    loadComponent: () => import('./modules/admin/recepcion/ordentransporte/editarot/editarot.component')
                                          .then(m => m.EditarotComponent)
                  },
                  {
                    path: 'listadoordentransporte',
                    loadComponent: () => import('./modules/admin/recepcion/ordentransporte/seguimientoot/seguimientoot.component')
                                          .then(m => m.SeguimientootComponent)
                  },
                  {
                    path: 'listadoordentransportecomercial',
                    loadComponent: () => import('./modules/admin/recepcion/ordentransporte/seguimientootcomercial/seguimientootcomercial.component')
                                          .then(m => m.SeguimientootcomercialComponent)
                  },
                  {
                    path: 'detalleotcliente',
                    loadComponent: () => import('./modules/admin/recepcion/ordentransporte/detalleotcliente/detalleotcliente.component')
                                          .then(m => m.DetalleotclienteComponent)
                  },
                  {
                    path: 'integradocomercial',
                    loadComponent: () => import('./modules/admin/recojo/integrado/integrado.component')
                                          .then(m => m.IntegradoComponent)
                  },
                  
                  {
                    path: 'confirmarentregas',
                    loadComponent: () => import('./modules/admin/trafico/confirmarentrega/confirmarentrega.component')
                                          .then(m => m.ConfirmarentregaComponent)
                  },
                  {
                    path: 'listadoparaclientes',
                    loadComponent: () => import('./modules/admin/recepcion/ordentransporte/seguimientoclientes/seguimientoclientes.component')
                                          .then(m => m.SeguimientoclientesComponent)
                  },
                  {
                    path: 'detalleot/:uid',
                    loadComponent: () => import('./modules/admin/recepcion/ordentransporte/detalleot/detalleot.component')
                                          .then(m => m.DetalleotComponent)
                  },
                  {
                    path: 'trackingot',
                    loadComponent: () => import('./modules/admin/reportes/trackingot/trackingot.component')
                                          .then(m => m.TrackingotComponent)
                  }
                 
                ]
              },
              {
                path: 'seguimiento',
                loadComponent: () => import('./modules/admin/recepcion/recepcion.component')
                                      .then(m => m.RecepcionComponent),
                children: [
                     {
                    path: 'ordenrecojo',
                    loadComponent: () => import('./modules/admin/recojo/list/list.component')
                                          .then(m => m.listarOrdenRecojoComponent)
                  },
                      {
                    path: 'nuevaordenrecojo',
                    loadComponent: () => import('./modules/admin/recojo/new/new.component')
                                          .then(m => m.NuevaordenrecojoComponent)
                  },

                  {
                    path: 'editarordenrecojo/:id',
                    loadComponent: () => import('./modules/admin/recojo/edit/edit.component')
                                          .then(m => m.EditComponent)
                  },

                  {
                    path: 'generacionmanifiestos',
                    loadComponent: () => import('./modules/admin/recepcion/ordentransporte/generacionmanifiesto/generacionmanifiesto.component')
                                          .then(m => m.GeneracionmanifiestoComponent)
                  },
                  {
                    path: 'manifiestovirtual/:uid',
                    loadComponent: () => import('./modules/admin/recepcion/ordentransporte/generacionmanifiesto/manifiestovirtual/manifiestovirtual.component')
                                          .then(m => m.ManifiestovirtualComponent)
                  },
                  {
                    path: 'crearotmasiva',
                    loadComponent: () => import('./modules/admin/recepcion/ordentransporte/cargamasiva/cargamasiva.component')
                                          .then(m => m.CargamasivaComponent)
                  },
                 
                ]
              },
              {
                path: 'planning',
                loadComponent: () => import('./modules/admin/planning/planning.component')
                                      .then(m => m.PlanningComponent),
                children: [
                  {
                    path: 'agrupadoplanning',
                    loadComponent: () => import('./modules/admin/planning/pordepartamento/pordepartamento.component')
                                          .then(m => m.PordepartamentoComponent)
                  },
                  {
                    path: 'generarrutas/:uid',
                    loadComponent: () => import('./modules/admin/planning/porprovincia/porprovincia.component')
                                          .then(m => m.PorprovinciaComponent)
                  },
                  {
                    path: 'generarrutaslocal',
                    loadComponent: () => import('./modules/admin/planning/planninglocal/planninglocal.component')
                                          .then(m => m.PlanninglocalComponent)
                  },
                  {
                    path: 'generarrutaslocaldetalle/:uid',
                    loadComponent: () => import('./modules/admin/planning/planning-local-detalle/planning-local-detalle.component')
                                          .then(m => m.PlanningLocalDetalleComponent)
                  },
                  {
                    path: 'despachos-generados',
                    loadComponent: () => import('./modules/admin/planning/despachos-generados/despachos-generados.component')
                                          .then(m => m.DespachosGeneradosComponent)
                  },
                  {
                    path: 'estacion',
                    loadComponent: () => import('./modules/admin/planning/estacion/estacion.component')
                                          .then(m => m.PlanningEstacionComponent)
                  },
                  {
                    path: 'leadtime-operativo',
                    data: { mode: 'operativo' },
                    loadComponent: () => import('./modules/admin/comercial/leadtimes/list/list.component')
                                          .then(m => m.ListComponent)
                  },
                ]
              },

              {
                path: 'comercial',
                loadComponent: () => import('./modules/admin/comercial/comercial.component')
                                      .then(m => m.ComercialComponent),
                children: [
                  {
                    path: 'leadtimes',
                    loadComponent: () => import('./modules/admin/comercial/leadtimes/leadtimes.component')
                                          .then(m => m.LeadtimesComponent),
                    children: [
                      {
                        path: '',
                        pathMatch: 'full',
                        data: { mode: 'comercial' },
                        loadComponent: () => import('./modules/admin/comercial/leadtimes/list/list.component')
                                              .then(m => m.ListComponent)
                      },
                      {
                        path: 'operativo',
                        data: { mode: 'operativo' },
                        loadComponent: () => import('./modules/admin/comercial/leadtimes/list/list.component')
                                              .then(m => m.ListComponent)
                      }
                    ]
                  },
                  {
                    path: 'integrado-semaforo',
                    loadComponent: () => import('./modules/admin/recojo/integrado-semaforo/integrado-semaforo.component')
                                          .then(m => m.IntegradoSemaforoComponent)
                  },  
                  {
                    path: 'registro-citas',
                    loadComponent: () => import('./modules/admin/comercial/registro-citas/registro-citas.component')
                                          .then(m => m.RegistroCitasComponent)
                  },
                  {
                    path: 'seguimiento-reclamos',
                    loadComponent: () => import('./modules/admin/comercial/reclamos/seguimiento/seguimiento-reclamos.component')
                                          .then(m => m.SeguimientoReclamosComponent)
                  }
                ]
              },
              {
                 path : 'reportes', 
                 loadComponent: () => import('./modules/admin/reportes/reportes.component')
                 .then(m => m.ReportesComponent),
                 children: [
                  {
                    path: 'reportegeneral',
                    loadComponent: () => import('./modules/admin/reportes/reportegeneral/reportegeneral.component')
                                          .then(m => m.ReportegeneralComponent)
                  },
                  {
                    path: 'reportependientedespacho',
                    loadComponent: () => import('./modules/admin/reportes/pendientedespacho/pendientedespacho.component')
                                          .then(m => m.PendientedespachoComponent)
                  },
                  {
                    path: 'reportependienteentrega',
                    loadComponent: () => import('./modules/admin/reportes/pendienteentrega/pendienteentrega.component')
                                          .then(m => m.PendienteentregaComponent)
                  },
                    {
                    path: 'generaltrafico',
                    loadComponent: () => import('./modules/admin/reportes/generaltrafico/generaltrafico.component')
                                          .then(m => m.GeneraltraficoComponent)
                  },
                  {
                    path: 'reporteproduccionvsfacturacion',
                    loadComponent: () => import('./modules/admin/reportes/produccionvsfacturacion/produccionvsfacturacion.component')
                                          .then(m => m.ProduccionvsfacturacionComponent)
                  },
                  {
                    path: 'reporteproducxcliente',
                    loadComponent: () => import('./modules/admin/reportes/produccioncliente/produccioncliente.component')
                                          .then(m => m.ProduccionclienteComponent)
                  },
                  {
                    path: 'incidenciassinseguimiento',
                    loadComponent: () => import('./modules/admin/reportes/incidenciassinseguimiento/incidenciassinseguimiento.component')
                                          .then(m => m.IncidenciassinseguimientoComponent)
                  },
                  {
                    path: 'reportevalorizadohr',
                    loadComponent: () => import('./modules/admin/reportes/reportevalorizadohr/reportevalorizadohr.component')
                                          .then(m => m.ReportevalorizadohrComponent)
                  },
                 ]
              } ,
              {
                path: 'compras',
                loadComponent: () => import('./modules/admin/compras/compras.component')
                                      .then(m => m.ComprasComponent),
                children: [
                  {
                    path: 'liquidacioncajachica',
                    loadComponent: () => import('./modules/admin/compras/liquidacioncajachica/liquidacioncajachica.component')
                                          .then(m => m.LiquidacionCajaChicaComponent),
                    children: [
                      {
                        path: '',
                        pathMatch: 'full',
                        loadComponent: () => import('./modules/admin/compras/liquidacioncajachica/list/list.component')
                                              .then(m => m.LiquidacionCajaChicaListComponent)
                      },
                      {
                        path: 'nueva',
                        loadComponent: () => import('./modules/admin/compras/liquidacioncajachica/form/form.component')
                                              .then(m => m.LiquidacionCajaChicaFormComponent)
                      },
                      {
                        path: 'editar/:id',
                        loadComponent: () => import('./modules/admin/compras/liquidacioncajachica/form/form.component')
                                              .then(m => m.LiquidacionCajaChicaFormComponent)
                      },
                      {
                        path: 'detalle/:id',
                        loadComponent: () => import('./modules/admin/compras/liquidacioncajachica/detail/detail.component')
                                              .then(m => m.LiquidacionCajaChicaDetailComponent)
                      }
                    ]
                  }
                  ,
                  {
                    path: 'master-liquidaciones',
                    loadComponent: () => import('./modules/admin/compras/master-liquidaciones/master-liquidaciones.component')
                                          .then(m => m.MasterLiquidacionesComponent),
                    children: [
                      {
                        path: '',
                        pathMatch: 'full',
                        loadComponent: () => import('./modules/admin/compras/master-liquidaciones/list/list.component')
                                              .then(m => m.MasterLiquidacionesListComponent)
                      }
                    ]
                  }
                ]
              },
              {
                path: 'planning',
                loadComponent: () => import('./modules/admin/planning/planning.component')
                                      .then(m => m.PlanningComponent),
                children: [
                  {
                    path: 'agrupadoplanning',
                    loadComponent: () => import('./modules/admin/planning/pordepartamento/pordepartamento.component')
                                          .then(m => m.PordepartamentoComponent)
                  },
                  {
                    path: 'generarrutas/:uid',
                    loadComponent: () => import('./modules/admin/planning/porprovincia/porprovincia.component')
                                          .then(m => m.PorprovinciaComponent)
                  },
                  {
                    path: 'hojasruta',
                    loadComponent: () => import('./modules/admin/despacho/pordespachar/pordespachar.component')
                                          .then(m => m.PordespacharComponent)
                  },
                  {
                    path: 'confirmarrecepcion',
                    loadComponent: () => import('./modules/admin/despacho/recepcionar-ordentransporte/recepcionar-ordentransporte.component')
                                          .then(m => m.RecepcionarOrdentransporteComponent)
                  },
                  {
                    path: 'estacion',
                    loadComponent: () => import('./modules/admin/planning/estacion/estacion.component')
                                          .then(m => m.PlanningEstacionComponent)
                  },

                ]
              },
              {
                path: 'mantenimiento',
                loadComponent: () => import('./modules/admin/mantenimiento/mantenimiento.component')
                                      .then(m => m.MantenimientoComponent),
                children: [
                  {
                    path: 'cliente',
                    loadComponent: () => import('./modules/admin/mantenimiento/cliente/cliente.component')
                                          .then(m => m.ClienteComponent),
                    children: [
                      {  path: 'list',
                        loadComponent: () => import('./modules/admin/mantenimiento/cliente/list/list.component')
                                              .then(m => m.ListComponent),}
                    ]
                  },  
                  {
                    path: 'vehiculo',
                    loadComponent: () => import('./modules/admin/mantenimiento/vehiculo/vehiculo.component')
                                          .then(m => m.VehiculoComponent),
                    children: [
                      {  
                        path: 'list',
                        loadComponent: () => import('./modules/admin/mantenimiento/vehiculo/list/list.component')
                                              .then(m => m.ListComponent),}
                    ]
                  },
                  {
                    path: 'conductor',
                    loadComponent: () => import('./modules/admin/mantenimiento/conductor/conductor.component')
                                          .then(m => m.ConductorComponent),
                    children: [
                      {  
                        path: 'list',
                        loadComponent: () => import('./modules/admin/mantenimiento/conductor/list/list.component')
                                              .then(m => m.ListComponent),}
                    ]
                  },
                  {
                    path: 'estacion',
                    loadComponent: () => import('./modules/admin/mantenimiento/estacion/estacion.component')
                                          .then(m => m.EstacionComponent),
                    children: [
                      {  
                        path: 'list',
                        loadComponent: () => import('./modules/admin/mantenimiento/estacion/list/list.component')
                                              .then(m => m.ListComponent),},
                      {
                        path: 'manual',
                        loadComponent: () => import('./modules/admin/mantenimiento/estacion/manual/manual.component')
                                              .then(m => m.ManualComponent)
                      }
                    ]
                  },


                  {
                    path: 'listadoproveedores',
                    loadComponent: () => import('./modules/admin/mantenimiento/proveedor/listproveedor/listproveedor.component')
                                          .then(m => m.ListproveedorComponent)
                  },
                  {
                    path: 'nuevoproveedor',
                    loadComponent: () => import('./modules/admin/mantenimiento/proveedor/newproveedor/newproveedor.component')
                                          .then(m => m.NewproveedorComponent)
                  },
                  {
                    path: 'editarproveedor/:id',
                    loadComponent: () => import('./modules/admin/mantenimiento/proveedor/editproveedor/editproveedor.component')
                                          .then(m => m.EditproveedorComponent)
                  },
                  
                  {
                    path: 'precinto',
                    loadComponent: () => import('./modules/admin/mantenimiento/precinto/precinto.component')
                                          .then(m => m.PrecintoComponent)
                  },
                  {
                    path: 'tarifa',
                    loadComponent: () => import('./modules/admin/mantenimiento/tarifa/tarifa.component')
                                  .then(m => m.TarifaComponent),
                                  children: [
                                    {
                                      path: 'list',
                                      loadComponent: () => import('./modules/admin/mantenimiento/tarifa/list/list.component')
                                                            .then(m => m.ListComponent),
                                    },
                     ]
                  },
                  {
                    path: 'tarifa-ajustes',
                    loadComponent: () => import('./modules/admin/mantenimiento/tarifa-ajustes/tarifa-ajustes.component')
                                        .then(m => m.TarifaAjustesComponent),
                  },

                ]
              },
               {
              path: 'seguridad',
              loadComponent: () => import('./modules/admin/seguridad/seguridad.component')
                                    .then(m => m.SeguridadComponent),
              children: [
                {
                  path: 'listausuarios',
                  loadComponent: () => import('./modules/admin/seguridad/listuser/listuser.component')
                                        .then(m => m.ListuserComponent)
                },
                {
                  path: 'newusuario',
                  loadComponent: () => import('./modules/admin/seguridad/newuser/newuser.component')
                                        .then(m => m.NewuserComponent)
                },
                {
                  path: 'editusuario/:uid',
                  loadComponent: () => import('./modules/admin/seguridad/edituser/edituser.component')
                                        .then(m => m.EdituserComponent)
                }

              ]
            },
            {
              path: 'facturacion',
              loadComponent: () => import('./modules/admin/facturacion/facturacion.component')
                                    .then(m => m.FacturacionComponent),
              children: [
                {
                  path: 'generarpreliquidacion',
                  loadComponent: () => import('./modules/admin/facturacion/listpendientes/listpendientes.component')
                                        .then(m => m.ListpendientesComponent)
                },
                {
                  path: 'listarpreliquidacion',
                  loadComponent: () => import('./modules/admin/facturacion/listpreliquidaciones/listpreliquidaciones.component')
                                        .then(m => m.ListpreliquidacionesComponent)
                },
                {
                  path: 'listarcomprobantes',
                  loadComponent: () => import('./modules/admin/facturacion/listcomprobantes/listcomprobantes.component')
                                        .then(m => m.ListcomprobantesComponent)
                },
                {
                  path: 'nueva',
                  loadComponent: () => import('./modules/admin/facturacion/listpendientes/listpendientes.component')
                                        .then(m => m.ListpendientesComponent)
                },
                {
                  path: 'editar/:id',
                  loadComponent: () => import('./modules/admin/facturacion/editarpreliquidacion/editarpreliquidacion.component')
                                        .then(m => m.EditarpreliquidacionComponent)
                },
                {
                  path: 'listadodocumentos',
                  loadComponent: () => import('./modules/admin/facturacion/listadodocumentos/listadodocumentos.component')
                                        .then(m => m.ListadodocumentosComponent)
                }
              ]
            },
        ]
    }
];
