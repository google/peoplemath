import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjectiveSummaryComponent } from './objective-summary.component';
import { Objective, CommitmentType } from '../objective';

describe('ObjectiveSummaryComponent', () => {
  let component: ObjectiveSummaryComponent;
  let fixture: ComponentFixture<ObjectiveSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ObjectiveSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjectiveSummaryComponent);
    component = fixture.componentInstance;
    component.objective = new Objective('', 0, CommitmentType.Aspirational, '', []);
    component.unit = '';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
