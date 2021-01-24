/**
 * Copyright 2020 Google LLC
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

import { Bucket, ImmutableBucket } from './bucket';
import { CommitmentType, Objective, ImmutableObjective } from './objective';

describe('ImmutableBucket', () => {
    const _mut = new Bucket('My test bucket', 50, [
        {
            name: 'My test objective',
            resourceEstimate: 1,
            notes: '',
            commitmentType: CommitmentType.Committed,
            groups: [],
            tags: [{name: 'mytag'}],
            assignments: [],
        }
    ]);
    const bucket = ImmutableBucket.fromBucket(_mut);
    const obj2: Objective = {
        name: 'Second Objective',
        resourceEstimate: 2,
        notes: 'stuff',
        commitmentType: CommitmentType.Aspirational,
        assignments: [],
        groups: [],
        tags: [],
    };
    const nonExistentObjective = ImmutableObjective.fromObjective({
        name: 'nonexistent', resourceEstimate: 3, commitmentType: CommitmentType.Aspirational,
        notes: '', assignments: [], tags: [], groups: [],
    });

    it('should convert', () => {
        expect(bucket.toOriginal()).toEqual(_mut);
    });

    it('should be immutable', () => {
        // This should not compile, in order not to provide a circumvention vector to the type system.
        // However, I don't know how to assert it doesn't. :(

        // const shadow: Bucket = bucket;
    });

    it('should support new objective', () => {
        const newBucket = bucket.withNewObjective(ImmutableObjective.fromObjective(obj2));
        const expected: Bucket = new Bucket(
            _mut.displayName, _mut.allocationPercentage, [_mut.objectives[0], obj2]);
        expect(newBucket.toOriginal()).toEqual(expected);
    });

    it('should support deleting an objective', () => {
        const newBucket = bucket.withObjectiveDeleted(bucket.objectives[0]);
        const expected: Bucket = new Bucket(_mut.displayName, _mut.allocationPercentage, []);
        expect(newBucket.toOriginal()).toEqual(expected);
    });

    it('should be unaffected by deleting a nonexistent objective', () => {
        const newBucket = bucket.withObjectiveDeleted(nonExistentObjective);
        expect(newBucket).toEqual(bucket);
    });

    it('should support changing an objective', () => {
        const newBucket = bucket.withObjectiveChanged(
            bucket.objectives[0], ImmutableObjective.fromObjective(obj2));
        const expected: Bucket = new Bucket(_mut.displayName, _mut.allocationPercentage, [obj2]);
        expect(newBucket.toOriginal()).toEqual(expected);
    });

    it('should be unaffected by changing a nonexistent objective', () => {
        const newBucket = bucket.withObjectiveChanged(
            nonExistentObjective, ImmutableObjective.fromObjective(obj2));
        expect(newBucket).toEqual(bucket);
    });
});
