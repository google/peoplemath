// Copyright 2019-2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { PeriodComponent } from './period.component';
import { StorageService } from '../storage.service';
import { FormsModule } from '@angular/forms';
import { BucketComponent } from '../bucket/bucket.component';
import { ObjectiveComponent } from '../objective/objective.component';
import { PeopleComponent } from '../people/people.component';
import { AssignmentsByPersonComponent } from '../assignments-by-person/assignments-by-person.component';
import { MaterialModule } from '../material/material.module';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { Team } from '../team';
import { Period, ImmutablePeriod } from '../period';
import { of } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommitmentType, ImmutableObjectiveGroup } from '../objective';

describe('PeriodComponent', () => {
  let component: PeriodComponent;
  let fixture: ComponentFixture<PeriodComponent>;
  let storageServiceSpy = jasmine.createSpyObj('StorageService', ['getTeam', 'getPeriod']);
  let TEST_TEAM = new Team('testTeam', 'My test team');
  let TEST_PERIOD: Period = {
    id: 'testPeriod',
    displayName: 'My test period',
    unit: 'person weeks',
    secondaryUnits: [],
    notesURL: '',
    maxCommittedPercentage: 0,
    people: [],
    buckets: [],
    lastUpdateUUID: '',
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        PeriodComponent,
        BucketComponent,
        ObjectiveComponent,
        PeopleComponent,
        AssignmentsByPersonComponent,
      ],
      imports: [
        RouterTestingModule,
        FormsModule,
        MaterialModule,
        BrowserAnimationsModule,
      ],
      providers: [
        {provide: StorageService, useValue: storageServiceSpy},
        {provide: ActivatedRoute, useValue: {
          paramMap: of(convertToParamMap({team: TEST_TEAM.id, period: TEST_PERIOD.id}))
        }},
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

  it('should only rename groups of the same group type', () => {
    component.period = ImmutablePeriod.fromPeriod({...TEST_PERIOD, buckets: [
      {
        allocationPercentage: 100,
        displayName: 'Sole bucket',
        objectives: [
          {
            name: 'Sole objective',
            commitmentType: CommitmentType.Aspirational,
            resourceEstimate: 2,
            notes: '',
            assignments: [],
            tags: [],
            groups: [
              {groupType: 'type1', groupName: 'thename'},
              {groupType: 'type2', groupName: 'thename'},
            ],
          },
        ],
      }
    ]});
    component.renameGroup('type1', 'thename', 'thenewname');
    expect(component.period.buckets[0].objectives[0].groups).toEqual([
      new ImmutableObjectiveGroup({groupType: 'type1', groupName: 'thenewname'}),
      new ImmutableObjectiveGroup({groupType: 'type2', groupName: 'thename'}),
    ]);
  });
});
