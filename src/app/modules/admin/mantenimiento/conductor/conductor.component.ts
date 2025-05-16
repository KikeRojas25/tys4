import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-conductor',
  templateUrl: './conductor.component.html',
  styleUrls: ['./conductor.component.css'],
  standalone: true,
  imports :[
    RouterOutlet
  ]
})
export class ConductorComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
