import { Assignment } from '../assignment';
import { ImmutableObjective } from '../objective';
import { BlockplaceholdersPipe } from './blockplaceholders.pipe';
import { DisplayObjective } from './bucket.component';

function objt(
  name: string,
  resourceEstimate: number,
  assignments?: Assignment[],
  blockID?: string
): ImmutableObjective {
  return ImmutableObjective.fromObjective({
    name: name,
    resourceEstimate: resourceEstimate,
    blockID: blockID,
    notes: '',
    groups: [],
    tags: [],
    assignments: assignments || [],
  });
}

function dobjt(
  name: string,
  resourceEstimate: number,
  csum: number,
  assignments?: Assignment[],
  blockID?: string
): DisplayObjective {
  return {
    objective: objt(name, resourceEstimate, assignments, blockID),
    cumulativeSum: csum,
  };
}

describe('BlockplaceholdersPipe', () => {
  it('should replace blocks with placeholders', () => {
    const pipe = new BlockplaceholdersPipe();
    const assignments1 = [
      { personId: 'a', commitment: 1 },
      { personId: 'b', commitment: 2 },
    ];
    const assignments2 = [{ personId: 'a', commitment: 2 }];
    const objectiveBlocks = [
      [dobjt('O1', 1, 1)],
      [
        dobjt('O2', 1, 2, assignments1, 'block1'),
        dobjt('O3', 1, 3, assignments2, 'block1'),
      ],
      [dobjt('O4', 1, 4, [{ personId: 'a', commitment: 5 }])],
    ];
    const assignSum = [
      { personId: 'a', commitment: 3 },
      { personId: 'b', commitment: 2 },
    ];
    expect(pipe.transform(objectiveBlocks)).toEqual([
      dobjt('O1', 1, 1),
      dobjt('O2 (and 1 more)', 2, 3, assignSum, 'block1'),
      dobjt('O4', 1, 4, [{ personId: 'a', commitment: 5 }]),
    ]);
  });
});
