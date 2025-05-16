import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.component.html',
  styleUrls: ['./cliente.component.css'],
  standalone: true,
  imports: [ RouterOutlet]
})
export class ClienteComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
