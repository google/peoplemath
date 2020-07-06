/**
 * Copyright 2020 Google LLC
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

import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { ImmutableBucket } from '../bucket';
import { CommitmentType, ImmutableObjective, objectiveResourcesAllocatedI } from '../objective';
import { List } from 'immutable';

@Component({
  selector: 'app-bucket-summary',
  templateUrl: './bucket-summary.component.html',
  styleUrls: ['./bucket-summary.component.css'],
  // Requires all inputs to be immutable
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BucketSummaryComponent implements OnInit {
  @Input() bucket?: ImmutableBucket;
  @Input() bucketAllocationFraction?: number;
  @Input() unit?: string;

  constructor() { }

  ngOnInit(): void {
  }

  hasCommittedObjectives(): boolean {
    return !this.committedObjectives().isEmpty();
  }

  committedObjectives(): List<ImmutableObjective> {
    return this.bucket!.objectives.filter(
      o => o.commitmentType == CommitmentType.Committed &&
      objectiveResourcesAllocatedI(o) > 0);
  }

  hasAspirationalObjectives(): boolean {
    return !this.aspirationalObjectives().isEmpty();
  }

  aspirationalObjectives(): List<ImmutableObjective> {
    return this.bucket!.objectives.filter(
      o => o.commitmentType != CommitmentType.Committed &&
      objectiveResourcesAllocatedI(o) > 0);
  }

  hasRejectedObjectives(): boolean {
    return !this.rejectedObjectives().isEmpty();
  }

  rejectedObjectives(): List<ImmutableObjective> {
    return this.bucket!.objectives.filter(o => objectiveResourcesAllocatedI(o) <= 0);
  }
}
