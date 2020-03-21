import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PillComponent } from './pill.component';

describe('PillComponent', () => {
  let component: PillComponent;
  let fixture: ComponentFixture<PillComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PillComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
