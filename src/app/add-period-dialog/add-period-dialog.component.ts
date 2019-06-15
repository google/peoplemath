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
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Period } from '../period';

export enum CreateMethod {
  Blank = 'blank',
  Copy = 'copy',
}

export interface AddPeriodDialogData {
  period: Period;
  createMethod: CreateMethod;
  existingPeriods: Period[];
  copyFromPeriodID: string;
  copyUnit: boolean;
  copyPeople: boolean;
  copyBuckets: boolean;
  copyObjectives: boolean;
  copyAssignments: boolean;
}

@Component({
  selector: 'app-add-period-dialog',
  templateUrl: './add-period-dialog.component.html',
  styleUrls: ['./add-period-dialog.component.css']
})
export class AddPeriodDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<AddPeriodDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddPeriodDialogData
  ) { }

  ngOnInit() {
  }

  onCancel() {
    this.dialogRef.close();
  }

  isCopy(): boolean {
    return this.data.createMethod == CreateMethod.Copy;
  }

  isUnitRequired(): boolean {
    return this.data.createMethod == CreateMethod.Blank || !this.data.copyUnit;
  }

  isDataValid(): boolean {
    if (!this.data.period.id || !this.data.period.displayName) {
      return false;
    }
    if (this.isUnitRequired() && !this.data.period.unit) {
      return false;
    }

    if (this.data.createMethod == CreateMethod.Copy) {
      if (!this.data.copyFromPeriodID) {
        return false;
      }
      if (!this.data.existingPeriods.find(p => p.id == this.data.copyFromPeriodID)) {
        return false;
      }
    } else if (this.data.createMethod != CreateMethod.Blank) {
      return false;
    }
    return true;
  }
}
