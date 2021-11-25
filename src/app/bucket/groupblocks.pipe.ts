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
