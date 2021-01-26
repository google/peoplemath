import { Pipe, PipeTransform } from '@angular/core';
import { DisplayObjective } from './bucket.component'
import { ImmutableObjective } from '../objective';

@Pipe({
  name: 'displayObjectives'
})
export class DisplayObjectivesPipe implements PipeTransform {

  transform(objectives: readonly ImmutableObjective[], ...args: unknown[]): Array<DisplayObjective> {
    let displayObjectives: Array<DisplayObjective> = [];
    let cumulativeSum = 0;
    for (let objective of objectives) {
      cumulativeSum += objective.resourceEstimate
      displayObjectives.push({ objective: objective, cumulativeSum: cumulativeSum })
    }
    return displayObjectives;
  }

}
