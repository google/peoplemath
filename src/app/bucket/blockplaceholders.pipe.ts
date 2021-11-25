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
          name: first.name + ' (and ' + (objectiveBlock.length - 1) + ' more)',
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
        }),
        cumulativeSum: objectiveBlock[objectiveBlock.length - 1].cumulativeSum,
      });
    }
    return result;
  }
}
