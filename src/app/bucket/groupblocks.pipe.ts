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

import { Pipe, PipeTransform } from '@angular/core';
import { ImmutableObjective } from '../objective';
import { DisplayObjective } from './bucket.component';

@Pipe({
  name: 'groupBlocks',
})
export class GroupblocksPipe implements PipeTransform {
  transform(
    objectives: readonly DisplayObjective[],
    ...args: unknown[]
  ): DisplayObjective[][] {
    let blocks: DisplayObjective[][] = [];
    let currentBlock: DisplayObjective[] = [];
    let currentBlockID = undefined;
    for (const o of objectives) {
      if (!o.objective.blockID || o.objective.blockID != currentBlockID) {
        if (currentBlock.length > 0) {
          blocks.push(currentBlock);
          currentBlock = [];
        }
      }
      currentBlockID = o.objective.blockID;
      currentBlock.push(o);
    }
    if (currentBlock.length > 0) {
      blocks.push(currentBlock);
    }
    return blocks;
  }
}
