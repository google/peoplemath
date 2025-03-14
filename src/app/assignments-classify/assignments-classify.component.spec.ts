/**
 * Copyright 2020-2021, 2025 Google LLC
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

import {
  AssignmentsClassifyComponent,
  AggregateBy,
} from './assignments-classify.component';
import { ResourceQuantityComponent } from '../resource-quantity/resource-quantity.component';
import { ImmutablePeriod } from '../period';

describe('AssignmentsClassifyComponent', () => {
  let component: AssignmentsClassifyComponent;
  let fixture: ComponentFixture<AssignmentsClassifyComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [AssignmentsClassifyComponent, ResourceQuantityComponent],
      }).compileComponents();
    })
  );

  beforeEach(
    waitForAsync(() => {
      fixture = TestBed.createComponent(AssignmentsClassifyComponent);
      component = fixture.componentInstance;
      component.aggregateBy = AggregateBy.Group;
      component.period = ImmutablePeriod.fromPeriod({
        id: 'test',
        displayName: 'Test Period',
        unit: 'things',
        secondaryUnits: [],
        notesURL: '',
        maxCommittedPercentage: 10,
        buckets: [],
        people: [],
        lastUpdateUUID: '',
      });
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
