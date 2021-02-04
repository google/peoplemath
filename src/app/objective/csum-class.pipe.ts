import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'csumClass',
})
export class CsumClassPipe implements PipeTransform {
  transform(
    cumulativeSum: number,
    bucketLimit: number,
    resourceEstimate: number
  ): string {
    if (cumulativeSum < bucketLimit) {
      return 'resource-csum-ok';
    } else if (cumulativeSum - resourceEstimate <= bucketLimit) {
      return 'resource-csum-marginal';
    } else {
      return 'resource-csum-excess';
    }
  }
}
