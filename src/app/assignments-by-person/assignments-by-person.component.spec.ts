import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentsByPersonComponent } from './assignments-by-person.component';
import { Period } from '../period';

describe('AssignmentsByPersonComponent', () => {
  let component: AssignmentsByPersonComponent;
  let fixture: ComponentFixture<AssignmentsByPersonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssignmentsByPersonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignmentsByPersonComponent);
    component = fixture.componentInstance;
    component.period = new Period('test', 'Test Period', 'person weeks', [], []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
