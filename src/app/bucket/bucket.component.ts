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

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Bucket, bucketResourcesAllocated } from '../bucket';
import { Objective, CommitmentType } from '../objective';
import { MatDialog } from '@angular/material/dialog';
import { EditObjectiveDialogComponent, EditObjectiveDialogData } from '../edit-objective-dialog/edit-objective-dialog.component';
import { EditBucketDialogComponent, EditBucketDialogData } from '../edit-bucket-dialog/edit-bucket-dialog.component';

@Component({
  selector: 'app-bucket',
  templateUrl: './bucket.component.html',
  styleUrls: ['./bucket.component.css']
})
export class BucketComponent implements OnInit {
  @Input() bucket: Bucket;
  @Input() unit: string;
  @Input() totalAllocationPercentage: number;
  @Input() globalResourcesAvailable: number;
  @Input() unallocatedTime: Map<string, number>;
  @Input() showOrderButtons: boolean;
  @Input() isEditingEnabled: boolean;
  @Output() onMoveBucketUp = new EventEmitter<Bucket>();
  @Output() onMoveBucketDown = new EventEmitter<Bucket>();
  @Output() onChanged = new EventEmitter<any>();

  constructor(public dialog: MatDialog) { }

  ngOnInit() {
  }

  /**
   * Resources allocated to the given bucket in this period, based on total available
   * and bucket allocation percentage.
   */
  bucketAllocation(): number {
    return this.globalResourcesAvailable * this.bucket.allocationPercentage / 100;
  }

  edit(): void {
    if (!this.isEditingEnabled) {
      return;
    }
    const dialogData: EditBucketDialogData = {
      'bucket': this.bucket, 'okAction': 'OK', 'allowCancel': false,
      'title': 'Edit bucket "' + this.bucket.displayName + '"',
    };
    const dialogRef = this.dialog.open(EditBucketDialogComponent, {data: dialogData});
    dialogRef.afterClosed().subscribe(_ => this.onChanged.emit(this.bucket));
  }

  addObjective(): void {
    if (!this.isEditingEnabled) {
      return;
    }
    const dialogData: EditObjectiveDialogData = {
      'objective': new Objective('', 0, CommitmentType.Aspirational, []),
      'title': 'Add Objective',
      'okAction': 'Add',
      'allowCancel': true,
      'unit': this.unit,
      'onDelete': undefined,
    };
    const dialogRef = this.dialog.open(EditObjectiveDialogComponent, {data: dialogData});
    dialogRef.afterClosed().subscribe(objective => {
      if (!objective) {
        return;
      }
      this.bucket.objectives.push(objective);
      this.onChanged.emit(this.bucket);
    });
  }

  private objectiveIndex(objective: Objective): number {
    return this.bucket.objectives.findIndex(o => o === objective);
  }

  deleteObjective(objective: Objective): void {
    const index = this.objectiveIndex(objective);
    this.bucket.objectives.splice(index, 1);
    this.onChanged.emit(this.bucket);
  }

  moveObjectiveUpOne(objective: Objective): void {
    const index = this.objectiveIndex(objective);
    if (index == 0) {
      return;
    }
    this.bucket.objectives[index] = this.bucket.objectives[index - 1];
    this.bucket.objectives[index - 1] = objective;
    this.onChanged.emit(this.bucket);
  }

  moveObjectiveDownOne(objective: Objective): void {
    const index = this.objectiveIndex(objective);
    if (index >= this.bucket.objectives.length - 1) {
      return;
    }
    this.bucket.objectives[index] = this.bucket.objectives[index + 1];
    this.bucket.objectives[index + 1] = objective;
    this.onChanged.emit(this.bucket);
  }

  onObjectiveChanged(objective: Objective): void {
    this.onChanged.emit(objective);
  }

  moveBucketUp(): void {
    this.onMoveBucketUp.emit(this.bucket);
  }

  moveBucketDown(): void {
    this.onMoveBucketDown.emit(this.bucket);
  }

  resourcesAllocated(): number {
    return bucketResourcesAllocated(this.bucket);
  }
}
