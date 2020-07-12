/**
 * Copyright 2019-2020 Google LLC
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
import { CommitmentType, ImmutableObjective, objectiveResourcesAllocated } from '../objective';
import { ImmutableSecondaryUnit } from '../period';

@Component({
  selector: 'app-objective-summary',
  templateUrl: './objective-summary.component.html',
  styleUrls: ['./objective-summary.component.css'],
  // Requires all inputs to be immutable
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ObjectiveSummaryComponent implements OnInit {
  @Input() objective?: ImmutableObjective;
  @Input() unit?: string;
  @Input() secondaryUnits?: readonly ImmutableSecondaryUnit[];

  constructor() { }

  ngOnInit() {
  }

  allocatedResources(): number {
    return objectiveResourcesAllocated(this.objective!);
  }

  allocationSummary(): string {
    if (this.isRejected()) {
      return this.objective!.resourceEstimate + '';
    } else if (this.isPartiallyAllocated()) {
      return this.allocatedResources() + ' of ' + this.objective!.resourceEstimate;
    } else {
      return this.allocatedResources() + '';
    }
  }

  isRejected(): boolean {
    return this.allocatedResources() <= 0;
  }

  isPartiallyAllocated(): boolean {
    return !this.isRejected() && this.allocatedResources() < this.objective!.resourceEstimate;
  }

  isCommittedAndFullyAllocated(): boolean {
    return this.objective!.commitmentType == CommitmentType.Committed &&
      this.allocatedResources() >= this.objective!.resourceEstimate;
  }
}
