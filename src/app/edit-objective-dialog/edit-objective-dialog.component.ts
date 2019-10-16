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
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Objective } from '../objective';
import { Bucket } from '../bucket';

export interface EditObjectiveDialogData {
  objective: Objective;
  title: string;
  okAction: string;
  allowCancel: boolean;
  unit: string;
  otherBuckets: Bucket[];
  onMoveBucket: EventEmitter<[Objective, Bucket]>;
  onDelete: EventEmitter<Objective>;
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
    return this.data.objective.name && this.data.objective.resourceEstimate >= 0;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onMove(newBucket: Bucket): void {
    this.data.onMoveBucket.emit([this.data.objective, newBucket]);
    this.dialogRef.close();
  }

  onDelete(): void {
    this.showDeleteConfirm = true;
  }

  onConfirmDelete(): void {
    this.data.onDelete.emit(this.data.objective);
    this.dialogRef.close();
  }

  onCancelDelete(): void {
    this.showDeleteConfirm = false;
  }
}
