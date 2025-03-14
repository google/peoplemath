/**
 * Copyright 2023, 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, Input } from '@angular/core';
import { ImmutableBucket } from '../bucket';
import { NgIf, DecimalPipe } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-bucket-alloc-limit',
  templateUrl: './bucket-alloc-limit.component.html',
  styleUrls: ['./bucket-alloc-limit.component.css'],
  imports: [NgIf, MatTooltip, DecimalPipe],
})
export class BucketAllocLimitComponent {
  @Input() hasError?: boolean;
  @Input() bucket?: ImmutableBucket;
  @Input() percentOfTotal?: number;
  @Input() unit?: string;

  differentPercentOfTotal(): boolean {
    return (
      Math.abs(this.bucket!.allocationPercentage - this.percentOfTotal!) > 1e-6
    );
  }

  isPercentOfTotalBad(): boolean {
    return this.percentOfTotal! < 0 || this.percentOfTotal! > 100;
  }
}
