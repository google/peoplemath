import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { PeriodComponent } from './period.component';
import { OkrStorageService } from '../okrstorage.service';
import { FormsModule } from '@angular/forms';
import { BucketComponent } from '../bucket/bucket.component';
import { ObjectiveComponent } from '../objective/objective.component';
import { AssignmentComponent } from '../assignment/assignment.component';
import { PeopleComponent } from '../people/people.component';
import { AssignmentsByPersonComponent } from '../assignments-by-person/assignments-by-person.component';
import { MaterialModule } from '../material/material.module';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { Team } from '../team';
import { Period } from '../period';
import { of } from 'rxjs';

describe('PeriodComponent', () => {
  let component: PeriodComponent;
  let fixture: ComponentFixture<PeriodComponent>;
  let storageServiceSpy = jasmine.createSpyObj('OkrStorageService', ['getTeam', 'getPeriod']);
  let TEST_TEAM = new Team('testTeam', 'My test team');
  let TEST_PERIOD = new Period('testPeriod', 'My test period', 'person weeks');

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        PeriodComponent,
        BucketComponent,
        ObjectiveComponent,
        AssignmentComponent,
        PeopleComponent,
        AssignmentsByPersonComponent,
      ],
      imports: [
        RouterTestingModule,
        FormsModule,
        MaterialModule
      ],
      providers: [
        {provide: OkrStorageService, useValue: storageServiceSpy},
        {provide: ActivatedRoute, useValue: {
          'snapshot': {'paramMap': convertToParamMap({'team': TEST_TEAM.id, 'period': TEST_PERIOD.id})}}},
      ],
    })
    .compileComponents();
    storageServiceSpy.getTeam.and.returnValue(of(TEST_TEAM));
    storageServiceSpy.getPeriod.and.returnValue(of(TEST_PERIOD));
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeriodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
