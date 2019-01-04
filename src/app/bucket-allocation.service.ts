import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

/**
 * Service to facilitate bidirectional communication between parent
 * and child components regarding bucket allocation changes.
 */
@Injectable()
export class BucketAllocationService {

  constructor() { }

  private allocationsChangedSource = new Subject<void>();
  allocationsChanged$ = this.allocationsChangedSource.asObservable();

  private totalAllocationPctSource = new Subject<number>();
  totalAllocationPct$ = this.totalAllocationPctSource.asObservable();

  /**
   * Called when the allocation percentage of an individual bucket changes.
   */
  onAllocationsChanged(): void {
    this.allocationsChangedSource.next();
  }

  /**
   * Called when a new total allocation percentage has been calculated.
   */
  setTotalAllocationPercentage(totalAllocationPercentage: number): void {
    this.totalAllocationPctSource.next(totalAllocationPercentage);
  }
}
