/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PrecintoComponent } from './precinto.component';

describe('PrecintoComponent', () => {
  let component: PrecintoComponent;
  let fixture: ComponentFixture<PrecintoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrecintoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrecintoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
