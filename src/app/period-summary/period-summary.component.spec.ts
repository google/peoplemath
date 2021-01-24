/**
 * Copyright 2019-2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

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
import { BucketSummaryComponent } from '../bucket-summary/bucket-summary.component';
import { ResourceQuantityComponent } from '../resource-quantity/resource-quantity.component';

const TEST_TEAM = new Team('teamid', 'Team Name');
const NO_COMMITMENTTYPE_OBJECTIVE: Objective = {
  name: 'An objective with no commitment type',
  resourceEstimate: 10,
  commitmentType: undefined,
  groups: [],
  tags: [],
  notes: '',
  assignments: [
    new Assignment('person1', 5),
  ],
};
const BUCKETS = [new Bucket('Bucket 1', 100, [
  NO_COMMITMENTTYPE_OBJECTIVE,
])];
const TEST_PERIOD: Period = {
  id: 'periodid',
  displayName: 'Period Name',
  unit: 'units',
  secondaryUnits: [],
  notesURL: '',
  maxCommittedPercentage: 50,
  buckets: BUCKETS,
  people: [],
  lastUpdateUUID: '',
};
const storageServiceSpy = jasmine.createSpyObj('StorageService', ['getTeam', 'getPeriod']);

describe('PeriodSummaryComponent', () => {
  let component: PeriodSummaryComponent;
  let fixture: ComponentFixture<PeriodSummaryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        PeriodSummaryComponent,
        BucketSummaryComponent,
        ObjectiveSummaryComponent,
        ResourceQuantityComponent,
      ],
      imports: [
        RouterTestingModule,
        MaterialModule,
      ],
      providers: [
        {provide: StorageService, useValue: storageServiceSpy},
        {provide: ActivatedRoute, useValue: {
          paramMap: of(convertToParamMap({team: TEST_TEAM.id, period: TEST_PERIOD.id}))},
        },
      ],
    })
    .compileComponents();
    storageServiceSpy.getTeam.and.returnValue(of(TEST_TEAM));
    storageServiceSpy.getPeriod.and.returnValue(of(TEST_PERIOD));
  }));

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(PeriodSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
