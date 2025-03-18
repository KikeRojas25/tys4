import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogModule, DialogService } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-precinto',
  templateUrl: './precinto.component.html',
  styleUrls: ['./precinto.component.css'],
   standalone: true,
    imports:[
      MatIcon,
      RouterModule,
      TableModule,
      FormsModule,
      CommonModule,
      ButtonModule,
      DynamicDialogModule
    ],
    providers: [DialogService]
})
export class PrecintoComponent implements OnInit {
  model: any = {};
  precintos: any;
  constructor() { }

  ngOnInit() {
  }

  generar() {
    
  }
}
