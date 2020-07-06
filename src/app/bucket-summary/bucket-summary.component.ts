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

import { Component, OnInit, Input } from '@angular/core';
import { Bucket } from '../bucket';
import { Objective, CommitmentType, objectiveResourcesAllocated } from '../objective';

@Component({
  selector: 'app-bucket-summary',
  templateUrl: './bucket-summary.component.html',
  styleUrls: ['./bucket-summary.component.css']
})
export class BucketSummaryComponent implements OnInit {
  @Input() bucket?: Bucket;
  @Input() bucketAllocationFraction?: number;
  @Input() unit?: string;

  constructor() { }

  ngOnInit(): void {
  }

  hasCommittedObjectives(): boolean {
    return this.committedObjectives().length > 0;
  }

  committedObjectives(): Objective[] {
    return this.bucket!.objectives.filter(
      o => o.commitmentType == CommitmentType.Committed &&
      objectiveResourcesAllocated(o) > 0);
  }

  hasAspirationalObjectives(): boolean {
    return this.aspirationalObjectives().length > 0;
  }

  aspirationalObjectives(): Objective[] {
    return this.bucket!.objectives.filter(
      o => o.commitmentType != CommitmentType.Committed &&
      objectiveResourcesAllocated(o) > 0);
  }

  hasRejectedObjectives(): boolean {
    return this.rejectedObjectives().length > 0;
  }

  rejectedObjectives(): Objective[] {
    return this.bucket!.objectives.filter(o => objectiveResourcesAllocated(o) <= 0);
  }
}
