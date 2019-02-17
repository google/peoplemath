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
import { Period } from '../period';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

export interface EditPeriodDialogData {
  period: Period;
  okAction: string;
  allowCancel: boolean;
  allowEditID: boolean;
  title: string;
}

@Component({
  selector: 'app-edit-period-dialog',
  templateUrl: './edit-period-dialog.component.html',
  styleUrls: ['./edit-period-dialog.component.css']
})
export class EditPeriodDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<EditPeriodDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditPeriodDialogData,
  ) { }

  ngOnInit() {
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  isDataValid(): boolean {
    return this.data.period.id != "" && this.data.period.displayName != "" && this.data.period.unit != "";
  }
}
