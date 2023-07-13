import { Component, Input } from '@angular/core';
import { AllocationType, ImmutableBucket } from '../bucket';

@Component({
  selector: 'app-bucket-alloc-limit',
  templateUrl: './bucket-alloc-limit.component.html',
  styleUrls: ['./bucket-alloc-limit.component.css'],
})
export class BucketAllocLimitComponent {
  @Input() hasError?: boolean;
  @Input() bucket?: ImmutableBucket;
  @Input() percentOfTotal?: number;
  @Input() unit?: string;

  constructor() {}

  differentPercentOfTotal(): boolean {
    return (
      Math.abs(this.bucket!.allocationPercentage - this.percentOfTotal!) > 1e-6
    );
  }
}
