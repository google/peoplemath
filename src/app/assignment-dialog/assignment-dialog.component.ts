// Copyright 2019 Google LLC
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

import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Objective } from '../objective';

export interface PersonAssignmentData {
    username: string;
    available: number;
    assign: number;
}

export interface AssignmentDialogData {
  objective: Objective;
  people: PersonAssignmentData[];
  unit: string;
  columns: string[];
}

@Component({
  selector: 'app-assignment-dialog',
  templateUrl: './assignment-dialog.component.html',
  styleUrls: ['./assignment-dialog.component.css']
})
export class AssignmentDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<AssignmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AssignmentDialogData
  ) {}

  ngOnInit(): void {}

  onCancel(): void {
    this.dialogRef.close();
  }

  /**
   * Amount of the estimated time for the objective which isn't yet assigned
   */
  unassignedTime(): number {
    const assigned = this.data.people.map(d => d.assign).reduce((sum, current) => sum + current, 0);
    return this.data.objective.resourceEstimate - assigned;
  }

  assignNone(row: PersonAssignmentData): void {
    row.assign = 0;
  }

  assignRemaining(row: PersonAssignmentData): void {
    row.assign = Math.min(row.available, this.unassignedTime() + row.assign);
  }

  assignMore(row: PersonAssignmentData): void {
    row.assign = Math.min(row.available, row.assign + 1);
  }

  assignLess(row: PersonAssignmentData): void {
    row.assign = Math.max(0, row.assign - 1);
  }

  isFullyAllocated(row: PersonAssignmentData): boolean {
    return row.assign >= row.available;
  }

  isFullyUnallocated(row: PersonAssignmentData): boolean {
    return row.assign <= 0;
  }

  isDataValid(): boolean {
    return this.unassignedTime() >= 0;
  }
}
