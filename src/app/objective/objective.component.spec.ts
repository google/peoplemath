import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjectiveComponent } from './objective.component';
import { FormsModule } from '@angular/forms';
import { Objective } from '../objective';

describe('ObjectiveComponent', () => {
  let component: ObjectiveComponent;
  let fixture: ComponentFixture<ObjectiveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ObjectiveComponent ],
      imports: [ FormsModule ]
,    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjectiveComponent);
    component = fixture.componentInstance;
    component.objective = new Objective('test objective', 6, []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
