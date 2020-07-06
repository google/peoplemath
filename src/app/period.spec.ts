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

import { Period, ImmutablePeriod, SecondaryUnit, ImmutableSecondaryUnit } from "./period";

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
        //su.name = 'something else';
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
        buckets: [],
        people: [],
        lastUpdateUUID: 'uuid',
    };
    const period = new ImmutablePeriod(_mut);

    it('should convert back', () => {
        const orig = period.toOriginal();
        expect(orig).toEqual(_mut);
    });

    it('should be immutable', () => {
        // ImmutablePeriod should not be assignable to Period,
        // Therefore, this shouldn't compile. But I don't know how to assert it doesn't. :(
        // This is required to ensure this isn't a vector for circumventing the type system.

        //const p: Period = period;
    });
});