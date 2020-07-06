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

import { Bucket, ImmutableBucket } from "./bucket";
import { CommitmentType } from './objective';

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
    const bucket = new ImmutableBucket(_mut);

    it('should convert', () => {
        expect(bucket.toOriginal()).toEqual(_mut);
    });

    it('should be immutable', () => {
        // This should not compile, in order not to provide a circumvention vector to the type system.
        // However, I don't know how to assert it doesn't. :(
            
        //const shadow: Bucket = bucket;
    });
});