/**
 * Copyright 2019-2021, 2025 Google LLC
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

import { ObjectiveSummaryComponent } from './objective-summary.component';
import { CommitmentType, ImmutableObjective } from '../objective';
import { ResourceQuantityComponent } from '../resource-quantity/resource-quantity.component';

describe('ObjectiveSummaryComponent', () => {
  let component: ObjectiveSummaryComponent;
  let fixture: ComponentFixture<ObjectiveSummaryComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [ObjectiveSummaryComponent, ResourceQuantityComponent],
      }).compileComponents();
    })
  );

  beforeEach(
    waitForAsync(() => {
      fixture = TestBed.createComponent(ObjectiveSummaryComponent);
      component = fixture.componentInstance;
      component.objective = ImmutableObjective.fromObjective({
        name: '',
        resourceEstimate: 0,
        commitmentType: CommitmentType.Aspirational,
        groups: [],
        tags: [],
        notes: '',
        assignments: [],
      });
      component.unit = '';
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
