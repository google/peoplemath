import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

/**
 * Service to facilitate bidirectional communication between parent
 * and child components about people availability.
 */
@Injectable()
export class PersonAvailabilityService {

  constructor() { }

  private totalAvailabilitySource = new Subject<number>();
  totalAvailability$ = this.totalAvailabilitySource.asObservable();
  
  /**
   * Called when a new total availability number is calculated.
   */
  setTotalAvailability(totalAvailability: number): void {
    this.totalAvailabilitySource.next(totalAvailability);
  }
}
