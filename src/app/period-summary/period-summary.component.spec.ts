import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodSummaryComponent } from './period-summary.component';
import { MaterialModule } from '../material/material.module';
import { StorageService } from '../storage.service';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { Team } from '../team';
import { Period } from '../period';
import { ObjectiveSummaryComponent } from '../objective-summary/objective-summary.component';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { Bucket } from '../bucket';
import { Objective } from '../objective';
import { Assignment } from '../assignment';

let TEST_TEAM = new Team('teamid', 'Team Name');
let NO_COMMITMENTTYPE_OBJECTIVE = new Objective('An objective with no commitment type', 10, undefined, [
  new Assignment('person1', 5),
]);
let BUCKETS = [new Bucket('Bucket 1', 100, [
  NO_COMMITMENTTYPE_OBJECTIVE,
])];
let TEST_PERIOD = new Period('periodid', 'Period Name', 'units', '', 50, BUCKETS, [], '');
let storageServiceSpy = jasmine.createSpyObj('StorageService', ['getTeam', 'getPeriod']);

describe('PeriodSummaryComponent', () => {
  let component: PeriodSummaryComponent;
  let fixture: ComponentFixture<PeriodSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        PeriodSummaryComponent,
        ObjectiveSummaryComponent,
      ],
      imports: [
        RouterTestingModule,
        MaterialModule,
      ],
      providers: [
        {provide: StorageService, useValue: storageServiceSpy},
        {provide: ActivatedRoute, useValue: {
          'snapshot': {'paramMap': convertToParamMap({'team': TEST_TEAM.id, 'period': TEST_PERIOD.id})}},
        },
      ],
    })
    .compileComponents();
    storageServiceSpy.getTeam.and.returnValue(of(TEST_TEAM));
    storageServiceSpy.getPeriod.and.returnValue(of(TEST_PERIOD));
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeriodSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should classify objective with no commitment type as aspirational', () => {
    expect(component.aspirationalObjectives(BUCKETS[0])).toEqual([NO_COMMITMENTTYPE_OBJECTIVE]);
  });
});
