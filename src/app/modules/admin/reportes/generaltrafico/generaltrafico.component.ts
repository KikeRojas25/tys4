import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { User } from 'app/core/user/user.types';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessagesModule } from 'primeng/messages';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ReporteService } from '../reporte.service';

@Component({
  selector: 'app-generaltrafico',
  templateUrl: './generaltrafico.component.html',
  styleUrls: ['./generaltrafico.component.css'],
  standalone: true,
      imports:[
            FormsModule,
            CommonModule,
            TableModule,
            ButtonModule,
            InputTextModule,
            CheckboxModule,
            MatIcon,
            ConfirmDialogModule ,
            MessagesModule,
            ToastModule,
            DropdownModule,
            CalendarModule
          ],
          providers: [
            DialogService,
            ConfirmationService,
            MessageService
          ]
})
export class GeneraltraficoComponent implements OnInit {

  clientes: SelectItem[] = [];
  estaciones: SelectItem[] = [];
   model: any = [];
   user: User;
   es: any;
   dateInicio: Date = new Date(Date.now());
   dateFin: Date = new Date(Date.now());
 
   constructor(private reporteService: ReporteService) { }
 
   ngOnInit(): void {
     this.user = JSON.parse(localStorage.getItem('user'));
 
     this.reporteService.getClientes(this.user.idscliente).subscribe(resp => {
       this.clientes.push({ value: '0', label: 'TODOS LOS CLIENTES' });
       resp.forEach(element => {
         this.clientes.push({ value: element.idCliente, label: element.razonSocial });
       });
 
       
     this.reporteService.GetAllEstaciones().subscribe(resp => {
       resp.forEach(element => {
         this.estaciones.push({ value: element.idEstacion ,  label : element.estacionOrigen});
       });
     });
 
 
 
       this.model.idcliente = '0';
       this.model.atiempo = 0;
       this.model.notiempo = 0;
     });
 
     this.es = {
       firstDayOfWeek: 1,
       dayNames: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
       dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
       dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
       monthNames: ['enero', 'febrero', 'marzo', 'abril',
       'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
       monthNamesShort: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
       today: 'Hoy',
       clear: 'Borrar'
     };
   }
 
   buscar() {


    const maxRange = 60 * 24 * 60 * 60 * 1000; // 60 días en milisegundos
    if (this.dateFin.getTime() - this.dateInicio.getTime() > maxRange) {
      alert('El rango de fechas no puede superar los 2 meses.');
      return;
    }

    var idcliente = this.model.idcliente;
    if (idcliente === undefined || idcliente === '0') {
      idcliente = '';
    }
    var fechainicio = this.dateInicio.toLocaleDateString();
    var fechafin = this.dateFin.toLocaleDateString();

 
 
     var url = "http://104.36.166.65/webreports/RepGeneralMonitoreo.aspx?"
     + "&fecinicio=" +fechainicio
     + "&fecfin=" + fechafin
     + "&idusuario=2"
     + "&idcliente=" + idcliente
 
 
 
     window.open(url);
   }
 
   
 }
 