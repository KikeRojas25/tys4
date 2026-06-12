import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { ConfirmationService, MessageService, TreeNode } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { TreeModule } from 'primeng/tree';
import { forkJoin } from 'rxjs';

import { SeguridadService } from '../seguridad.service';
import { Pagina, Rol, RolMantenimientoPayload } from '../seguridad.types';

@Component({
  selector: 'app-mantenimientoroles',
  templateUrl: './mantenimientoroles.component.html',
  styleUrls: ['./mantenimientoroles.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIcon,
    TableModule,
    ButtonModule,
    InputTextModule,
    CheckboxModule,
    DialogModule,
    TreeModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule
  ],
  providers: [MessageService, ConfirmationService]
})
export class MantenimientorolesComponent implements OnInit {

  param = '';
  roles: Rol[] = [];

  // Modal Datos del Rol (Nuevo / Editar)
  dialogRolVisible = false;
  modoEdicion = false;
  guardandoRol = false;
  rolForm: RolMantenimientoPayload = this.formVacio();

  // Modal Asignar Páginas
  dialogPaginasVisible = false;
  rolParaPaginas: Rol | null = null;
  cargandoArbol = false;
  guardandoPaginas = false;
  paginas: Pagina[] = [];
  arbolPaginas: TreeNode[] = [];
  paginasSeleccionadas: TreeNode[] = [];

  constructor(
    private seguridadService: SeguridadService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.buscar();
  }

  // ==================== Listado ====================

  buscar() {
    this.seguridadService.listarRolesMantenimiento(this.param).subscribe({
      next: (data) => { this.roles = data || []; },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el listado de roles.', life: 3000 });
      }
    });
  }

  // ==================== Activar / Desactivar ====================

  toggleActivo(rol: Rol) {
    const accion = rol.activo ? 'desactivar' : 'activar';
    const nuevo = !rol.activo;

    this.confirmationService.confirm({
      header: nuevo ? 'Activar rol' : 'Desactivar rol',
      message: `¿Está seguro que desea ${accion} el rol "${rol.descripcion}"?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: nuevo ? 'Activar' : 'Desactivar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.seguridadService.toggleActivoRol(rol.id, nuevo).subscribe({
          next: () => {
            rol.activo = nuevo;
            this.messageService.add({
              severity: nuevo ? 'success' : 'warn',
              summary: nuevo ? 'Rol activado' : 'Rol desactivado',
              detail: `El rol "${rol.descripcion}" fue ${nuevo ? 'activado' : 'desactivado'}.`,
              life: 3000
            });
          },
          error: (err) => {
            const msg = err?.error?.message || 'No se pudo cambiar el estado del rol.';
            this.messageService.add({ severity: 'error', summary: 'Error', detail: msg, life: 4000 });
          }
        });
      }
    });
  }

  // ==================== Modal Datos del Rol ====================

  abrirNuevo() {
    this.modoEdicion = false;
    this.rolForm = this.formVacio();
    this.dialogRolVisible = true;
  }

  abrirEditar(rol: Rol) {
    this.modoEdicion = true;
    this.rolForm = {
      rolId: rol.id,
      descripcion: rol.descripcion,
      alias: rol.alias,
      publico: rol.publico
    };
    this.dialogRolVisible = true;
  }

  guardarRol() {
    if (!this.rolForm.descripcion?.trim() || !this.rolForm.alias?.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Validación', detail: 'Descripción y alias son obligatorios.', life: 3000 });
      return;
    }

    this.guardandoRol = true;

    const accion$ = this.modoEdicion
      ? this.seguridadService.actualizarRol(this.rolForm)
      : this.seguridadService.registrarRol(this.rolForm);

    accion$.subscribe({
      next: () => {
        this.guardandoRol = false;
        this.dialogRolVisible = false;
        this.messageService.add({
          severity: 'success',
          summary: this.modoEdicion ? 'Rol actualizado' : 'Rol creado',
          detail: this.modoEdicion
            ? `Los datos del rol "${this.rolForm.descripcion}" se actualizaron.`
            : `El rol "${this.rolForm.descripcion}" se creó. Use el botón de páginas para asignar permisos.`,
          life: 4000
        });
        this.buscar();
      },
      error: (err) => {
        this.guardandoRol = false;
        const msg = err?.error?.message || 'No se pudo guardar el rol.';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: msg, life: 4000 });
      }
    });
  }

  cancelarRol() {
    this.dialogRolVisible = false;
  }

  // ==================== Modal Asignar Páginas ====================

  abrirAsignarPaginas(rol: Rol) {
    this.rolParaPaginas = rol;
    this.paginasSeleccionadas = [];
    this.arbolPaginas = [];
    this.dialogPaginasVisible = true;
    this.cargarArbolConSeleccion(rol.id);
  }

  guardarPaginas() {
    if (!this.rolParaPaginas) return;

    const paginaIds = this.paginasSeleccionadas
      .filter(n => n.data?.id != null)
      .map(n => n.data.id as number);

    this.guardandoPaginas = true;

    this.seguridadService.asignarPaginasRol(this.rolParaPaginas.id, paginaIds).subscribe({
      next: () => {
        this.guardandoPaginas = false;
        this.dialogPaginasVisible = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Páginas asignadas',
          detail: `Las páginas del rol "${this.rolParaPaginas?.descripcion}" se actualizaron.`,
          life: 3000
        });
        this.rolParaPaginas = null;
      },
      error: (err) => {
        this.guardandoPaginas = false;
        const msg = err?.error?.message || 'No se pudieron asignar las páginas.';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: msg, life: 4000 });
      }
    });
  }

  cancelarPaginas() {
    this.dialogPaginasVisible = false;
    this.rolParaPaginas = null;
  }

  // ==================== Helpers privados ====================

  private formVacio(): RolMantenimientoPayload {
    return { rolId: null, descripcion: '', alias: '', publico: false };
  }

  private cargarArbolConSeleccion(rolId: number) {
    this.cargandoArbol = true;
    forkJoin({
      paginas: this.seguridadService.getPaginasArbol(),
      asignadas: this.seguridadService.getPaginasPorRol(rolId)
    }).subscribe({
      next: ({ paginas, asignadas }) => {
        this.paginas = paginas || [];
        this.arbolPaginas = this.construirArbol(this.paginas);

        const asignadasSet = new Set(asignadas || []);
        const seleccionadas: TreeNode[] = [];
        this.recorrerArbol(this.arbolPaginas, (node) => {
          if (asignadasSet.has(node.data.id)) {
            seleccionadas.push(node);
          }
        });
        this.paginasSeleccionadas = seleccionadas;
        this.cargandoArbol = false;
      },
      error: () => {
        this.cargandoArbol = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las páginas del rol.', life: 3000 });
      }
    });
  }

  private construirArbol(paginas: Pagina[]): TreeNode[] {
    const porCodMenu = new Map<string, TreeNode>();
    const raices: TreeNode[] = [];

    for (const p of paginas) {
      const node: TreeNode = {
        key: String(p.id),
        label: p.descripcion || p.nombre,
        data: p,
        children: [],
        expanded: false,
        leaf: false
      };
      porCodMenu.set(p.codmenu, node);
    }

    for (const p of paginas) {
      const node = porCodMenu.get(p.codmenu)!;
      const padre = p.codmenuPadre ? porCodMenu.get(p.codmenuPadre) : null;
      if (padre) {
        padre.children!.push(node);
      } else {
        raices.push(node);
      }
    }

    this.recorrerArbol(raices, (n) => {
      n.leaf = !n.children || n.children.length === 0;
    });

    return raices;
  }

  private recorrerArbol(nodes: TreeNode[], fn: (n: TreeNode) => void) {
    for (const n of nodes) {
      fn(n);
      if (n.children && n.children.length > 0) {
        this.recorrerArbol(n.children, fn);
      }
    }
  }
}
