// Copyright 2019-2022 Google LLC
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
  Input,
  EventEmitter,
  Output,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  CommitmentType,
  editObjective,
  ImmutableObjective,
} from '../objective';
import { Assignment, ImmutableAssignment } from '../assignment';
import { MatDialog } from '@angular/material/dialog';
import {
  PersonAssignmentData,
  AssignmentDialogComponent,
  AssignmentDialogData,
} from '../assignment-dialog/assignment-dialog.component';
import { ImmutableBucket } from '../bucket';

@Component({
  selector: 'app-objective',
  templateUrl: './objective.component.html',
  styleUrls: ['./objective.component.css'],
  // Requires all inputs to be immutable
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ObjectiveComponent {
  @Input() objective?: ImmutableObjective;
  @Input() unit?: string;
  @Input() unallocatedTime?: ReadonlyMap<string, number>;
  @Input() isEditingEnabled?: boolean;
  @Input() otherBuckets?: readonly ImmutableBucket[];
  @Input() bucketAllocationLimit?: number;
  @Input() resourcesCumulativeSum?: number;
  @Output() moveBucket = new EventEmitter<
    [ImmutableObjective, ImmutableObjective, ImmutableBucket]
  >();
  @Output() delete = new EventEmitter<ImmutableObjective>();
  @Output() changed = new EventEmitter<
    [ImmutableObjective, ImmutableObjective]
  >();

  constructor(public dialog: MatDialog) {}

  hasPeopleAvailable(): boolean {
    return (
      !!this.objective!.assignments.find((a) => a.commitment > 0) ||
      !!Array.from(this.unallocatedTime!.values()).find((t) => t > 0)
    );
  }

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

  currentAssignment(personId: string): number {
    return this.objective!.assignments.filter((a) => a.personId === personId)
      .map((a) => a.commitment)
      .reduce((sum, current) => sum + current, 0);
  }

  personAssignmentData(): PersonAssignmentData[] {
    const assignmentData: PersonAssignmentData[] = [];
    this.unallocatedTime!.forEach((unallocated, personId) => {
      const currentAssignment = this.currentAssignment(personId);
      if (unallocated > 0 || currentAssignment > 0) {
        assignmentData.push({
          username: personId,
          available: unallocated + currentAssignment,
          assign: currentAssignment,
        });
      }
    });
    return assignmentData;
  }

  assign(): void {
    if (!this.enableAssignButton()) {
      return;
    }
    const dialogData: AssignmentDialogData = {
      objective: this.objective!.toOriginal(),
      people: this.personAssignmentData(),
      unit: this.unit!,
      columns: ['person', 'available', 'assign', 'actions'],
    };
    const dialogRef = this.dialog.open(AssignmentDialogComponent, {
      width: '700px',
      data: dialogData,
    });
    dialogRef.afterClosed().subscribe((result?: AssignmentDialogData) => {
      if (!result) {
        return;
      }
      const newAssignments = result.people
        .filter((pad: PersonAssignmentData) => pad.assign > 0)
        .map(
          (pad: PersonAssignmentData) =>
            new ImmutableAssignment(new Assignment(pad.username, pad.assign))
        );
      const newObjective = this.objective!.withAssignments(newAssignments);
      this.changed.emit([this.objective!, newObjective]);
    });
  }

  edit(): void {
    if (!this.isEditingEnabled) {
      return;
    }
    editObjective(
      this.objective!,
      this.unit!,
      this.otherBuckets!,
      this.moveBucket,
      this.delete,
      this.changed,
      this.dialog
    );
  }

  isCommitted(): boolean {
    return this.objective!.commitmentType === CommitmentType.Committed;
  }

  showAssignButton(): boolean {
    return !this.objective?.assignments.length;
  }

  enableAssignButton(): boolean {
    return (
      !!this.isEditingEnabled &&
      (this.objective!.resourceEstimate > 0 ||
        this.objective!.assignments.length > 0) &&
      this.hasPeopleAvailable()
    );
  }
}
