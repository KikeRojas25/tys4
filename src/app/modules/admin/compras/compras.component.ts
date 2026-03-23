import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-compras',
  templateUrl: './compras.component.html',
  styleUrls: ['./compras.component.css'],
  standalone: true,
  imports: [RouterOutlet],
})
export class ComprasComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}

