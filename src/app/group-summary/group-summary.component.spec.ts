/**
 * Copyright 2020-2021, 2023, 2025 Google LLC
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

import { GroupSummaryComponent } from './group-summary.component';
import { Period, ImmutablePeriod } from '../period';
import { FormsModule } from '@angular/forms';
import { ResourceQuantityComponent } from '../resource-quantity/resource-quantity.component';
import { AllocationType } from '../bucket';

describe('GroupSummaryComponent', () => {
  let component: GroupSummaryComponent;
  let fixture: ComponentFixture<GroupSummaryComponent>;
  const PERIOD: Period = {
    id: 'p',
    displayName: 'Period',
    unit: 'things',
    secondaryUnits: [],
    maxCommittedPercentage: 50,
    buckets: [
      {
        displayName: 'B1',
        allocationType: AllocationType.Percentage,
        allocationPercentage: 100,
        allocationAbsolute: 0,
        objectives: [],
      },
    ],
    people: [],
    notesURL: '',
    lastUpdateUUID: '',
  };

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [
          FormsModule,
          GroupSummaryComponent,
          ResourceQuantityComponent,
        ],
      }).compileComponents();
    })
  );

  beforeEach(
    waitForAsync(() => {
      fixture = TestBed.createComponent(GroupSummaryComponent);
      component = fixture.componentInstance;
      component.period = ImmutablePeriod.fromPeriod(PERIOD);
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
