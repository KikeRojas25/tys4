import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-manual',
  templateUrl: './manual.component.html',
  styleUrls: ['./manual.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule
  ]
})
export class ManualComponent implements OnInit, AfterViewInit {
  manualUrl: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {
    // Sanitizar la URL para seguridad
    this.manualUrl = this.sanitizer.bypassSecurityTrustResourceUrl('/manuales/estacion/MANUAL_USUARIO.html');
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    // Verificar si el iframe se cargó correctamente
    setTimeout(() => {
      const iframe = document.querySelector('iframe');
      if (iframe) {
        iframe.onerror = () => {
          console.error('Error al cargar el manual. Verifica que el archivo exista en public/manuales/estacion/');
        };
      }
    }, 100);
  }
}

