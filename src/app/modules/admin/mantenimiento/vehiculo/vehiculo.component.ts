import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-vehiculo',
  templateUrl: './vehiculo.component.html',
  styleUrls: ['./vehiculo.component.css'],
  standalone: true,
  imports: [
    RouterOutlet
  ]
})
export class VehiculoComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
