// Copyright 2019-2021 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {
  Component,
  OnInit,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommitmentType, ImmutableObjective } from '../objective';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-objective',
  templateUrl: './objective.component.html',
  styleUrls: ['./objective.component.css'],
  // Requires all inputs to be immutable
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ObjectiveComponent implements OnInit {
  @Input() objective?: ImmutableObjective;
  @Input() unit?: string;
  @Input() isEditingEnabled?: boolean;
  @Input() assignActionClass?: string;
  @Input() isAssignButtonEnabled?: boolean;
  @Input() bucketAllocationLimit?: number;
  @Input() resourcesCumulativeSum?: number;

  constructor(public dialog: MatDialog) {}

  ngOnInit(): void {}

  isFullyAllocated(): boolean {
    return this.totalAssignedResources() >= this.objective!.resourceEstimate;
  }

  isOverAllocated(): boolean {
    // Use a small increment here to avoid potential floating-point issues
    return (
      this.totalAssignedResources() > this.objective!.resourceEstimate + 1e-6
    );
  }

  totalAssignedResources(): number {
    return this.objective!.assignments.map((a) => a.commitment).reduce(
      (sum, current) => sum + current,
      0
    );
  }

  isCommitted(): boolean {
    return this.objective!.commitmentType === CommitmentType.Committed;
  }

  showAssignButton(): boolean {
    return !this.objective?.assignments.length;
  }
}
