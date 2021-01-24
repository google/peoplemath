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

import { Period, ImmutablePeriod, SecondaryUnit, ImmutableSecondaryUnit } from './period';
import { Bucket, ImmutableBucket } from './bucket';
import { Person, ImmutablePerson } from './person';
import { Assignment } from './assignment';
import { CommitmentType, ImmutableObjectiveGroup, ImmutableObjectiveTag } from './objective';

describe('ImmutableSecondaryUnit', () => {
    const _mut: SecondaryUnit = {
        name: 'test',
        conversionFactor: 2,
    };
    const su = new ImmutableSecondaryUnit(_mut);

    it('should read as the source class', () => {
        expect(su.name).toEqual(_mut.name);
        expect(su.conversionFactor).toEqual(_mut.conversionFactor);
    });

    it('should be immutable', () => {
        // Should not compile
        // su.name = 'something else';
        const s: SecondaryUnit = su;
        expect(() => { s.name = 'something else'; }).toThrowError(/Cannot set property name/);
        expect(su.name).toEqual('test');
    });

    it('should convert back', () => {
        const orig = su.toOriginal();
        expect(orig).toEqual(_mut);
    });
});

describe('ImmutablePeriod', () => {
    const _mut: Period = {
        id: 'testperiod',
        displayName: 'My test period',
        maxCommittedPercentage: 50,
        unit: 'things',
        secondaryUnits: [],
        notesURL: 'noexist',
        buckets: [
            new Bucket('Bucket 1', 40, []),
            new Bucket('Bucket 2', 60, [
                {
                    name: 'An objective', resourceEstimate: 6, commitmentType: CommitmentType.Aspirational,
                    notes: '',
                    groups: [{groupType: 'group', groupName: 'things'}],
                    tags: [{name: 'mytag'}],
                    assignments: [new Assignment('person1', 3)],
                },
            ]),
        ],
        people: [new Person('person1', 'Person 1', 'LOC', 6), new Person('person2', 'Person 2', 'LOC', 7)],
        lastUpdateUUID: 'uuid',
    };
    const period = ImmutablePeriod.fromPeriod(_mut);

    it('should convert back', () => {
        const orig = period.toOriginal();
        expect(orig).toEqual(_mut);
    });

    it('should facilitate lastUpdateUUID changes', () => {
        const updated = period.withNewLastUpdateUUID('newuuid');
        const expected: Period = {..._mut, lastUpdateUUID: 'newuuid'};
        expect(updated.toOriginal()).toEqual(expected);
    });

    it('should facilitate new buckets', () => {
        const newBucket: Bucket = new Bucket('New bucket', 50, []);
        const updated = period.withNewBucket(ImmutableBucket.fromBucket(newBucket));
        const expected: Period = {..._mut, buckets: [..._mut.buckets, newBucket]};
        expect(updated.toOriginal()).toEqual(expected);
    });

    it('should facilitate bucket moving up', () => {
        const updated = period.withBucketMovedUpOne(period.buckets[1]);
        const expected: Period = {..._mut, buckets: [_mut.buckets[1], _mut.buckets[0]]};
        expect(updated.toOriginal()).toEqual(expected);
    });

    it('should facilitate bucket moving down', () => {
        const updated = period.withBucketMovedDownOne(period.buckets[0]);
        const expected: Period = {..._mut, buckets: [_mut.buckets[1], _mut.buckets[0]]};
        expect(updated.toOriginal()).toEqual(expected);
    });

    it('should facilitate bucket change', () => {
        const newBucket = new Bucket('New bucket', 77, []);
        const expected: Period = {..._mut, buckets: [_mut.buckets[0], newBucket]};
        const updated = period.withBucketChanged(period.buckets[1], ImmutableBucket.fromBucket(newBucket));
        expect(updated.toOriginal()).toEqual(expected);
    });

    it('should be unaffected by changing nonexistent bucket', () => {
        const nonExistent = ImmutableBucket.fromBucket(new Bucket('Nonexistent', 666, []));
        const updated = period.withBucketChanged(
            nonExistent, ImmutableBucket.fromBucket(new Bucket('none', 0, [])));
        expect(updated).toEqual(period);
    });

    it('should facilitate person change', () => {
        const newPerson = new Person('person1', 'Person Number One', 'LOC', 8);
        const updated = period.withPersonChanged(period.people[0], new ImmutablePerson(newPerson));
        const expected: Period = {..._mut, people: [newPerson, _mut.people[1]]};
        expect(updated.toOriginal()).toEqual(expected);
    });

    it('should not allow person ID change', () => {
        const idChanged = new ImmutablePerson(new Person('person3', 'Person 1', 'LOC', 6));
        expect(() => period.withPersonChanged(period.people[0], idChanged)).toThrowError(/Cannot change person id/);
    });

    it('should facilitate new person', () => {
        const newPerson = new Person('person3', 'Person 3', 'LOC', 8);
        const updated = period.withNewPerson(new ImmutablePerson(newPerson));
        const expected: Period = {..._mut, people: _mut.people.concat([newPerson])};
        expect(updated.toOriginal()).toEqual(expected);
    });

    it('should not allow new person with existing ID', () => {
        const newPerson = new ImmutablePerson(new Person('person1', 'A different person 1', 'LOC', 9));
        expect(() => period.withNewPerson(newPerson)).toThrowError(/id person1 already exists/);
    });

    it('should facilitate deleted person', () => {
        const updated = period.withPersonDeleted(period.people[0]);
        expect(updated.people).toEqual([period.people[1]]);
        expect(updated.buckets[1].objectives[0].assignments).toEqual([]);
    });

    it('should be unaffected by changing nonexistent person', () => {
        const nonExistent = new ImmutablePerson(new Person('nonexistent', 'Does not exist', '', 0));
        const updated = period.withPersonChanged(nonExistent, new ImmutablePerson(new Person('nonexistent', 'na', '', 1)));
        expect(updated).toEqual(period);
    });

    it('should be unaffected by deleting nonexistent person', () => {
        const nonExistent = new ImmutablePerson(new Person('nonexistent', 'Does not exist', '', 0));
        const updated = period.withPersonDeleted(nonExistent);
        expect(updated).toEqual(period);
    });

    it('should facilitate group rename', () => {
        const updated = period.withGroupRenamed('group', 'things', 'otherthings');
        expect(updated.buckets[1].objectives[0].groups).toEqual([
            new ImmutableObjectiveGroup({groupType: 'group', groupName: 'otherthings'})]);
        // Make sure method exists and clone worked correctly
        expect(updated.resourcesAllocated()).toEqual(period.resourcesAllocated());
    });

    it('should facilitate tag rename', () => {
        const updated = period.withTagRenamed('mytag', 'mynewtag');
        expect(updated.buckets[1].objectives[0].tags).toEqual([
            new ImmutableObjectiveTag({name: 'mynewtag'})]);
        // Make sure method exists and clone worked correctly
        expect(updated.resourcesAllocated()).toEqual(period.resourcesAllocated());
    });

    it('should facilitate objective bucket move', () => {
        const obj = period.buckets[1].objectives[0];
        const updated = period.withObjectiveMoved(obj, period.buckets[1], obj, period.buckets[0]);
        expect(updated.buckets[1].objectives).toEqual([]);
        expect(updated.buckets[0].objectives).toEqual([obj]);
    });

    it('should facilitate deleted bucket', () => {
        const bucket = period.buckets[0];
        const updated = period.withBucketDeleted(bucket);
        expect(updated.buckets).toEqual([period.buckets[1]]);
    });

    it('should be unaffected by deleting nonexistent bucket', () => {
        const nonExistent = ImmutableBucket.fromBucket({displayName: 'nonexist', allocationPercentage: 17, objectives: []});
        const updated = period.withBucketDeleted(nonExistent);
        expect(updated).toEqual(period);
    });

    it('should be immutable', () => {
        // ImmutablePeriod should not be assignable to Period,
        // Therefore, this shouldn't compile. But I don't know how to assert it doesn't. :(
        // This is required to ensure this isn't a vector for circumventing the type system.

        // const p: Period = period;
    });
});
