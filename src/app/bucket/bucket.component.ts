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

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Bucket, ImmutableBucket, bucketResourcesAllocated, bucketCommittedResourcesAllocated } from '../bucket';
import { CommitmentType, ImmutableObjective } from '../objective';
import { MatDialog } from '@angular/material/dialog';
import { EditObjectiveDialogComponent, EditObjectiveDialogData } from '../edit-objective-dialog/edit-objective-dialog.component';
import { EditBucketDialogComponent, EditBucketDialogData } from '../edit-bucket-dialog/edit-bucket-dialog.component';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ObjectiveComponent } from '../objective/objective.component';

@Component({
  selector: 'app-bucket',
  templateUrl: './bucket.component.html',
  styleUrls: ['./bucket.component.css']
})
export class BucketComponent implements OnInit {
  @Input() bucket?: ImmutableBucket;
  @Input() unit?: string;
  @Input() totalAllocationPercentage?: number;
  @Input() globalResourcesAvailable?: number;
  @Input() maxCommittedPercentage?: number;
  @Input() unallocatedTime?: ReadonlyMap<string, number>;
  @Input() showOrderButtons?: boolean;
  @Input() isEditingEnabled?: boolean;
  @Input() otherBuckets?: readonly ImmutableBucket[];
  @Output() onMoveBucketUp = new EventEmitter<ImmutableBucket>();
  @Output() onMoveBucketDown = new EventEmitter<ImmutableBucket>();
  @Output() onChanged = new EventEmitter<[ImmutableBucket, ImmutableBucket]>();

  constructor(public dialog: MatDialog) { }

  ngOnInit() {
  }

  /**
   * Limit of resources expected to be allocated to the given bucket in this period,
   * based on total available and the percentage the user has set for this bucket.
   */
  bucketAllocationLimit(): number {
    return this.globalResourcesAvailable! * this.bucket!.allocationPercentage / 100;
  }

  edit(): void {
    if (!this.isEditingEnabled) {
      return;
    }
    const dialogData: EditBucketDialogData = {
      'bucket': this.bucket!.toOriginal(), 'okAction': 'OK', 'allowCancel': false,
      'title': 'Edit bucket "' + this.bucket!.displayName + '"',
    };
    const dialogRef = this.dialog.open(EditBucketDialogComponent, {data: dialogData});
    dialogRef.afterClosed().subscribe((bucket?: Bucket) => {
      if (bucket) {
        this.onChanged.emit([this.bucket!, ImmutableBucket.fromBucket(bucket)]);
      }
    });
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
      },
      original: undefined,
      title: 'Add Objective',
      okAction: 'Add',
      unit: this.unit!,
      otherBuckets: [],
      onMoveBucket: undefined,
      onDelete: undefined,
    };
    const dialogRef = this.dialog.open(EditObjectiveDialogComponent, {data: dialogData});
    dialogRef.afterClosed().subscribe(objective => {
      if (!objective) {
        return;
      }
      this.onChanged.emit([this.bucket!, this.bucket!.withNewObjective(objective)]);
    });
  }

  moveObjective(original: ImmutableObjective, newObjective: ImmutableObjective, newBucket: ImmutableBucket) {
    this.deleteObjective(original);
    this.onChanged.emit([newBucket, newBucket.withNewObjective(newObjective)]);
  }

  deleteObjective(objective: ImmutableObjective): void {
    this.onChanged.emit([this.bucket!, this.bucket!.withObjectiveDeleted(objective)]);
  }

  reorderDrop(event: CdkDragDrop<ObjectiveComponent[]>) {
    const newObjectives = [...this.bucket!.objectives];
    moveItemInArray(newObjectives, event.previousIndex, event.currentIndex);
    if (event.previousIndex != event.currentIndex) {
      this.onChanged.emit([this.bucket!, this.bucket!.withNewObjectives(newObjectives)]);
    }
  }

  onObjectiveChanged(original: ImmutableObjective, newObjective: ImmutableObjective): void {
    this.onChanged.emit([this.bucket!, this.bucket!.withObjectiveChanged(original, newObjective)]);
  }

  moveBucketUp(): void {
    this.onMoveBucketUp.emit(this.bucket);
  }

  moveBucketDown(): void {
    this.onMoveBucketDown.emit(this.bucket);
  }

  resourcesAllocated(): number {
    return bucketResourcesAllocated(this.bucket!);
  }

  isOverAllocated(): boolean {
    return this.totalAllocationPercentage! > 100;
  }

  committedResourcesAllocated(): number {
    return bucketCommittedResourcesAllocated(this.bucket!);
  }

  isOverCommitted(): boolean {
    return this.commitRatio() * 100 > this.maxCommittedPercentage!;
  }

  /**
   * Fraction of resources allocated within this bucket to committed objectives
   */
  commitRatio(): number {
    let total = this.resourcesAllocated();
    return total ? this.committedResourcesAllocated() / total : 0;
  }
}
