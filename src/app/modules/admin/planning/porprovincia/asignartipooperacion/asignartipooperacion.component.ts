import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from 'app/core/user/user.types';
import { MantenimientoService } from 'app/modules/admin/mantenimiento/mantenimiento.service';
import { OrdenTransporteService } from 'app/modules/admin/recepcion/ordentransporte/ordentransporte.service';
import { TraficoService } from 'app/modules/admin/trafico/trafico.service';
import { MessageService, SelectItem } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { PlanningService } from '../../planning.service';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-asignartipooperacion',
  templateUrl: './asignartipooperacion.component.html',
  styleUrls: ['./asignartipooperacion.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    ButtonModule,
    ToastModule
  ],
  providers: [
    MessageService
  ]
})
export class AsignartipooperacionComponent implements OnInit {
  model: any = {};
  tiposunidad: SelectItem[] = [];
  estaciones: SelectItem[] = [];
  agencias: SelectItem[] = [];
  repartidores: SelectItem[] = [];
  proveedoresDestino: SelectItem[] = [];
  ubigeoDestino: SelectItem[] = [];
  direcciones: any[] = [];

  user: User;

  constructor(
    private ordenService: OrdenTransporteService,
    private planningService: PlanningService,
    private mantenimientoService: MantenimientoService,
    public ref: DynamicDialogRef,
    private traficoService: TraficoService,
    public config: DynamicDialogConfig
  ) {}

  ngOnInit(): void {
    this.cargarUbigeoDestino();
    this.cargarUsuario();
    this.cargarTiposUnidad();
    this.cargarEstaciones();
    this.cargarAgencias();
    this.cargarRepartidores();
  }

  cancelar() {
    this.ref.close();
  }

  guardar() {

      this.model.ids =  this.config.data.ids;

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





      this.planningService.asignarTipoOperacion(this.model ).subscribe( x=> {

      

        this.ref.close(x);

      })
  }

  compararDestinos() {
    this.traficoService.getDireccionesProveedor(this.model.idrepartidor ).subscribe(response=>  {
      this.direcciones = [];
      this.model.iddireccion = null;
            response.direcciones.forEach(element => {
        this.direcciones.push({ value: element.iddireccion ,  label : element.direccion });
      });

   

    });
  }

  cargarProveedores() {
    this.proveedoresDestino = this.repartidores;

    this.model.IdDestinatario = null;
    this.model.idrepartidor = null; // Limpiar selección de repartidor

    this.traficoService.getProveedorxDireccion(this.model.iddestino ).subscribe(response =>  {


     // this.direcciones = [];
      this.model.iddireccion = null;

      const proveedoresFiltered = this.proveedoresDestino.filter(c => 
          response.proveedores.some(p => p.idProveedor === c.value)
       );



      if (proveedoresFiltered.length > 0) {
        this.proveedoresDestino = proveedoresFiltered; // Asigna solo los destinos válidos
      }
      else {
        // Si no hay proveedores asociados, dejar el listado en blanco
        this.proveedoresDestino = [];
        this.model.idrepartidor = null; // Limpiar selección de repartidor
     //   this.messageService.add({ severity: 'warn', summary: 'Generación de Manifiesto', detail: 'El destino seleccionado no tiene proveedores asociados.' });
      }

    });
  }

  private cargarUbigeoDestino(): void {
    this.ordenService.getUbigeo('').subscribe(resp => {
      resp.forEach(element => {
        this.ubigeoDestino.push({ value: element.idDistrito ,  label : element.ubigeo});
      });
    });
  }

  private cargarUsuario(): void {
    this.user = JSON.parse(localStorage.getItem('user'));
    this.model.idusuariocreacion = this.user.id;
  }

  private cargarTiposUnidad(): void {
    this.ordenService.getValorTabla(23).subscribe(resp => {
      resp.forEach(element => {
        this.tiposunidad.push({ value: element.idValorTabla ,  label : element.valor});
      });
    });
  }

  private cargarEstaciones(): void {
    this.planningService.GetAllEstaciones().subscribe(resp => {
      resp.forEach(element => {
        this.estaciones.push({ value: element.idEstacion ,  label : element.estacionOrigen});
      });
    });
  }

  private cargarAgencias(): void {
    this.ordenService.getValorTabla(24).subscribe(resp => {
      resp.forEach(element => {
        this.agencias.push({ value: element.idValorTabla ,  label : element.valor});
      });
    });
  }

  private cargarRepartidores(): void {
    this.mantenimientoService.getProveedores("", 21514).subscribe(resp => {
      resp.forEach(element => {
        this.repartidores.push({ value: element.idProveedor ,  label : element.razonSocial  +   ' - '   +    element.ruc});
      });
    });
  }
}

