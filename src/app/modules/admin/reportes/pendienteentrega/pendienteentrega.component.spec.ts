/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PendienteentregaComponent } from './pendienteentrega.component';

describe('PendienteentregaComponent', () => {
  let component: PendienteentregaComponent;
  let fixture: ComponentFixture<PendienteentregaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PendienteentregaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PendienteentregaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
