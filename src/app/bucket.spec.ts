/**
 * Copyright 2020-2023 Google LLC
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

import { AllocationType, Bucket, ImmutableBucket } from './bucket';
import { CommitmentType, Objective, ImmutableObjective } from './objective';

describe('ImmutableBucket', () => {
  const _mut: Bucket = {
    displayName: 'My test bucket',
    allocationType: AllocationType.Percentage,
    allocationPercentage: 50,
    allocationAbsolute: 0,
    objectives: [
      {
        name: 'My test objective',
        resourceEstimate: 1,
        notes: '',
        commitmentType: CommitmentType.Committed,
        groups: [],
        tags: [{ name: 'mytag' }],
        assignments: [],
        displayOptions: { enableMarkdown: false },
      },
    ],
  };
  const bucket = ImmutableBucket.fromBucket(_mut);
  const obj2: Objective = {
    name: 'Second Objective',
    resourceEstimate: 2,
    notes: 'stuff',
    commitmentType: CommitmentType.Aspirational,
    assignments: [],
    groups: [],
    tags: [],
    displayOptions: { enableMarkdown: false },
  };
  const nonExistentObjective = ImmutableObjective.fromObjective({
    name: 'nonexistent',
    resourceEstimate: 3,
    commitmentType: CommitmentType.Aspirational,
    notes: '',
    assignments: [],
    tags: [],
    groups: [],
    displayOptions: { enableMarkdown: false },
  });

  it('should convert', () => {
    expect(bucket.toOriginal()).toEqual(_mut);
  });

  it('should be immutable', () => {
    // This should not compile, in order not to provide a circumvention vector to the type system.
    // However, I don't know how to assert it doesn't. :(
    // const shadow: Bucket = bucket;
  });

  it('should support new objective at bottom', () => {
    const newBucket = bucket.withNewObjectiveAtBottom(
      ImmutableObjective.fromObjective(obj2)
    );
    const expected: Bucket = {
      displayName: _mut.displayName,
      allocationType: _mut.allocationType,
      allocationPercentage: _mut.allocationPercentage,
      allocationAbsolute: _mut.allocationAbsolute,
      objectives: [_mut.objectives[0], obj2],
    };
    expect(newBucket.toOriginal()).toEqual(expected);
  });

  it('should support new objective at top', () => {
    const newBucket = bucket.withNewObjectiveAtTop(
      ImmutableObjective.fromObjective(obj2)
    );
    const expected: Bucket = {
      displayName: _mut.displayName,
      allocationType: _mut.allocationType,
      allocationPercentage: _mut.allocationPercentage,
      allocationAbsolute: _mut.allocationAbsolute,
      objectives: [obj2, _mut.objectives[0]],
    };
    expect(newBucket.toOriginal()).toEqual(expected);
  });

  it('should support deleting an objective', () => {
    const newBucket = bucket.withObjectiveDeleted(bucket.objectives[0]);
    const expected: Bucket = {
      displayName: _mut.displayName,
      allocationType: _mut.allocationType,
      allocationPercentage: _mut.allocationPercentage,
      allocationAbsolute: _mut.allocationAbsolute,
      objectives: [],
    };
    expect(newBucket.toOriginal()).toEqual(expected);
  });

  it('should be unaffected by deleting a nonexistent objective', () => {
    const newBucket = bucket.withObjectiveDeleted(nonExistentObjective);
    expect(newBucket).toEqual(bucket);
  });

  it('should support changing an objective', () => {
    const newBucket = bucket.withObjectiveChanged(
      bucket.objectives[0],
      ImmutableObjective.fromObjective(obj2)
    );
    const expected: Bucket = {
      displayName: _mut.displayName,
      allocationType: _mut.allocationType,
      allocationPercentage: _mut.allocationPercentage,
      allocationAbsolute: _mut.allocationAbsolute,
      objectives: [obj2],
    };
    expect(newBucket.toOriginal()).toEqual(expected);
  });

  it('should be unaffected by changing a nonexistent objective', () => {
    const newBucket = bucket.withObjectiveChanged(
      nonExistentObjective,
      ImmutableObjective.fromObjective(obj2)
    );
    expect(newBucket).toEqual(bucket);
  });

  it('should calculate abs/pct allocations if allocationType is percentage', () => {
    const b = ImmutableBucket.fromBucket({
      displayName: 'TestPCT',
      allocationType: AllocationType.Percentage,
      allocationPercentage: 23,
      allocationAbsolute: -1,
      objectives: [],
    });
    expect(b.getAllocationPercentage(1234)).toEqual(23);
    expect(b.getAllocationAbsolute(200)).toEqual(46);
  });

  it('should calculate abs/pct allocations if allocationType is absolute', () => {
    const b = ImmutableBucket.fromBucket({
      displayName: 'TestABS',
      allocationType: AllocationType.Absolute,
      allocationAbsolute: 15,
      allocationPercentage: -1,
      objectives: [],
    });
    expect(b.getAllocationPercentage(60)).toBeCloseTo(25);
    expect(b.getAllocationAbsolute(12345)).toEqual(15);
  });
});
