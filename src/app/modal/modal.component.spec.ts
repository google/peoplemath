import { ComponentFixture, fakeAsync, TestBed, waitForAsync } from '@angular/core/testing';

import { ModalComponent } from './modal.component';
import {MaterialModule} from '../material/material.module';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalComponent ],
      imports: [MaterialModule],
      providers: [
        {provide: MAT_DIALOG_DATA, useValue: {}}
      ]
    })
    .compileComponents();
  }));

  beforeEach(fakeAsync(() => {
    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
