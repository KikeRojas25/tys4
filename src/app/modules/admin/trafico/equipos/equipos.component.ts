import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { DragDropModule } from 'primeng/dragdrop';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Router, ActivatedRoute } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { TraficoService } from '../trafico.service';
import { MantenimientoService } from '../../mantenimiento/mantenimiento.service';
import { FilterProvinciaPipe } from './FilterProvinciaPipe.pipe';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageModule } from "primeng/message";
import { ToastModule } from 'primeng/toast';
import { Provincia } from '../../mantenimiento/mantenimiento.types';
import { EquipoProvincia } from '../trafico.types';

@Component({
  selector: 'app-equipos',
  templateUrl: './equipos.component.html',
  styleUrls: ['./equipos.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    CardModule,
    ButtonModule,
    FilterProvinciaPipe,
    InputTextModule,
    FormsModule,
    ConfirmDialogModule,
    MessageModule,
    ToastModule
],
  providers: [
     ConfirmationService
    ,MessageService
    ,DialogService
  ]
})
export class EquiposComponent implements OnInit {

  filtroProvincia: string = '';

  currentDraggedProvincia: Provincia | null = null;
  currentDraggedFromEquipo: EquipoProvincia | null = null;


  todasProvincias: Provincia[] = [];
  

  equipos: EquipoProvincia[] = [
    { idEquipo: 21490, equipo: 'Equipo 1', provincias: [] },
    { idEquipo: 21491, equipo: 'Equipo 2', provincias: [] },
    { idEquipo: 21492, equipo: 'Equipo 3', provincias: [] },
    { idEquipo: 24275, equipo: 'Equipo 4', provincias: [] },
  ];


  constructor( private router: Router,
      private activatedRoute: ActivatedRoute,
      private confirmationService: ConfirmationService ,
      private messageService: MessageService,
      private mantenimientoService: MantenimientoService,
      public dialogService: DialogService,
      private traficoService: TraficoService) { }
  ngOnInit() {
      this.cargarProvincias();
      this.cargarDatos();

    
  }


  cargarDatos() {


    this.traficoService.getEquiposConProvincias().subscribe((res: any[]) => {
      this.equipos = res;

      console.log(this.equipos);

    });
  }

 cargarProvincias() {
    this.mantenimientoService.getProvincias().subscribe({
      next: (data) => this.todasProvincias = data,
      error: (err) => console.error('Error al obtener provincias', err)
    });
  }


  get provinciasAsignadas(): Provincia[] {
    return this.equipos.flatMap((e) => e.provincias).filter((p) => !!p);
  }

  get provinciasDisponibles(): Provincia[] {
    const asignadasIds = this.provinciasAsignadas.map((p) => p.idProvincia);
    return this.todasProvincias.filter((p) => !asignadasIds.includes(p.idProvincia));
  }

onDragStart(prov: Provincia, fromEquipo?: EquipoProvincia) {
  this.currentDraggedProvincia = prov;
  this.currentDraggedFromEquipo = fromEquipo ?? null;
}

onDragEnd() {
  this.currentDraggedProvincia = null;
  this.currentDraggedFromEquipo = null;
}

confirmarAsignacion() {
  this.confirmationService.confirm({
    message: '¿Deseas guardar esta asignación?',
    header: 'Confirmación',
    icon: 'pi pi-question-circle',
    accept: () => {
      this.guardarAsignaciones();
    }
  });
}

guardarAsignaciones() {
  let totalSolicitudes = this.equipos.length;
  let exitosas = 0;

  this.equipos.forEach(equipo => {
    const provinciasIds = (equipo.provincias ?? [])
      .filter(p => p && p.idProvincia) // Evita elementos nulos o sin id
      .map(p => p.idProvincia);

    const payload = {
      IdEquipo: equipo.idEquipo,
      provincias: provinciasIds
    };

    this.traficoService.guardarEquipoProvincia(payload).subscribe({
      next: () => {
        exitosas++;
        if (exitosas === totalSolicitudes) {
          this.messageService.add({
            severity: 'success',
            summary: 'Asignación completada',
            detail: 'Todas las provincias fueron asignadas correctamente.'
          });
        }
      },
      error: (err) => {
        console.error(`Error al guardar asignación del equipo ${equipo.idEquipo}:`, err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `No se pudo guardar la asignación del equipo ${equipo.idEquipo}.`
        });
      }
    });
  });
}
onDrop(targetEquipo: EquipoProvincia) {
  const prov = this.currentDraggedProvincia;

  if (!prov || !targetEquipo) {
    this.onDragEnd();
    return;
  }

  // Asegura que targetEquipo.provincias esté definido
  if (!Array.isArray(targetEquipo.provincias)) {
    targetEquipo.provincias = [];
  }

  // Asegura que el objeto currentDraggedFromEquipo tenga provincias
  if (this.currentDraggedFromEquipo && Array.isArray(this.currentDraggedFromEquipo.provincias)) {
    this.currentDraggedFromEquipo.provincias = this.currentDraggedFromEquipo.provincias.filter(
      p => p.idProvincia !== prov.idProvincia
    );
  }

  // Verifica que no se repita
  const yaExiste = targetEquipo.provincias.some(p => p?.idProvincia === prov.idProvincia);
  if (!yaExiste) {
    targetEquipo.provincias.push(prov);
  }

  this.onDragEnd();
}

removerProvincia(idEquipo: number, idProvincia: number) {

  console.log('Removiendo provincia:', this.equipos);
  this.confirmationService.confirm({
    message: '¿Está seguro que desea quitar esta provincia del equipo?',
    header: 'Confirmar',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      const equipo = this.equipos.find(e => e.idEquipo === idEquipo);
      
      console.log('Equipo encontrado:', equipo);

      if (!equipo || !equipo.provincias) return;
      equipo.provincias = equipo.provincias.filter(p => p.idProvincia !== idProvincia);
    }
  });
}
getCantidadProvincias(equipo: EquipoProvincia): number {
  return (equipo.provincias ?? []).filter(p => p && p.idProvincia).length;
}

}