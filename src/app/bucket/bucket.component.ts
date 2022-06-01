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
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { AddLocation, Bucket, ImmutableBucket } from '../bucket';
import { CommitmentType, ImmutableObjective } from '../objective';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {
  EditObjectiveDialogComponent,
  EditObjectiveDialogData,
  SaveAction,
} from '../edit-objective-dialog/edit-objective-dialog.component';
import {
  EditBucketDialogComponent,
  EditBucketDialogData,
} from '../edit-bucket-dialog/edit-bucket-dialog.component';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ObjectiveComponent } from '../objective/objective.component';
import { DisplayObjectivesPipe } from './displayobjectives.pipe';
import { GroupblocksPipe } from './groupblocks.pipe';
import {
  BlockAction,
  EditBlockDialogComponent,
  EditBlockDialogData,
  EditBlockInstruction,
} from '../edit-block-dialog/edit-block-dialog.component';
import { BlockplaceholdersPipe } from './blockplaceholders.pipe';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-bucket',
  templateUrl: './bucket.component.html',
  styleUrls: ['./bucket.component.css'],
  // Requires all inputs to be immutable
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class BucketComponent {
  @Input() bucket?: ImmutableBucket;
  @Input() unit?: string;
  @Input() totalAllocationPercentage?: number;
  @Input() globalResourcesAvailable?: number;
  @Input() maxCommittedPercentage?: number;
  @Input() unallocatedTime?: ReadonlyMap<string, number>;
  @Input() showOrderButtons?: boolean;
  @Input() isEditingEnabled?: boolean;
  @Input() isBlockEditingEnabled?: boolean;
  @Input() otherBuckets?: readonly ImmutableBucket[];
  @Output() moveBucketUp = new EventEmitter<ImmutableBucket>();
  @Output() moveBucketDown = new EventEmitter<ImmutableBucket>();
  @Output() moveObjectiveBucket = new EventEmitter<
    [ImmutableObjective, ImmutableBucket, ImmutableObjective, ImmutableBucket]
  >();
  @Output() changed = new EventEmitter<[ImmutableBucket, ImmutableBucket]>();
  @Output() delete = new EventEmitter<ImmutableBucket>();

  constructor(public dialog: MatDialog) {}

  /**
   * Limit of resources expected to be allocated to the given bucket in this period,
   * based on total available and the percentage the user has set for this bucket.
   */
  bucketAllocationLimit(): number {
    return (
      (this.globalResourcesAvailable! * this.bucket!.allocationPercentage) / 100
    );
  }

  edit(): void {
    if (!this.isEditingEnabled) {
      return;
    }
    const dialogData: EditBucketDialogData = {
      bucket: this.bucket!.toOriginal(),
      original: this.bucket!,
      okAction: 'OK',
      allowCancel: false,
      title: 'Edit bucket "' + this.bucket!.displayName + '"',
      onDelete: this.delete,
    };
    const dialogRef = this.dialog.open(EditBucketDialogComponent, {
      data: dialogData,
    });
    dialogRef.afterClosed().subscribe((bucket?: Bucket) => {
      if (bucket) {
        this.changed.emit([this.bucket!, ImmutableBucket.fromBucket(bucket)]);
      }
    });
  }

  editBlock(blockIdx: number): void {
    if (!this.isEditingEnabled || !this.isBlockEditingEnabled) {
      return;
    }
    const displayObjectives = new DisplayObjectivesPipe().transform(
      this.bucket!.objectives
    );
    const blocks = new GroupblocksPipe().transform(displayObjectives);
    // If we're talking about the bottom block and it's not part of an existing block,
    // there's nothing useful that an edit can do
    if (
      blockIdx === blocks.length - 1 &&
      !blocks[blockIdx][0].objective.blockID
    ) {
      return;
    }
    const placeholders = new BlockplaceholdersPipe().transform(blocks);
    const topPlaceholder = placeholders[blockIdx].objective;
    const data: EditBlockDialogData = {
      blockPlaceholder: topPlaceholder,
      blocksBelow: placeholders
        .slice(blockIdx + 1, placeholders.length)
        .map((o) => o.objective),
    };
    const dialogRef: MatDialogRef<
      EditBlockDialogComponent,
      EditBlockInstruction
    > = this.dialog.open(EditBlockDialogComponent, { data: data });
    dialogRef.afterClosed().subscribe((instruction?: EditBlockInstruction) => {
      if (!instruction) {
        return;
      }
      if (instruction.action == BlockAction.Split) {
        this.splitBlock(
          blocks.map((a) => a.map((o) => o.objective)),
          blockIdx
        );
      } else if (
        instruction.action == BlockAction.Create &&
        instruction.downToIdx !== undefined
      ) {
        this.createBlock(
          blocks.map((a) => a.map((o) => o.objective)),
          blockIdx,
          instruction.downToIdx + blockIdx + 1
        );
      } else {
        console.error('Unsupported block instruction:', instruction);
      }
    });
  }

  splitBlock(oldBlocks: ImmutableObjective[][], splitIdx: number): void {
    let newObjectives: ImmutableObjective[] = [];
    for (let idx = 0; idx < oldBlocks.length; idx++) {
      for (let objective of oldBlocks[idx]) {
        if (idx == splitIdx) {
          newObjectives.push(objective.withBlockID());
        } else {
          newObjectives.push(objective);
        }
      }
    }
    this.changed.emit([
      this.bucket!,
      this.bucket!.withNewObjectives(newObjectives),
    ]);
  }

  createBlock(
    oldBlocks: ImmutableObjective[][],
    fromIdx: number,
    toIdx: number
  ): void {
    const blockID = uuidv4();
    let newObjectives: ImmutableObjective[] = [];
    for (let blockIdx = 0; blockIdx < oldBlocks.length; blockIdx++) {
      for (let objective of oldBlocks[blockIdx]) {
        if (blockIdx >= fromIdx && blockIdx <= toIdx) {
          newObjectives.push(objective.withBlockID(blockID));
        } else {
          newObjectives.push(objective);
        }
      }
    }
    this.changed.emit([
      this.bucket!,
      this.bucket!.withNewObjectives(newObjectives),
    ]);
  }

  addObjective(): void {
    if (!this.isEditingEnabled) {
      return;
    }
    const dialogData: EditObjectiveDialogData = {
      objective: {
        name: '',
        resourceEstimate: 0,
        commitmentType: CommitmentType.Aspirational,
        notes: '',
        groups: '',
        tags: '',
        assignments: [],
        displayOptions: { enableMarkdown: false },
      },
      original: undefined,
      title: 'Add Objective',
      saveAction: SaveAction.New,
      unit: this.unit!,
      otherBuckets: [],
      onMoveBucket: undefined,
      onDelete: undefined,
    };
    const dialogRef: MatDialogRef<
      EditObjectiveDialogComponent,
      [ImmutableObjective, AddLocation | null]
    > = this.dialog.open(EditObjectiveDialogComponent, {
      data: dialogData,
    });
    dialogRef.afterClosed().subscribe((closeData) => {
      if (!closeData) {
        return;
      }
      const [objective, addLocation] = closeData;
      if (!addLocation) {
        console.error('No addLocation supplied');
        return;
      }
      this.changed.emit([
        this.bucket!,
        this.bucket!.withNewObjective(objective, addLocation),
      ]);
    });
  }

  moveObjective(
    original: ImmutableObjective,
    newObjective: ImmutableObjective,
    newBucket: ImmutableBucket
  ): void {
    // Needs to be done in a single operation. Doing a delete in one bucket followed by an
    // add in the other bucket changes this component in between and doesn't work.
    this.moveObjectiveBucket.emit([
      original,
      this.bucket!,
      newObjective,
      newBucket,
    ]);
  }

  deleteObjective(objective: ImmutableObjective): void {
    this.changed.emit([
      this.bucket!,
      this.bucket!.withObjectiveDeleted(objective),
    ]);
  }

  reorderDrop(event: CdkDragDrop<ObjectiveComponent[]>): void {
    let displayObjectives = new DisplayObjectivesPipe().transform(
      this.bucket!.objectives
    );
    let objectiveBlocks = new GroupblocksPipe().transform(displayObjectives);
    moveItemInArray(objectiveBlocks, event.previousIndex, event.currentIndex);
    if (event.previousIndex !== event.currentIndex) {
      const newObjectives: ImmutableObjective[] = [];
      for (let objectiveBlock of objectiveBlocks) {
        for (let displayObjective of objectiveBlock) {
          newObjectives.push(displayObjective.objective);
        }
      }
      this.changed.emit([
        this.bucket!,
        this.bucket!.withNewObjectives(newObjectives),
      ]);
    }
  }

  onObjectiveChanged(
    original: ImmutableObjective,
    newObjective: ImmutableObjective
  ): void {
    this.changed.emit([
      this.bucket!,
      this.bucket!.withObjectiveChanged(original, newObjective),
    ]);
  }

  onMoveBucketUp(): void {
    this.moveBucketUp.emit(this.bucket);
  }

  onMoveBucketDown(): void {
    this.moveBucketDown.emit(this.bucket);
  }

  resourcesAllocated(): number {
    return this.bucket!.resourcesAllocated();
  }

  isOverAllocated(): boolean {
    return this.totalAllocationPercentage! > 100;
  }

  committedResourcesAllocated(): number {
    return this.bucket!.committedResourcesAllocated();
  }

  isOverCommitted(): boolean {
    return this.commitRatio() * 100 > this.maxCommittedPercentage!;
  }

  /**
   * Fraction of resources allocated within this bucket to committed objectives
   */
  commitRatio(): number {
    const total = this.resourcesAllocated();
    return total ? this.committedResourcesAllocated() / total : 0;
  }
}

export interface DisplayObjective {
  objective: ImmutableObjective;
  cumulativeSum: number;
}
