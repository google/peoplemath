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
import { sumAssignments } from '../assignment';
import { ImmutableObjective } from '../objective';
import { DisplayObjective } from './bucket.component';

/*
 * Pipe to replace each block with a placeholder objective
 */
@Pipe({
  name: 'blockPlaceholders',
})
export class BlockplaceholdersPipe implements PipeTransform {
  transform(
    objectiveBlocks: DisplayObjective[][],
    ...args: unknown[]
  ): DisplayObjective[] {
    let result: DisplayObjective[] = [];
    for (const objectiveBlock of objectiveBlocks) {
      if (objectiveBlock.length === 1) {
        result.push(objectiveBlock[0]);
        continue;
      }
      const first = objectiveBlock[0].objective;
      result.push({
        objective: ImmutableObjective.fromObjective({
          name:
            first.name + ' **(and ' + (objectiveBlock.length - 1) + ' more)**',
          resourceEstimate: objectiveBlock
            .map((o) => o.objective.resourceEstimate)
            .reduce((a, b) => a + b, 0),
          notes: '',
          groups: [],
          tags: [],
          assignments: sumAssignments(
            objectiveBlock.map((o) => o.objective.assignments)
          ),
          blockID: first.blockID,
          displayOptions: first.displayOptions,
        }),
        cumulativeSum: objectiveBlock[objectiveBlock.length - 1].cumulativeSum,
      });
    }
    return result;
  }
}
