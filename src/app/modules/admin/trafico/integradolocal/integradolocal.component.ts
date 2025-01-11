import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TraficoService } from '../trafico.service';
import { User } from '../trafico.types';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';

@Component({
  selector: 'app-integradolocal',
  templateUrl: './integradolocal.component.html',
  styleUrls: ['./integradolocal.component.css'],
    standalone:true,
    imports: [
      TableModule,
      FormsModule,
      CommonModule,
      ButtonModule,
      MatIcon,
      PanelModule,
      TabViewModule,
      ProgressBarModule
    ],
})
export class IntegradolocalComponent implements OnInit {

 baseUrlHRu: string = 'http://104.36.166.65/webreports/hojaruta.aspx';

  cols: any[];
  cols2: any[];

  ordenes: any[];
  ordenes2: any[];
  user: User ;

  model: any = {};


  constructor(private traficoService: TraficoService,
    private router: Router,
  ) { }

  ngOnInit() {

    

    
  this.user = JSON.parse(localStorage.getItem('user'));

  console.log(this.user);

  this.model.idusuario = this.user.usr_int_id;
  this.model.idequipo = this.user.idEquipo;

    this.cols =
    [
        {header: 'ACCIONES', field: 'acciones'  ,  width: '6px' },
        {header: 'PROVEEDOR', field: 'proveedor'  ,  width: '120px' },
        {header: 'PLACA', field: 'placa'  ,  width: '60px' },
        {header: 'HR', field: 'numHojaRuta'  ,  width: '80px' },
        {header: 'F. DESPACHO', field: 'fechaDespacho'  ,  width: '20px' },
        {header: 'ORIGEN', field: 'origen' , width: '90px'  },
        {header: 'DESTINO', field: 'destino' , width: '90px'  },
        
        {header: '#OTS', field: 'cantidad' , width: '50px'  },
        {header: 'PESO', field: 'peso'  ,  width: '80px'  },

      
    ];


    this.cols2 =
    [
        {header: 'ACCIONES', field: 'acciones'  ,  width: '6px' },
        {header: 'DEPARTAMENTO', field: 'departamento'  ,  width: '100px'  },
        {header: 'PROVEEDOR', field: 'repartidor'  ,  width: '100px' },
        {header: '#OTS', field: 'cantidad' , width: '60px'  },
        {header: 'PESO', field: 'peso'  ,  width: '60px'  },
        {header: 'BULTOS', field: 'bulto'  , width: '60px'   },
      
        {header: '#OTS', field: 'cantidad' , width: '60px'  },
        {header: 'PESO', field: 'peso'  ,  width: '60px'  },
        {header: 'BULTOS', field: 'bulto'  , width: '60px'   },



    ];


     this.reload();


  }
  reload() {

    console.log('antes del envio:',this.model);


    this.traficoService.VerHojasRutaTrocalLocal(this.model).subscribe(list =>  {

      this.ordenes =  list;

      console.log('ordenes', this.ordenes);


    });

    // this.traficoService.VerDespachosxDepartamentoxProveedor(this.model).subscribe(list =>  {
    //   this.ordenes2 = list;

    //   console.log("por provincia:",this.ordenes2);

    // });


  }


  verHojaRuta(idDespacho: number): void {

    const url = `${this.baseUrlHRu}?iddespacho=${idDespacho}`;
    window.open(url, '_blank');
  
  }
    
  getIntegerPercentage(rowData: any): number {
    return Math.floor(rowData.porcentajeAvance);
  }

  getProgressBarStyle(porcentajeAvance: number): string {
    if (porcentajeAvance <= 30) {
      return 'rojo';
    } else if (porcentajeAvance <= 60) {
      return 'amarillo';
    } else {
      return 'verde';
    }
  }
  verDetalle(idhojaruta: number) {
    this.router.navigate(['/trafico/vistamanifiesto', idhojaruta]);
  }
  verRepartidor(idproveedor: number , iddepartamento: number ){
    this.router.navigate(['/trafico/vistarepartidor', idproveedor , iddepartamento]);
  }
}
