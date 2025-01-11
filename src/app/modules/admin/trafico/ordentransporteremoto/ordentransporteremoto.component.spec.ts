/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { OrdentransporteremotoComponent } from './ordentransporteremoto.component';

describe('OrdentransporteremotoComponent', () => {
  let component: OrdentransporteremotoComponent;
  let fixture: ComponentFixture<OrdentransporteremotoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrdentransporteremotoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrdentransporteremotoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
