import { Component, OnInit } from '@angular/core';
import { User } from 'app/core/user/user.types';
import { MantenimientoService } from 'app/modules/admin/mantenimiento/mantenimiento.service';
import { OrdenTransporteService } from 'app/modules/admin/recepcion/ordentransporte/ordentransporte.service';
import { TraficoService } from 'app/modules/admin/trafico/trafico.service';
import { SelectItem, MessageService, ConfirmationService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig, DialogService } from 'primeng/dynamicdialog';
import { PlanningService } from '../../planning.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-asignar-tipooperacion-local',
  templateUrl: './asignar-tipooperacion-local.component.html',
  styleUrls: ['./asignar-tipooperacion-local.component.css'],
    standalone: true,
    imports: [
      CommonModule,
      FormsModule,
      DropdownModule,
      ButtonModule,
      ToastModule
    ],
    providers: [
      ConfirmationService,
      DialogService,
      MessageService
    ]
})
export class AsignarTipooperacionLocalComponent implements OnInit {

 cars: any[];
  model: any = {};
  tiposunidad: SelectItem[] = [];
  estaciones: SelectItem[] = [];
  agencias: SelectItem[] = [];
  repartidores: SelectItem[] = [];
  proveedoresDestino: SelectItem[] = [];
  ubigeoDestino: SelectItem[] = [];
  direcciones: any[] = [];

  user: User ;
  distrito: string;

  constructor(private ordenService: OrdenTransporteService,
              private planningService: PlanningService,
              private mantenimientoService: MantenimientoService,
              public ref: DynamicDialogRef,
              private messageService: MessageService,
              private traficoService: TraficoService,
              public config: DynamicDialogConfig) {
       }

  ngOnInit() {


    this.ordenService.getUbigeo('').subscribe(resp => {

      resp.forEach(element => {
          this.ubigeoDestino.push({ value: element.idDistrito ,  label : element.ubigeo});
        });
  
      });

    this.user = JSON.parse(localStorage.getItem('user'));
    this.model.idplanificador = this.user.id;

    this.ordenService.getValorTabla(23).subscribe(resp => {
      resp.forEach(element => {
        this.tiposunidad.push({ value: element.idValorTabla ,  label : element.valor});
      });
    });


    this.planningService.GetAllEstaciones().subscribe(resp => {
      resp.forEach(element => {
        this.estaciones.push({ value: element.idEstacion ,  label : element.estacionOrigen});
      });
    });


    // this.ordenService.getValorTabla(24).subscribe(resp => {
    //   resp.forEach(element => {
    //     this.agencias.push({ value: element.idValorTabla ,  label : element.valor});
    //   });
    // });

    
    this.traficoService.getProveedores("", 24669).subscribe(resp => {
      resp.forEach(element => {
        this.agencias.push({ value: element.idProveedor ,  label : element.razonSocial.toUpperCase() });
      });
    });


    this.mantenimientoService.getProveedores("", 21514).subscribe(resp => {

      console.log('repartidor', resp);

      resp.forEach(element => {
        this.repartidores.push({ value: element.idProveedor ,  label : element.razonSocial  +   ' - '   +    element.ruc});
      });
    });



  }
  cancelar() {
    this.ref.close();
  }
  mostrarDireccion() {
      // this.ordenService.getProveedor(this.model.idrepartidor).subscribe(x=> {

      //   console.log(x, 'res');

      //   this.distrito = x.distrito;

      // });
  }
  guardar() {

      this.model.ids = this.config.data.ids.map(obj => obj.idordentrabajo).join(',');

      if(this.model.idtipooperacion === undefined)
      {
         
          return;
      }


    if(this.model.idtipooperacion=== 18139) {
      if(this.model.idrepartidor === undefined)   {
      
          return;
      }
    }



    if(this.model.idtipooperacion=== 123) {
      if(this.model.idagencia === undefined)   {
       
          return;
      }
    }





      this.planningService.asignarTipoOperacionLocal(this.model ).subscribe( x=> {

      

        this.ref.close(x);

      })
  }
  compararDestinos() {


    this.traficoService.getDireccionesProveedor(this.model.idrepartidor ).subscribe(response=>  {


      this.direcciones = [];
      this.model.iddireccion = null;

      
      console.log('respuesta' ,  response.direcciones );
   
           

            response.direcciones.forEach(element => {
              this.direcciones.push({ value: element.iddireccion ,  label : element.direccion });
            });

      //  this.messageService.add({ severity: 'warn', summary: 'Generación de Manifiesto', detail: 'El destino del manifiesto no le corresponde al proveedor seleccionado.' });

       // this.ubigeoDestino

    });

     
  }

  cargarProveedores() {

    this.proveedoresDestino = this.repartidores;

    this.model.IdDestinatario = null;

    this.traficoService.getProveedorxDireccion(this.model.iddestino ).subscribe(response =>  {
      console.log('bd',response.proveedores);


     // this.direcciones = [];
      this.model.iddireccion = null;

      const proveedoresFiltered = this.proveedoresDestino.filter(c => 
          response.proveedores.some(p => p.idProveedor === c.value)
       );


      console.log('proveedores',proveedoresFiltered);


      if (proveedoresFiltered.length > 0) {
        this.proveedoresDestino = proveedoresFiltered; // Asigna solo los destinos válidos
      }
      else {
     //   this.messageService.add({ severity: 'warn', summary: 'Generación de Manifiesto', detail: 'El destino seleccionado no tiene proveedores asociados.' });
      }

    });
  }
}

