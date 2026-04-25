/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    },
    {
        id   : 'planning',
        title: 'Despacho',
        type : 'aside',
        icon : 'heroicons_outline:truck',
        children: [
            {
                id   : 'estacion',
                title: 'Ver Estaciones',
                type : 'basic',
                icon : 'heroicons_outline:map-pin',
                link : '/planning/estacion'
            },
            {
                id   : 'leadtime-operativo',
                title: 'Lead Time Operativo',
                type : 'basic',
                icon : 'heroicons_outline:clock',
                link : '/planning/leadtime-operativo'
            }
        ]
    },
    {
        id   : 'comercial',
        title: 'Comercial',
        type : 'aside',
        icon : 'heroicons_outline:briefcase',
        children: [
            {
                id       : 'leadtimes',
                title    : 'Lead Times',
                type     : 'collapsable',
                icon     : 'heroicons_outline:clock',
                children : [
                    {
                        id   : 'leadtimes.comercial',
                        title: 'Comercial',
                        type : 'basic',
                        icon : 'heroicons_outline:user-group',
                        link : '/comercial/leadtimes'
                    },
                    {
                        id   : 'leadtimes.operativo',
                        title: 'Operativo',
                        type : 'basic',
                        icon : 'heroicons_outline:truck',
                        link : '/comercial/leadtimes/operativo'
                    }
                ]
            }
        ]
    },
    {
        id   : 'compras',
        title: 'Compras',
        type : 'aside',
        icon : 'heroicons_outline:shopping-cart',
        children: [
            {
                id   : 'liquidacioncajachica',
                title: 'Liquidación Caja Chica',
                type : 'basic',
                icon : 'heroicons_outline:currency-dollar',
                link : '/compras/liquidacioncajachica'
            },
            {
                id   : 'masterliquidaciones',
                title: 'Master Liquidaciones',
                type : 'basic',
                icon : 'heroicons_outline:clipboard-document-list',
                link : '/compras/master-liquidaciones'
            }
        ]
    }
];
export const compactNavigation: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    },
    {
        id   : 'planning',
        title: 'Despacho',
        type : 'aside',
        icon : 'heroicons_outline:truck',
        children: [
            {
                id   : 'estacion',
                title: 'Ver Estaciones',
                type : 'basic',
                icon : 'heroicons_outline:map-pin',
                link : '/planning/estacion'
            },
            {
                id   : 'leadtime-operativo',
                title: 'Lead Time Operativo',
                type : 'basic',
                icon : 'heroicons_outline:clock',
                link : '/planning/leadtime-operativo'
            }
        ]
    },
    {
        id   : 'comercial',
        title: 'Comercial',
        type : 'aside',
        icon : 'heroicons_outline:briefcase',
        children: [
            {
                id       : 'leadtimes',
                title    : 'Lead Times',
                type     : 'collapsable',
                icon     : 'heroicons_outline:clock',
                children : [
                    {
                        id   : 'leadtimes.comercial',
                        title: 'Comercial',
                        type : 'basic',
                        icon : 'heroicons_outline:user-group',
                        link : '/comercial/leadtimes'
                    },
                    {
                        id   : 'leadtimes.operativo',
                        title: 'Operativo',
                        type : 'basic',
                        icon : 'heroicons_outline:truck',
                        link : '/comercial/leadtimes/operativo'
                    }
                ]
            }
        ]
    },
    {
        id   : 'compras',
        title: 'Compras',
        type : 'aside',
        icon : 'heroicons_outline:shopping-cart',
        children: [
            {
                id   : 'liquidacioncajachica',
                title: 'Liquidación Caja Chica',
                type : 'basic',
                icon : 'heroicons_outline:currency-dollar',
                link : '/compras/liquidacioncajachica'
            },
            {
                id   : 'masterliquidaciones',
                title: 'Master Liquidaciones',
                type : 'basic',
                icon : 'heroicons_outline:clipboard-document-list',
                link : '/compras/master-liquidaciones'
            }
        ]
    }
];
export const futuristicNavigation: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    },
    {
        id   : 'planning',
        title: 'Despacho',
        type : 'aside',
        icon : 'heroicons_outline:truck',
        children: [
            {
                id   : 'estacion',
                title: 'Ver Estaciones',
                type : 'basic',
                icon : 'heroicons_outline:map-pin',
                link : '/planning/estacion'
            },
            {
                id   : 'leadtime-operativo',
                title: 'Lead Time Operativo',
                type : 'basic',
                icon : 'heroicons_outline:clock',
                link : '/planning/leadtime-operativo'
            }
        ]
    },
    {
        id   : 'comercial',
        title: 'Comercial',
        type : 'aside',
        icon : 'heroicons_outline:briefcase',
        children: [
            {
                id       : 'leadtimes',
                title    : 'Lead Times',
                type     : 'collapsable',
                icon     : 'heroicons_outline:clock',
                children : [
                    {
                        id   : 'leadtimes.comercial',
                        title: 'Comercial',
                        type : 'basic',
                        icon : 'heroicons_outline:user-group',
                        link : '/comercial/leadtimes'
                    },
                    {
                        id   : 'leadtimes.operativo',
                        title: 'Operativo',
                        type : 'basic',
                        icon : 'heroicons_outline:truck',
                        link : '/comercial/leadtimes/operativo'
                    }
                ]
            }
        ]
    },
    {
        id   : 'compras',
        title: 'Compras',
        type : 'aside',
        icon : 'heroicons_outline:shopping-cart',
        children: [
            {
                id   : 'liquidacioncajachica',
                title: 'Liquidación Caja Chica',
                type : 'basic',
                icon : 'heroicons_outline:currency-dollar',
                link : '/compras/liquidacioncajachica'
            },
            {
                id   : 'masterliquidaciones',
                title: 'Master Liquidaciones',
                type : 'basic',
                icon : 'heroicons_outline:clipboard-document-list',
                link : '/compras/master-liquidaciones'
            }
        ]
    }
];
export const horizontalNavigation: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    },
    {
        id   : 'planning',
        title: 'Despacho',
        type : 'aside',
        icon : 'heroicons_outline:truck',
        children: [
            {
                id   : 'estacion',
                title: 'Ver Estaciones',
                type : 'basic',
                icon : 'heroicons_outline:map-pin',
                link : '/planning/estacion'
            },
            {
                id   : 'leadtime-operativo',
                title: 'Lead Time Operativo',
                type : 'basic',
                icon : 'heroicons_outline:clock',
                link : '/planning/leadtime-operativo'
            }
        ]
    },
    {
        id   : 'comercial',
        title: 'Comercial',
        type : 'aside',
        icon : 'heroicons_outline:briefcase',
        children: [
            {
                id       : 'leadtimes',
                title    : 'Lead Times',
                type     : 'collapsable',
                icon     : 'heroicons_outline:clock',
                children : [
                    {
                        id   : 'leadtimes.comercial',
                        title: 'Comercial',
                        type : 'basic',
                        icon : 'heroicons_outline:user-group',
                        link : '/comercial/leadtimes'
                    },
                    {
                        id   : 'leadtimes.operativo',
                        title: 'Operativo',
                        type : 'basic',
                        icon : 'heroicons_outline:truck',
                        link : '/comercial/leadtimes/operativo'
                    }
                ]
            }
        ]
    },
    {
        id   : 'compras',
        title: 'Compras',
        type : 'aside',
        icon : 'heroicons_outline:shopping-cart',
        children: [
            {
                id   : 'liquidacioncajachica',
                title: 'Liquidación Caja Chica',
                type : 'basic',
                icon : 'heroicons_outline:currency-dollar',
                link : '/compras/liquidacioncajachica'
            },
            {
                id   : 'masterliquidaciones',
                title: 'Master Liquidaciones',
                type : 'basic',
                icon : 'heroicons_outline:clipboard-document-list',
                link : '/compras/master-liquidaciones'
            }
        ]
    }
];
