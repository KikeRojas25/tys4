import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-retorno',
  templateUrl: './retorno.component.html',
  standalone: true,
  imports: [RouterOutlet, CommonModule]
})
export class RetornoComponent {}
