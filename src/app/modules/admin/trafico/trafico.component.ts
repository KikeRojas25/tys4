import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-trafico',
  templateUrl: './trafico.component.html',
  styleUrls: ['./trafico.component.css'],
  standalone: true,
  imports: [RouterOutlet]
})
export class TraficoComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
