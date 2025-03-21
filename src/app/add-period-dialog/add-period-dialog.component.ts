// Copyright 2019-2021, 2023, 2025 Google LLC
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

import { Component, Inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';
import { Period, ImmutablePeriod } from '../period';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatRadioGroup, MatRadioButton } from '@angular/material/radio';
import { NgIf, NgFor } from '@angular/common';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatButton } from '@angular/material/button';

export enum CreateMethod {
  Blank = 'blank',
  Copy = 'copy',
}

export interface AddPeriodDialogData {
  period: Period;
  createMethod: CreateMethod;
  existingPeriods: readonly ImmutablePeriod[];
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
  styleUrls: ['./add-period-dialog.component.css'],
  imports: [
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatFormField,
    MatLabel,
    MatInput,
    FormsModule,
    MatRadioGroup,
    MatRadioButton,
    NgIf,
    MatSelect,
    NgFor,
    MatOption,
    MatCheckbox,
    MatDialogActions,
    MatButton,
    MatDialogClose,
  ],
})
export class AddPeriodDialogComponent {
  // I'd like to switch this to use reactive forms so you can use validations,
  // but then you lose the ability to disable controls via data-driven methods,
  // which seems like a net usability loss. :-(
  // https://github.com/angular/angular/issues/11271
  constructor(
    public dialogRef: MatDialogRef<AddPeriodDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddPeriodDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  isCopy(): boolean {
    return this.data.createMethod === CreateMethod.Copy;
  }

  isUnitRequired(): boolean {
    return this.data.createMethod === CreateMethod.Blank || !this.data.copyUnit;
  }

  isMaxCommittedPercentageRequired(): boolean {
    return this.isUnitRequired();
  }

  isDataValid(): boolean {
    if (!this.data.period.id || !this.data.period.displayName) {
      return false;
    }
    if (
      this.isUnitRequired() &&
      (!this.data.period.unit || !this.data.period.unitAbbrev)
    ) {
      return false;
    }
    if (this.isMaxCommittedPercentageRequired()) {
      if (
        this.data.period.maxCommittedPercentage < 0 ||
        this.data.period.maxCommittedPercentage > 100
      ) {
        return false;
      }
    }

    if (this.data.createMethod === CreateMethod.Copy) {
      if (!this.data.copyFromPeriodID) {
        return false;
      }
      if (
        !this.data.existingPeriods.find(
          (p) => p.id === this.data.copyFromPeriodID
        )
      ) {
        return false;
      }
    } else if (this.data.createMethod !== CreateMethod.Blank) {
      return false;
    }
    return true;
  }
}
