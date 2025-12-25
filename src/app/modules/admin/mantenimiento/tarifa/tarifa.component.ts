import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-tarifa',
  templateUrl: './tarifa.component.html',
  styleUrls: ['./tarifa.component.css'],
  standalone: true,
  imports: [ RouterOutlet]
})
export class TarifaComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
