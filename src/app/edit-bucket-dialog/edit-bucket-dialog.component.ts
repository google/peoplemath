// Copyright 2019, 2021, 2023 Google LLC
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

import { Component, Inject, EventEmitter } from '@angular/core';
import { AllocationType, Bucket, ImmutableBucket } from '../bucket';
import {
  MatLegacyDialogRef as MatDialogRef,
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
} from '@angular/material/legacy-dialog';

export interface EditBucketDialogData {
  bucket: Bucket;
  original?: ImmutableBucket;
  okAction: string;
  title: string;
  unit: string;
  balancePct: number;
  onDelete?: EventEmitter<ImmutableBucket>;
}

@Component({
  selector: 'app-edit-bucket-dialog',
  templateUrl: './edit-bucket-dialog.component.html',
  styleUrls: ['./edit-bucket-dialog.component.css'],
})
export class EditBucketDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<EditBucketDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditBucketDialogData
  ) {}

  showDeleteConfirm = false;

  isDataValid(): boolean {
    return (
      this.data.bucket.allocationPercentage >= 0 &&
      this.data.bucket.allocationPercentage <= 100
    );
  }

  onCancel(): void {
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

  isAllocationUnbalanced(): boolean {
    const allocType = this.data.bucket.allocationType;
    if (allocType && allocType !== AllocationType.Percentage) {
      return false;
    }

    return (
      Math.abs(this.data.bucket.allocationPercentage - this.data.balancePct) >
      1e-6
    );
  }

  balanceAllocation(): void {
    const allocType = this.data.bucket.allocationType;
    if (allocType && allocType !== AllocationType.Percentage) {
      return;
    }
    this.data.bucket.allocationPercentage = this.data.balancePct;
  }

  fixToSumOfEstimates(): void {
    this.data.bucket.allocationType = AllocationType.Absolute;
    this.data.bucket.allocationAbsolute = this.data.bucket.objectives
      .map((o) => o.resourceEstimate)
      .reduce((sum, current) => sum + current, 0);
  }

  fixToSumOfAssignments(): void {
    this.data.bucket.allocationType = AllocationType.Absolute;
    this.data.bucket.allocationAbsolute = this.data.bucket.objectives
      .map((o) =>
        o.assignments
          .map((a) => a.commitment)
          .reduce((sum, current) => sum + current, 0)
      )
      .reduce((sum, current) => sum + current, 0);
  }
}
