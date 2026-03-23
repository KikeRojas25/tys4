import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-master-liquidaciones',
  templateUrl: './master-liquidaciones.component.html',
  styleUrls: ['./master-liquidaciones.component.css'],
  standalone: true,
  imports: [RouterOutlet],
})
export class MasterLiquidacionesComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}

