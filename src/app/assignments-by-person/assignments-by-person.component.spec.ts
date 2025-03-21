// Copyright 2019-2021, 2025 Google LLC
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

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AssignmentsByPersonComponent } from './assignments-by-person.component';
import { ImmutablePeriod } from '../period';

describe('AssignmentsByPersonComponent', () => {
  let component: AssignmentsByPersonComponent;
  let fixture: ComponentFixture<AssignmentsByPersonComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({}).compileComponents();
    })
  );

  beforeEach(
    waitForAsync(() => {
      fixture = TestBed.createComponent(AssignmentsByPersonComponent);
      component = fixture.componentInstance;
      component.period = ImmutablePeriod.fromPeriod({
        id: 'test',
        displayName: 'Test Period',
        unit: 'person weeks',
        secondaryUnits: [],
        notesURL: '',
        maxCommittedPercentage: 0,
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
