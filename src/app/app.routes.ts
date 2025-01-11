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
                  {
                    path: 'vistamanifiesto/:id',
                    loadComponent: () => import('./modules/admin/trafico/vistamanifiestos/vistamanifiestos.component')
                                          .then(m => m.VistamanifiestosComponent)
                  },
                  {
                    path: 'vistarepartidor/:id/:uid',
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
                    path: 'listadoordentransporte',
                    loadComponent: () => import('./modules/admin/recepcion/ordentransporte/seguimientoot/seguimientoot.component')
                                          .then(m => m.SeguimientootComponent)
                  },
                  {
                    path: 'confirmarentregas',
                    loadComponent: () => import('./modules/admin/trafico/confirmarentrega/confirmarentrega.component')
                                          .then(m => m.ConfirmarentregaComponent)
                  }
                 
                ]
              },
              {
                path: 'seguimiento',
                loadComponent: () => import('./modules/admin/recepcion/recepcion.component')
                                      .then(m => m.RecepcionComponent),
                children: [
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
                 
                ]
              },
              {
                path: 'mantenimiento',
                loadComponent: () => import('./modules/admin/mantenimiento/mantenimiento.component')
                                      .then(m => m.MantenimientoComponent),
                children: [
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
                 
                ]
              },
        ]
    }
];
