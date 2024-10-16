/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { EditarotComponent } from './editarot.component';

describe('EditarotComponent', () => {
  let component: EditarotComponent;
  let fixture: ComponentFixture<EditarotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditarotComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
