import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-despacho',
  templateUrl: './despacho.component.html',
  styleUrls: ['./despacho.component.css'],
  standalone: true,
  imports: [
    RouterOutlet
  ]
})
export class DespachoComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
