import { Component, OnInit, Input } from '@angular/core';
import { Bucket } from '../bucket';
import { Objective } from '../objective';
import { Assignment } from '../assignment';
import { PersonAvailabilityService } from '../person-availability.service';

@Component({
  selector: 'app-bucket',
  templateUrl: './bucket.component.html',
  styleUrls: ['./bucket.component.css']
})
export class BucketComponent implements OnInit {
  @Input() bucket: Bucket;
  @Input() unit: string;
  @Input() totalAllocationPercentage: number;
  @Input() globalResourcesAvailable: number;

  constructor(
    private personAvailabilityService: PersonAvailabilityService,
  ) { }

  ngOnInit() {
    this.personAvailabilityService.totalAvailability$.subscribe(
      totalAvailability => this.globalResourcesAvailable = totalAvailability);
  }

  /**
   * Resources allocated to the given bucket in this period, based on total available
   * and bucket allocation percentage.
   */
  bucketAllocation(): number {
    return this.globalResourcesAvailable * this.bucket.allocationPercentage / 100;
  }
}
