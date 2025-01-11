/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { RecepcionarOrdentransporteComponent } from './recepcionar-ordentransporte.component';

describe('RecepcionarOrdentransporteComponent', () => {
  let component: RecepcionarOrdentransporteComponent;
  let fixture: ComponentFixture<RecepcionarOrdentransporteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecepcionarOrdentransporteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecepcionarOrdentransporteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
