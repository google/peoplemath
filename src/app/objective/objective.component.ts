// Copyright 2019-2020 Google LLC
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

import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Objective, CommitmentType } from '../objective';
import { Assignment } from '../assignment';
import { MatDialog } from '@angular/material/dialog';
import { PersonAssignmentData, AssignmentDialogComponent, AssignmentDialogData } from '../assignment-dialog/assignment-dialog.component';
import { EditObjectiveDialogComponent, EditObjectiveDialogData, makeEditedObjective } from '../edit-objective-dialog/edit-objective-dialog.component';
import { Bucket } from '../bucket';

@Component({
  selector: 'app-objective',
  templateUrl: './objective.component.html',
  styleUrls: ['./objective.component.css']
})
export class ObjectiveComponent implements OnInit {
  @Input() objective?: Objective;
  @Input() unit?: string;
  @Input() unallocatedTime?: Map<string, number>;
  @Input() isEditingEnabled?: boolean;
  @Input() isReorderingEnabled?: boolean;
  @Input() otherBuckets?: Bucket[];
  @Output() onMoveBucket = new EventEmitter<[Objective, Objective, Bucket]>();
  @Output() onDelete = new EventEmitter<Objective>();
  @Output() onChanged = new EventEmitter<[Objective, Objective]>();
  
  constructor(public dialog: MatDialog) { }

  ngOnInit() {
  }

  isFullyAllocated(): boolean {
    let assigned = this.objective!.assignments.map(a => a.commitment)
        .reduce((sum, current) => sum + current, 0);
    return assigned >= this.objective!.resourceEstimate;
  }

  assignmentSummary(): string {
    return this.objective!.assignments.filter(a => a.commitment > 0)
        .map(a => a.personId + ": " + a.commitment).join(", ");
  }

  currentAssignment(personId: string): number {
    return this.objective!.assignments.filter(a => a.personId === personId)
        .map(a => a.commitment)
        .reduce((sum, current) => sum + current, 0);
  }

  assign(): void {
    if (!this.isEditingEnabled) {
      return;
    }
    let assignmentData: PersonAssignmentData[] = [];
    this.unallocatedTime!.forEach((unallocated, personId) => {
      let currentAssignment = this.currentAssignment(personId);
      assignmentData.push(new PersonAssignmentData(
        personId, unallocated + currentAssignment, currentAssignment));
    });
    const dialogData: AssignmentDialogData = {
      'objective': this.objective!,
      'people': assignmentData,
      'unit': this.unit!,
      'columns': ['person', 'available', 'assign', 'actions']};
    const dialogRef = this.dialog.open(AssignmentDialogComponent, {
      'width': '700px',
      'data': dialogData});
    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return;
      }
      this.objective!.assignments = result.people.filter((pad: PersonAssignmentData) => pad.assign > 0)
          .map((pad: PersonAssignmentData) => new Assignment(pad.username, pad.assign));
      this.onChanged.emit([this.objective!, this.objective!]);
    });
  }

  edit(): void {
    if (!this.isEditingEnabled) {
      return;
    }
    const dialogData: EditObjectiveDialogData = {
      objective: makeEditedObjective(this.objective!),
      original: this.objective!,
      title: 'Edit Objective',
      okAction: 'OK',
      unit: this.unit!,
      otherBuckets: this.otherBuckets!,
      onMoveBucket: this.onMoveBucket,
      onDelete: this.onDelete,
    };
    const dialogRef = this.dialog.open(EditObjectiveDialogComponent, {data: dialogData});
    dialogRef.afterClosed().subscribe(newObjective => {
      if (newObjective) {
        this.onChanged.emit([this.objective!, newObjective]);
      }
    });
  }

  isCommitted(): boolean {
    return this.objective!.commitmentType == CommitmentType.Committed;
  }

  showAssignButton(): boolean {
    return !this.objective?.assignments.length;
  }

  enableAssignButton(): boolean {
    return !!this.isEditingEnabled && this.objective!.resourceEstimate > 0;
  }
}
