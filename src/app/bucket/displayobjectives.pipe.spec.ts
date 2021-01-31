/**
 * Copyright 2021 Google LLC
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

import { DisplayObjectivesPipe } from './displayobjectives.pipe';
import { Objective } from '../objective';
import { Bucket, ImmutableBucket } from '../bucket';

const DEFAULT_OBJECTIVES: Objective[] = [
  {
    name: 'max',
    resourceEstimate: 10,
    notes: '',
    groups: [],
    tags: [],
    assignments: [],
  },
  {
    name: 'john',
    resourceEstimate: 20,
    notes: '',
    groups: [],
    tags: [],
    assignments: [],
  },
];

const bucket = ImmutableBucket.fromBucket(
  new Bucket('test bucket', 100, DEFAULT_OBJECTIVES)
);

describe('DisplayobjectivesPipe', () => {
  it('should calculate the cumulative sum', () => {
    const pipe = new DisplayObjectivesPipe();
    const displayObjectives = pipe.transform(bucket.objectives);

    expect(displayObjectives[0].cumulativeSum).toBe(10);
    expect(displayObjectives[1].cumulativeSum).toBe(30);
  });
});
