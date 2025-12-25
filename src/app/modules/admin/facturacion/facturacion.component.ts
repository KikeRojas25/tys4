import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-facturacion',
  templateUrl: './facturacion.component.html',
  styleUrls: ['./facturacion.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ]
})
export class FacturacionComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
