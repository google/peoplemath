import { Pipe, PipeTransform } from '@angular/core';
import { DisplayObjective } from './bucket.component';
import { ImmutableObjective } from '../objective';

@Pipe({
  name: 'displayObjectives'
})
export class DisplayObjectivesPipe implements PipeTransform {

  transform(objectives: readonly ImmutableObjective[], ...args: unknown[]): Array<DisplayObjective> {
    const displayObjectives: Array<DisplayObjective> = [];
    let cumulativeSum = 0;
    for (const objective of objectives) {
      cumulativeSum += objective.resourceEstimate;
      displayObjectives.push({ objective, cumulativeSum });
    }
    return displayObjectives;
  }

}
