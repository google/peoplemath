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

import { Component, OnInit, Inject, EventEmitter } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommitmentType, ObjectiveGroup, ObjectiveTag, ImmutableObjective } from '../objective';
import { ImmutableBucket } from '../bucket';
import { Assignment } from '../assignment';

export interface EditedObjective {
  name: string;
  resourceEstimate: number;
  commitmentType?: CommitmentType;
  groups: string;
  tags: string;
  notes: string;
  assignments: Assignment[],
}

export interface EditObjectiveDialogData {
  objective: EditedObjective;
  original?: ImmutableObjective;
  title: string;
  okAction: string;
  unit: string;
  otherBuckets: readonly ImmutableBucket[];
  onMoveBucket?: EventEmitter<[ImmutableObjective, ImmutableObjective, ImmutableBucket]>;
  onDelete?: EventEmitter<ImmutableObjective>;
}

export function makeEditedObjective(objective: ImmutableObjective): EditedObjective {
  let groupsStr = objective.groups.map(g => g.groupType + ":" + g.groupName).join(",");
  let tagsStr = objective.tags.map(t => t.name).join(",");

  return {
    name: objective.name,
    resourceEstimate: objective.resourceEstimate,
    commitmentType: objective.commitmentType,
    groups: groupsStr,
    tags: tagsStr,
    notes: objective.notes,
    assignments: objective.assignments.map(a => a.toOriginal()),
  };
}

export function makeGroups(groupsStr: string): ObjectiveGroup[] {
  if (!groupsStr.trim()) {
    return [];
  }
  return groupsStr.split(",").map(pairStr => {
    let parts = pairStr.split(":").map(s => s.trim());
    let result: ObjectiveGroup;
    if (parts.length == 2) {
      result = {groupType: parts[0], groupName: parts[1]};
    } else {
      result = {groupType: "Group", groupName: pairStr};
    }
    return result;
  })
}

export function makeTags(tagsStr: string): ObjectiveTag[] {
  if (!tagsStr.trim()) {
    return [];
  }
  return tagsStr.split(",").map(s => {
    let result: ObjectiveTag = {
      name: s.trim(),
    };
    return result;
  });
}

function makeObjective(edited: EditedObjective): ImmutableObjective {
  return ImmutableObjective.fromObjective({
    name: edited.name,
    resourceEstimate: edited.resourceEstimate,
    commitmentType: edited.commitmentType,
    groups: makeGroups(edited.groups),
    tags: makeTags(edited.tags),
    notes: edited.notes,
    assignments: edited.assignments,
  });
}

@Component({
  selector: 'app-edit-objective-dialog',
  templateUrl: './edit-objective-dialog.component.html',
  styleUrls: ['./edit-objective-dialog.component.css']
})
export class EditObjectiveDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<EditObjectiveDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditObjectiveDialogData) { }

  showDeleteConfirm: boolean = false;

  ngOnInit() {
  }

  isDataValid(): boolean {
    return !!this.data.objective.name && this.data.objective.resourceEstimate >= 0;
  }

  onSave(): void {
    this.dialogRef.close(makeObjective(this.data.objective));
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onMove(newBucket: ImmutableBucket): void {
    let newObjective = makeObjective(this.data.objective);
    this.data.onMoveBucket!.emit([this.data.original!, newObjective, newBucket]);
    this.dialogRef.close();
  }

  onDelete(): void {
    this.showDeleteConfirm = true;
  }

  onConfirmDelete(): void {
    this.data.onDelete!.emit(this.data.original);
    this.dialogRef.close();
  }

  onCancelDelete(): void {
    this.showDeleteConfirm = false;
  }
}
