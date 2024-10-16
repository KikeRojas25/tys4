import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-mantenimiento',
  templateUrl: './mantenimiento.component.html',
  styleUrls: ['./mantenimiento.component.css'],
  standalone: true,
  imports:[
    RouterOutlet
  ]
})
export class MantenimientoComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
