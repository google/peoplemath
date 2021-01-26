import { Pipe, PipeTransform } from '@angular/core';
import { DisplayObjective } from './bucket.component'
import { ImmutableBucket } from '../bucket';

@Pipe({
  name: 'displayObjectives'
})
export class DisplayobjectivesPipe implements PipeTransform {

  transform(bucket: ImmutableBucket, ...args: unknown[]): Array<DisplayObjective> {
    let displayObjectives: Array<DisplayObjective> = [];
    let cumulativeSum = 0;
    for (let objective of bucket!.objectives) {
      cumulativeSum += objective.resourceEstimate
      displayObjectives.push({ objective: objective, cumulativeSum: cumulativeSum })
    }
    return displayObjectives;
  }

}
