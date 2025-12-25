import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-recojo',
  templateUrl: './recojo.component.html',
  styleUrls: ['./recojo.component.css'],
    standalone: true,
    imports:[
      RouterOutlet
    ]
})
export class RecojoComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
