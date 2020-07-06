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

import { ObjectiveGroup, ImmutableObjectiveGroup, ObjectiveTag, ImmutableObjectiveTag, Objective, ImmutableObjective, CommitmentType } from "./objective";
import { Assignment } from './assignment';

describe('ImmutableObjectiveGroup', () => {
    const _mut: ObjectiveGroup = {
        groupType: 'mytype',
        groupName: 'myname',
    };
    const og = new ImmutableObjectiveGroup(_mut);

    it('should convert', () => {
        expect(og.toOriginal()).toEqual(_mut);
    });

    it('should be immutable', () => {
        const shadow: ObjectiveGroup = og;
        expect(() => { shadow.groupType = 'thing'; }).toThrowError(/Cannot set property groupType/);
        expect(og.groupType).toEqual('mytype');
    });
});

describe('ImmutableObjectiveTag', () => {
    const _mut: ObjectiveTag = {
        name: 'mytag',
    };
    const tag = new ImmutableObjectiveTag(_mut);

    it('should convert', () => {
        expect(tag.toOriginal()).toEqual(_mut);
    });

    it('should be immutable', () => {
        const shadow: ObjectiveTag = tag;
        expect(() => {shadow.name = 'another';}).toThrowError(/Cannot set property name/);
        expect(tag.name).toEqual('mytag');
    });
});

describe('ImmutableObjective', () => {
    const _mut: Objective = {
        name: 'My Objective',
        commitmentType: CommitmentType.Aspirational,
        notes: 'Some notes',
        resourceEstimate: 5,
        groups: [{groupType: 'class', groupName: 'myclass'}],
        tags: [{name: 'tag1'}, {name: 'tag2'}],
        assignments: [new Assignment('alice', 1)],
    };
    const obj = new ImmutableObjective(_mut);

    it('should convert', () => {
        expect(obj.toOriginal()).toEqual(_mut);
    });

    it('should be immutable', () => {
        // In order not to be a type system circumvention vector, the below should not compile.
        // However, I don't know how to assert it doesn't. :(
            
        //const shadow: Objective = obj;
    });
});