// Copyright 2019-2023 Google LLC
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

import { EventEmitter } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Assignment, ImmutableAssignment } from './assignment';
import { ImmutableBucket } from './bucket';
import {
  EditObjectiveDialogComponent,
  EditObjectiveDialogData,
  makeEditedObjective,
  SaveAction,
} from './edit-objective-dialog/edit-objective-dialog.component';
import { ImmutablePerson } from './person';

export enum CommitmentType {
  Aspirational = 'Aspirational',
  Committed = 'Committed',
}

export interface ObjectiveGroup {
  groupType: string;
  groupName: string;
}

export class ImmutableObjectiveGroup {
  private readonly _groupType: string;
  private readonly _groupName: string;

  get groupType(): string {
    return this._groupType;
  }
  get groupName(): string {
    return this._groupName;
  }

  constructor(g: ObjectiveGroup) {
    this._groupType = g.groupType;
    this._groupName = g.groupName;
  }

  toOriginal(): ObjectiveGroup {
    return { groupType: this.groupType, groupName: this.groupName };
  }
}

export interface ObjectiveTag {
  name: string;
}

export class ImmutableObjectiveTag {
  private readonly _name: string;

  get name(): string {
    return this._name;
  }

  constructor(t: ObjectiveTag) {
    this._name = t.name;
  }

  toOriginal(): ObjectiveTag {
    return { name: this.name };
  }
}

export interface DisplayOptions {
  enableMarkdown: boolean;
}

export class ImmutableDisplayOptions {
  readonly _enableMarkdown: boolean;

  get enableMarkdown(): boolean {
    return this._enableMarkdown;
  }

  constructor(t: DisplayOptions) {
    this._enableMarkdown = t.enableMarkdown;
  }

  toOriginal(): DisplayOptions {
    return { enableMarkdown: this.enableMarkdown };
  }
}

export interface Objective {
  name: string;
  resourceEstimate: number;
  commitmentType?: CommitmentType;
  notes: string;
  groups: ObjectiveGroup[];
  tags: ObjectiveTag[];
  assignments: Assignment[];
  displayOptions?: DisplayOptions;
  blockID?: string;
}

// Boilerplate avoidance device
interface ImmutableObjectiveIF {
  readonly name: string;
  readonly resourceEstimate: number;
  readonly commitmentType?: CommitmentType;
  readonly notes: string;
  readonly groups: readonly ImmutableObjectiveGroup[];
  readonly tags: readonly ImmutableObjectiveTag[];
  readonly assignments: readonly ImmutableAssignment[];
  readonly displayOptions?: ImmutableDisplayOptions;
  readonly blockID?: string;
}

export class ImmutableObjective {
  // The readonly arrays here mean we don't need getter boilerplate
  // to avoid ImmutableObjective being assignable to Objective.
  readonly name: string;
  readonly resourceEstimate: number;
  readonly commitmentType?: CommitmentType;
  readonly notes: string;
  readonly groups: readonly ImmutableObjectiveGroup[];
  readonly tags: readonly ImmutableObjectiveTag[];
  readonly assignments: readonly ImmutableAssignment[];
  readonly displayOptions?: ImmutableDisplayOptions;
  readonly blockID?: string;

  private constructor(o: ImmutableObjectiveIF) {
    this.name = o.name;
    this.resourceEstimate = o.resourceEstimate;
    this.commitmentType = o.commitmentType;
    this.notes = o.notes;
    this.groups = o.groups;
    this.tags = o.tags;
    this.assignments = o.assignments;
    this.displayOptions = o.displayOptions;
    this.blockID = o.blockID;
  }

  static fromObjective(objective: Objective): ImmutableObjective {
    return new ImmutableObjective({
      name: objective.name,
      resourceEstimate: objective.resourceEstimate,
      commitmentType: objective.commitmentType,
      notes: objective.notes,
      groups: objective.groups
        ? objective.groups.map((g) => new ImmutableObjectiveGroup(g))
        : [],
      tags: objective.tags
        ? objective.tags.map((t) => new ImmutableObjectiveTag(t))
        : [],
      assignments: objective.assignments
        ? objective.assignments.map((a) => new ImmutableAssignment(a))
        : [],
      displayOptions:
        objective.displayOptions === undefined
          ? undefined
          : new ImmutableDisplayOptions(objective.displayOptions),
      blockID: objective.blockID,
    });
  }

  toOriginal(): Objective {
    const result: Objective = {
      name: this.name,
      resourceEstimate: this.resourceEstimate,
      commitmentType: this.commitmentType,
      notes: this.notes,
      groups: this.groups.map((g) => g.toOriginal()),
      tags: this.tags.map((t) => t.toOriginal()),
      assignments: this.assignments.map((a) => a.toOriginal()),
      displayOptions: this.displayOptions?.toOriginal(),
    };
    if (this.blockID) {
      result.blockID = this.blockID;
    }
    return result;
  }

  withAssignments(
    newAssignments: readonly ImmutableAssignment[]
  ): ImmutableObjective {
    return new ImmutableObjective({ ...this, assignments: newAssignments });
  }

  withPersonDeleted(person: ImmutablePerson): ImmutableObjective {
    return this.withAssignments(
      this.assignments.filter((a) => a.personId !== person.id)
    );
  }

  withGroupRenamed(
    groupType: string,
    oldName: string,
    newName: string
  ): ImmutableObjective {
    const index = this.groups.findIndex(
      (g) => g.groupType === groupType && g.groupName === oldName
    );
    if (index < 0) {
      return this;
    }
    const newGroups = [...this.groups];
    newGroups[index] = new ImmutableObjectiveGroup({
      groupType,
      groupName: newName,
    });
    return new ImmutableObjective({ ...this, groups: newGroups });
  }

  withTagRenamed(oldName: string, newName: string): ImmutableObjective {
    const index = this.tags.findIndex((t) => t.name === oldName);
    if (index < 0) {
      return this;
    }
    const newTags = [...this.tags];
    if (newTags.find((t) => t.name === newName)) {
      // Tag with the new name already exists. Just delete the old tag.
      newTags.splice(index, 1);
    } else {
      newTags[index] = new ImmutableObjectiveTag({ name: newName });
    }
    return new ImmutableObjective({ ...this, tags: newTags });
  }

  withBlockID(blockID?: string): ImmutableObjective {
    return new ImmutableObjective({ ...this, blockID: blockID });
  }

  /**
   * Sum of resources allocated to the given objective.
   */
  resourcesAllocated(): number {
    return this.assignments
      .map((assignment) => assignment.commitment)
      .reduce((sum, current) => sum + current, 0);
  }
}

/**
 * Sum of resources allocated to a number of objectives.
 */
export const totalResourcesAllocated = (
  objectives: readonly ImmutableObjective[]
): number => objectives.reduce((sum, ob) => sum + ob.resourcesAllocated(), 0);

export function editObjective(
  objective: ImmutableObjective,
  unit: string,
  currentBucket: ImmutableBucket,
  otherBuckets: readonly ImmutableBucket[],
  onMoveBucket:
    | EventEmitter<[ImmutableObjective, ImmutableObjective, ImmutableBucket]>
    | undefined,
  onBucketChanged: EventEmitter<[ImmutableBucket, ImmutableBucket]>,
  dialog: MatDialog
): void {
  const dialogData: EditObjectiveDialogData = {
    objective: makeEditedObjective(objective),
    original: objective,
    title: 'Edit Objective',
    saveAction: SaveAction.Edit,
    unit: unit,
    currentBucket: currentBucket,
    otherBuckets: otherBuckets,
    onMoveBucket: onMoveBucket,
  };
  const dialogRef: MatDialogRef<
    EditObjectiveDialogComponent,
    ImmutableBucket
  > = dialog.open(EditObjectiveDialogComponent, {
    data: dialogData,
  });
  dialogRef.afterClosed().subscribe((newBucket) => {
    if (newBucket) {
      onBucketChanged.emit([currentBucket, newBucket]);
    }
  });
}
