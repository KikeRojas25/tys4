import { Injectable } from '@angular/core';
import { FuseNavigationItem } from '@fuse/components/navigation';
import { FuseMockApiService } from '@fuse/lib/mock-api';
import {
    compactNavigation,
    defaultNavigation,
    futuristicNavigation,
    horizontalNavigation,
} from 'app/mock-api/common/navigation/data';
import { cloneDeep } from 'lodash-es';

@Injectable({ providedIn: 'root' })
export class NavigationMockApi {
    private  _compactNavigation: FuseNavigationItem[] = []
    private readonly _defaultNavigation: FuseNavigationItem[] =
        defaultNavigation;
    private readonly _futuristicNavigation: FuseNavigationItem[] =
        futuristicNavigation;
    private readonly _horizontalNavigation: FuseNavigationItem[] =
        horizontalNavigation;

    /**
     * Constructor
     */
    constructor(private _fuseMockApiService: FuseMockApiService) {
        // Register Mock API handlers
        this.registerHandlers();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Register Mock API handlers
     */
    registerHandlers(): void {
        // -----------------------------------------------------------------------------------------------------
        // @ Navigation - GET
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService.onGet('api/common/navigation').reply(() => {
            this._compactNavigation = [];
            const menu = JSON.parse(localStorage.getItem('menu'));


                menu.forEach((resp) => {
                    this._compactNavigation.push({
                        id: resp.pag_str_codmenu,
                        title: resp.pag_str_nombre,
                        type: 'aside',
                        icon: resp.icono,
                        idpadre : resp.pag_str_codmenu_padre,
                        visible: true,
                        children: []

                    });
                });


            // Fill compact navigation children using the default navigation
            this._compactNavigation.forEach((compactNavItem) => {
                   menu.forEach((defaultNavItem) => {

                   
                    if ( defaultNavItem.pag_str_codmenu === compactNavItem.id  )
                    {
                       
                        defaultNavItem.submenu.forEach((el) => {
                            //if(el.visible === true ){
                            compactNavItem.children.push({
                                id: el.pag_str_codmenu,
                                title: el.pag_str_nombre,
                                type: 'basic',
                                icon: el.pag_str_icono,
                                idpadre : el.pag_str_codmenu_padre,
                                link: el.pag_str_url
                            });
                        //  }
                        });
                      

                        //compactNavItem.children = cloneDeep(defaultNavItem.submenu);

                    }
                });
            });

            // Fill futuristic navigation children using the default navigation
            // this._futuristicNavigation.forEach((futuristicNavItem) => {
            //     this._defaultNavigation.forEach((defaultNavItem) => {
            //         if ( defaultNavItem.id === futuristicNavItem.id )
            //         {
            //             futuristicNavItem.children = cloneDeep(defaultNavItem.children);
            //         }
            //     });
            // });

            // Fill horizontal navigation children using the default navigation
            // this._horizontalNavigation.forEach((horizontalNavItem) => {
            //     this._defaultNavigation.forEach((defaultNavItem) => {
            //         if ( defaultNavItem.id === horizontalNavItem.id )
            //         {
            //             horizontalNavItem.children = cloneDeep(defaultNavItem.children);
            //         }
            //     });
            // });

            // Return the response



            return [
                200,
                {
                    compact   : cloneDeep(this._compactNavigation),
                    default   : cloneDeep(this._compactNavigation),
                    futuristic: cloneDeep(this._compactNavigation),
                    horizontal: cloneDeep(this._compactNavigation)
                }
            ];
        });
    }
}
