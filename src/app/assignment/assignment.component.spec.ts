import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentComponent } from './assignment.component';
import { FormsModule } from '@angular/forms';
import { Assignment } from '../assignment';

describe('AssignmentComponent', () => {
  let component: AssignmentComponent;
  let fixture: ComponentFixture<AssignmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ FormsModule ],
      declarations: [ AssignmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignmentComponent);
    component = fixture.componentInstance;
    component.assignment = new Assignment('', 0);
    component.validAssignees = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
