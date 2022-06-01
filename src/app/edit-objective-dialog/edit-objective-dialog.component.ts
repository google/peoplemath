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
  EventEmitter,
  Inject,
  ViewEncapsulation,
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  CommitmentType,
  ObjectiveGroup,
  ObjectiveTag,
  ImmutableObjective,
  DisplayOptions,
} from '../objective';
import { AddLocation, ImmutableBucket } from '../bucket';
import { Assignment } from '../assignment';

export interface EditedObjective {
  name: string;
  resourceEstimate: number;
  commitmentType?: CommitmentType;
  groups: string;
  tags: string;
  notes: string;
  assignments: Assignment[];
  displayOptions: DisplayOptions;
  blockID?: string;
}

export enum SaveAction {
  New = 'new',
  Edit = 'edit',
}

export interface EditObjectiveDialogData {
  objective: EditedObjective;
  original?: ImmutableObjective;
  title: string;
  saveAction: SaveAction;
  unit: string;
  otherBuckets: readonly ImmutableBucket[];
  onMoveBucket?: EventEmitter<
    [ImmutableObjective, ImmutableObjective, ImmutableBucket]
  >;
  onDelete?: EventEmitter<ImmutableObjective>;
}

export const makeEditedObjective = (
  objective: ImmutableObjective
): EditedObjective => {
  const groupsStr = objective.groups
    .map((g) => g.groupType + ':' + g.groupName)
    .join(',');
  const tagsStr = objective.tags.map((t) => t.name).join(',');

  return {
    name: objective.name,
    resourceEstimate: objective.resourceEstimate,
    commitmentType: objective.commitmentType,
    groups: groupsStr,
    tags: tagsStr,
    notes: objective.notes,
    assignments: objective.assignments.map((a) => a.toOriginal()),
    displayOptions: objective.displayOptions?.toOriginal() || {
      enableMarkdown: false,
    },
    blockID: objective.blockID,
  };
};

export const makeGroups = (groupsStr: string): ObjectiveGroup[] => {
  if (!groupsStr.trim()) {
    return [];
  }
  return groupsStr.split(',').map((pairStr) => {
    const parts = pairStr.split(':').map((s) => s.trim());
    let result: ObjectiveGroup;
    if (parts.length === 2) {
      result = { groupType: parts[0], groupName: parts[1] };
    } else {
      result = { groupType: 'Group', groupName: pairStr };
    }
    return result;
  });
};

export const makeTags = (tagsStr: string): ObjectiveTag[] => {
  if (!tagsStr.trim()) {
    return [];
  }
  return tagsStr.split(',').map((s) => {
    const result: ObjectiveTag = {
      name: s.trim(),
    };
    return result;
  });
};

const makeObjective = (edited: EditedObjective): ImmutableObjective =>
  ImmutableObjective.fromObjective({
    name: edited.name,
    resourceEstimate: edited.resourceEstimate,
    commitmentType: edited.commitmentType,
    groups: makeGroups(edited.groups),
    tags: makeTags(edited.tags),
    notes: edited.notes,
    assignments: edited.assignments,
    displayOptions: edited.displayOptions,
    blockID: edited.blockID,
  });

@Component({
  selector: 'app-edit-objective-dialog',
  templateUrl: './edit-objective-dialog.component.html',
  styleUrls: ['./edit-objective-dialog.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class EditObjectiveDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<
      EditObjectiveDialogComponent,
      [ImmutableObjective, AddLocation | null]
    >,
    @Inject(MAT_DIALOG_DATA) public data: EditObjectiveDialogData
  ) {}

  showDeleteConfirm = false;

  isDataValid(): boolean {
    return (
      !!this.data.objective.name && this.data.objective.resourceEstimate >= 0
    );
  }

  onAddToTop(): void {
    this.dialogRef.close([makeObjective(this.data.objective), AddLocation.Top]);
  }

  onAddToBottom(): void {
    this.dialogRef.close([
      makeObjective(this.data.objective),
      AddLocation.Bottom,
    ]);
  }

  onSaveExisting(): void {
    this.dialogRef.close([makeObjective(this.data.objective), null]);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onMove(newBucket: ImmutableBucket): void {
    let oldObjective = { ...this.data.objective };
    // Block ID is no longer meaningful in the new bucket
    oldObjective.blockID = undefined;
    const newObjective = makeObjective(oldObjective);
    this.data.onMoveBucket!.emit([
      this.data.original!,
      newObjective,
      newBucket,
    ]);
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
