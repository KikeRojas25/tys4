import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { UsersBotEditComponent } from '../edit/edit.component';
import { UsersBotService } from '../usersbot.service';
import { PERFIL_LABELS, UserBot } from '../usersbot.types';

@Component({
  selector: 'app-usersbot-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ConfirmDialogModule,
    InputTextModule,
    MatIconModule,
    DynamicDialogModule,
    ToastModule,
    DropdownModule,
    CardModule,
    ButtonModule,
    TooltipModule
  ],
  providers: [DialogService, ConfirmationService, MessageService]
})
export class UsersBotListComponent implements OnInit {
  users: UserBot[] = [];
  perfilOptions: SelectItem[] = [
    { value: null, label: 'Todos' },
    { value: 4, label: PERFIL_LABELS[4] },
    { value: 6, label: PERFIL_LABELS[6] }
  ];

  filtroForm: FormGroup;
  loading = false;

  first = 0;
  rows = 40;
  totalRecords = 0;

  constructor(
    private fb: FormBuilder,
    private service: UsersBotService,
    private messageService: MessageService,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService
  ) {
    this.filtroForm = this.fb.group({
      criterio: [''],
      idperfil: [null]
    });
  }

  ngOnInit(): void {
    this.buscar();
  }

  buscar(): void {
    this.loading = true;
    const { criterio, idperfil } = this.filtroForm.value;
    this.service.getAll(criterio || '', idperfil).subscribe({
      next: (data) => {
        this.users = data || [];
        this.totalRecords = this.users.length;
        this.loading = false;
        this.first = 0;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los usuarios'
        });
      }
    });
  }

  perfilLabel(idperfil?: number | null): string {
    if (idperfil == null) return '-';
    return PERFIL_LABELS[idperfil] ?? `Perfil ${idperfil}`;
  }

  perfilBadgeClass(idperfil?: number | null): string {
    if (idperfil === 4) return 'badge-repartidor';
    if (idperfil === 6) return 'badge-chofer';
    return 'badge-other';
  }

  nuevo(): void {
    const ref = this.dialogService.open(UsersBotEditComponent, {
      header: 'Nuevo Usuario',
      width: '60vw',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      data: {}
    });
    ref.onClose.subscribe((result) => {
      if (result) this.buscar();
    });
  }

  editar(u: UserBot): void {
    const ref = this.dialogService.open(UsersBotEditComponent, {
      header: `Editar Usuario #${u.id}`,
      width: '60vw',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      data: { userBot: u }
    });
    ref.onClose.subscribe((result) => {
      if (result) this.buscar();
    });
  }

  eliminar(u: UserBot): void {
    if (!u.id) return;
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar a ${u.nombre} ${u.apellido}?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.service.delete(u.id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Usuario eliminado correctamente'
            });
            this.buscar();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo eliminar el usuario'
            });
          }
        });
      }
    });
  }

  onPageChange(event: any): void {
    this.first = event.first;
    this.rows = event.rows;
  }

  exportarExcel(): void {
    if (this.users.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'No hay usuarios para exportar'
      });
      return;
    }

    import('xlsx').then((xlsx: any) => {
      const XLSX: any = xlsx?.default ?? xlsx;
      const exportData = this.users.map(u => ({
        'ID': u.id,
        'DNI': u.dni || '-',
        'Nombre': u.nombre || '-',
        'Apellido': u.apellido || '-',
        'Teléfono': u.telefono || '-',
        'Perfil': this.perfilLabel(u.idperfil),
        'Clientes Ids': u.ClientesIds || '-',
        'Estado': u.estado || '-',
        'Fecha Registro': u.fecharegistro || '-'
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = { Sheets: { 'UsersBot': worksheet }, SheetNames: ['UsersBot'] };
      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, 'UsersBot');
    });
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    import('file-saver').then((FileSaver) => {
      const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
      const EXCEL_EXTENSION = '.xlsx';
      const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
      FileSaver.default.saveAs(data, fileName + '_' + new Date().getTime() + EXCEL_EXTENSION);
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Archivo Excel exportado correctamente'
      });
    });
  }
}
