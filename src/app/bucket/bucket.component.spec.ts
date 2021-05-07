// Copyright 2019-2021 Google LLC
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

import { BucketComponent, personAssignmentData } from './bucket.component';
import { FormsModule } from '@angular/forms';
import { Assignment } from '../assignment';
import { Bucket, ImmutableBucket } from '../bucket';
import { CommitmentType, ImmutableObjective } from '../objective';
import { ObjectiveComponent } from '../objective/objective.component';
import { MaterialModule } from '../material/material.module';
import { DisplayObjectivesPipe } from './displayobjectives.pipe';

const DEFAULT_ASSIGNMENTS: Assignment[] = [
  { personId: 'alice', commitment: 1 },
  { personId: 'bob', commitment: 2 },
];

const DEFAULT_UNALLOCATED_TIME: ReadonlyMap<string, number> = new Map([
  ['alice', -1],
  ['bob', 0],
  ['charlie', 3],
  ['dave', 0],
]);

export const makeObjective = (
  resourceEstimate: number,
  assignments: Assignment[] = DEFAULT_ASSIGNMENTS
): ImmutableObjective =>
  ImmutableObjective.fromObjective({
    resourceEstimate,
    assignments,
    name: 'test objective',
    commitmentType: CommitmentType.Aspirational,
    groups: [],
    tags: [],
    notes: '',
  });

describe('BucketComponent', () => {
  let component: BucketComponent;
  let fixture: ComponentFixture<BucketComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [
          BucketComponent,
          ObjectiveComponent,
          DisplayObjectivesPipe,
        ],
        imports: [FormsModule, MaterialModule],
        providers: [],
      }).compileComponents();
    })
  );

  beforeEach(
    waitForAsync(() => {
      fixture = TestBed.createComponent(BucketComponent);
      component = fixture.componentInstance;
      component.bucket = ImmutableBucket.fromBucket(
        new Bucket('test bucket', 100, [])
      );
      component.unallocatedTime = DEFAULT_UNALLOCATED_TIME;
      component.isEditingEnabled = true;
      fixture.detectChanges();
    })
  );

  it('should generate correct assignment data', () => {
    const assignmentData = personAssignmentData(
      DEFAULT_UNALLOCATED_TIME,
      makeObjective(6, DEFAULT_ASSIGNMENTS).assignments
    );
    expect(assignmentData.filter((d) => d.username === 'bob')).toEqual([
      { username: 'bob', available: 2, assign: 2 },
    ]);
    expect(assignmentData.filter((d) => d.username === 'charlie')).toEqual([
      { username: 'charlie', available: 3, assign: 0 },
    ]);
    expect(assignmentData.filter((d) => d.username === 'alice')).toEqual([
      { username: 'alice', available: 0, assign: 1 },
    ]);
    expect(assignmentData.filter((d) => d.username === 'dave')).toEqual([]);
  });

  it('should enable assign button if there are assignments but estimate = 0', () => {
    const objective = makeObjective(0);
    expect(component.enableAssignButton(objective)).toEqual(true);
  });

  it('should enable assign button if there is an estimate but no assignments', () => {
    const objective = makeObjective(6, []);
    expect(component.enableAssignButton(objective)).toEqual(true);
  });

  it('should not enable assign button if estimate = 0 and there are no assignments', () => {
    const objective = makeObjective(0, []);
    expect(component.enableAssignButton(objective)).toEqual(false);
  });
});
