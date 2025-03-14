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

import { BucketSummaryComponent } from './bucket-summary.component';
import { AllocationType, Bucket, ImmutableBucket } from '../bucket';
import { Objective } from '../objective';
import { Assignment } from '../assignment';
import { ObjectiveSummaryComponent } from '../objective-summary/objective-summary.component';
import { ResourceQuantityComponent } from '../resource-quantity/resource-quantity.component';

describe('BucketSummaryComponent', () => {
  let component: BucketSummaryComponent;
  let fixture: ComponentFixture<BucketSummaryComponent>;
  const NO_COMMITMENTTYPE_OBJECTIVE: Objective = {
    name: 'An objective with no commitment type',
    resourceEstimate: 10,
    commitmentType: undefined,
    groups: [],
    tags: [],
    notes: '',
    assignments: [new Assignment('person1', 5)],
    displayOptions: { enableMarkdown: false },
  };
  const BUCKET: Bucket = {
    displayName: 'my bucket',
    allocationType: AllocationType.Percentage,
    allocationPercentage: 50,
    allocationAbsolute: 0,
    objectives: [NO_COMMITMENTTYPE_OBJECTIVE],
  };

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [
          BucketSummaryComponent,
          ObjectiveSummaryComponent,
          ResourceQuantityComponent,
        ],
      }).compileComponents();
    })
  );

  beforeEach(
    waitForAsync(() => {
      fixture = TestBed.createComponent(BucketSummaryComponent);
      component = fixture.componentInstance;
      component.bucket = ImmutableBucket.fromBucket(BUCKET);
      component.bucketAllocationFraction = 50;
      component.unit = 'things';
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should classify objective with no commitment type as aspirational', () => {
    const actual = component
      .aspirationalObjectives()
      .map((o) => o.toOriginal());
    expect(actual).toEqual([NO_COMMITMENTTYPE_OBJECTIVE]);
  });
});
