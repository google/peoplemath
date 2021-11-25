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
import { ImmutableObjective } from '../objective';
import { DisplayObjective } from './bucket.component';

function objt(
  name: string,
  resourceEstimate: number,
  blockID?: string
): ImmutableObjective {
  return ImmutableObjective.fromObjective({
    name: name,
    resourceEstimate: resourceEstimate,
    blockID: blockID,
    notes: '',
    groups: [],
    tags: [],
    assignments: [],
  });
}

function dobjt(
  name: string,
  resourceEstimate: number,
  csum: number,
  blockID?: string
): DisplayObjective {
  return {
    objective: objt(name, resourceEstimate, blockID),
    cumulativeSum: csum,
  };
}

describe('DisplayobjectivesPipe', () => {
  it('should calculate the cumulative sum', () => {
    const pipe = new DisplayObjectivesPipe();
    const objectives = [objt('max', 10), objt('john', 20)];
    const displayObjectiveBlocks = pipe.transform(objectives);

    expect(displayObjectiveBlocks).toEqual([
      dobjt('max', 10, 10),
      dobjt('john', 20, 30),
    ]);
  });
});
