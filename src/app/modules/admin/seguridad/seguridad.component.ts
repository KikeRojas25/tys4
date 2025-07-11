import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-seguridad',
  templateUrl: './seguridad.component.html',
  styleUrls: ['./seguridad.component.css'],
  standalone: true,
  imports:[RouterOutlet ]
})
export class SeguridadComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
