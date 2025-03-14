/**
 * Copyright 2020-2021, 2023, 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { ImmutableBucket } from '../bucket';
import { CommitmentType, ImmutableObjective } from '../objective';
import {
  MatCard,
  MatCardHeader,
  MatCardTitle,
  MatCardContent,
} from '@angular/material/card';
import { NgIf, NgFor, PercentPipe } from '@angular/common';
import { ObjectiveSummaryComponent } from '../objective-summary/objective-summary.component';

@Component({
  selector: 'app-bucket-summary',
  templateUrl: './bucket-summary.component.html',
  styleUrls: ['./bucket-summary.component.css'],
  // Requires all inputs to be immutable
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    NgIf,
    NgFor,
    ObjectiveSummaryComponent,
    PercentPipe,
  ],
})
export class BucketSummaryComponent {
  @Input() bucket?: ImmutableBucket;
  @Input() bucketAllocationFraction?: number;
  @Input() unit?: string;

  hasCommittedObjectives(): boolean {
    return this.committedObjectives().length > 0;
  }

  committedObjectives(): ImmutableObjective[] {
    return this.bucket!.objectives.filter(
      (o) =>
        o.commitmentType === CommitmentType.Committed &&
        o.resourcesAllocated() > 0
    );
  }

  hasAspirationalObjectives(): boolean {
    return this.aspirationalObjectives().length > 0;
  }

  aspirationalObjectives(): ImmutableObjective[] {
    return this.bucket!.objectives.filter(
      (o) =>
        o.commitmentType !== CommitmentType.Committed &&
        o.resourcesAllocated() > 0
    );
  }

  hasRejectedObjectives(): boolean {
    return this.rejectedObjectives().length > 0;
  }

  rejectedObjectives(): ImmutableObjective[] {
    return this.bucket!.objectives.filter((o) => o.resourcesAllocated() <= 0);
  }
}
