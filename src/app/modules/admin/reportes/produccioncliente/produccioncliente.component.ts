import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MessageService, SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService } from 'primeng/dynamicdialog';
import { ToastModule } from 'primeng/toast';
import { ReporteService } from '../reporte.service';
import { User } from 'app/core/user/user.types';

@Component({
  selector: 'app-produccioncliente',
  templateUrl: './produccioncliente.component.html',
  styleUrls: ['./produccioncliente.component.css'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ButtonModule,
    MatIcon,
    DropdownModule,
    CalendarModule,
    ToastModule,
  ],
  providers: [DialogService, MessageService],
})
export class ProduccionclienteComponent implements OnInit {
  clientes: SelectItem[] = [];
  unidadesMedida: SelectItem[] = [];

  model: any = {};
  user: User;
  es: any;

  dateInicio: Date = new Date(Date.now());
  dateFin: Date = new Date(Date.now());

  constructor(
    private reporteService: ReporteService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('user'));

    this.unidadesMedida = [
      { value: 1, label: 'Bulto' },
      { value: 2, label: 'Peso' },
      { value: 3, label: 'Valor' },
    ];
    // No seleccionar por defecto: obligar al usuario a elegir una unidad
    this.model.idunidadmedida = null;

    this.reporteService.getClientes(this.user?.idscliente).subscribe((resp) => {
      this.clientes = [{ value: '0', label: 'TODOS LOS CLIENTES' }];
      (resp ?? []).forEach((c) => {
        this.clientes.push({ value: c.idCliente, label: c.razonSocial });
      });
      this.model.idcliente = '0';
    });

    this.es = {
      firstDayOfWeek: 1,
      dayNames: [
        'domingo',
        'lunes',
        'martes',
        'miércoles',
        'jueves',
        'viernes',
        'sábado',
      ],
      dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
      dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
      monthNames: [
        'enero',
        'febrero',
        'marzo',
        'abril',
        'mayo',
        'junio',
        'julio',
        'agosto',
        'septiembre',
        'octubre',
        'noviembre',
        'diciembre',
      ],
      monthNamesShort: [
        'ene',
        'feb',
        'mar',
        'abr',
        'may',
        'jun',
        'jul',
        'ago',
        'sep',
        'oct',
        'nov',
        'dic',
      ],
      today: 'Hoy',
      clear: 'Borrar',
    };
  }

  buscar(): void {
    if (!this.dateInicio || !this.dateFin) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Filtro de búsqueda',
        detail: 'Seleccione un rango de fechas (Inicio y Fin).',
      });
      return;
    }

    const unidad = Number(this.model?.idunidadmedida);
    if (!Number.isFinite(unidad) || unidad <= 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Filtro de búsqueda',
        detail: 'Seleccione una unidad de medida.',
      });
      return;
    }

    let idcliente: any = this.model?.idcliente;
    if (idcliente === undefined || idcliente === '0' || idcliente === 0) {
      idcliente = '';
    }

    const fechainicio = this.dateInicio.toLocaleDateString();
    const fechafin = this.dateFin.toLocaleDateString();

    const url =
      'http://104.36.166.65/webreports/produccioncliente.aspx?idcliente=' +
      idcliente +
      '&fecinicio=' +
      fechainicio +
      '&fecfin=' +
      fechafin +
      '&idunidadmedida=' +
      unidad;

    window.open(url);
  }
}

