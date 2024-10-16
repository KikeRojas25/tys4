import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-recepcion',
  templateUrl: './recepcion.component.html',
  styleUrls: ['./recepcion.component.css'],
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    FormsModule
  ]
})
export class RecepcionComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
