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

import { ImmutableObjective } from '../objective';
import { DisplayObjective } from './bucket.component';
import { GroupblocksPipe } from './groupblocks.pipe';

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

describe('GroupblocksPipe', () => {
  it('should group items into blocks', () => {
    const pipe = new GroupblocksPipe();
    const objectives = [
      dobjt('O1', 1, 1),
      dobjt('O2', 1, 2),
      dobjt('O3', 1, 3, 'block1'),
      dobjt('O4', 1, 4, 'block1'),
      dobjt('O5', 1, 5, 'block2'),
      dobjt('O6', 1, 6, 'block2'),
      dobjt('O7', 1, 7),
    ];
    const objectiveBlocks = pipe.transform(objectives);
    expect(objectiveBlocks).toEqual([
      [dobjt('O1', 1, 1)],
      [dobjt('O2', 1, 2)],
      [dobjt('O3', 1, 3, 'block1'), dobjt('O4', 1, 4, 'block1')],
      [dobjt('O5', 1, 5, 'block2'), dobjt('O6', 1, 6, 'block2')],
      [dobjt('O7', 1, 7)],
    ]);
  });
});
