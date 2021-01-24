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

import { Component, OnInit, Inject, EventEmitter } from '@angular/core';
import { Bucket, ImmutableBucket } from '../bucket';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface EditBucketDialogData {
  bucket: Bucket;
  original?: ImmutableBucket;
  okAction: string;
  allowCancel: boolean;
  title: string;
  onDelete?: EventEmitter<ImmutableBucket>;
}

@Component({
  selector: 'app-edit-bucket-dialog',
  templateUrl: './edit-bucket-dialog.component.html',
  styleUrls: ['./edit-bucket-dialog.component.css']
})
export class EditBucketDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<EditBucketDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditBucketDialogData) { }

  showDeleteConfirm = false;

  ngOnInit(): void {
  }

  isDataValid(): boolean {
    return this.data.bucket.allocationPercentage >= 0 && this.data.bucket.allocationPercentage <= 100;
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
}
