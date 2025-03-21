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
import { Period, SecondaryUnit } from '../period';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
} from '@angular/material/dialog';
import {
  UntypedFormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { NgIf } from '@angular/common';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';

export interface EditPeriodDialogData {
  period: Period;
  okAction: string;
  allowEditID: boolean;
  title: string;
}

@Component({
  selector: 'app-edit-period-dialog',
  templateUrl: './edit-period-dialog.component.html',
  styleUrls: ['./edit-period-dialog.component.css'],
  imports: [
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    NgIf,
    MatFormField,
    MatLabel,
    MatInput,
    FormsModule,
    ReactiveFormsModule,
    MatError,
    MatDialogActions,
    MatButton,
  ],
})
export class EditPeriodDialogComponent {
  periodIdControl: UntypedFormControl;
  displayNameControl: UntypedFormControl;
  unitControl: UntypedFormControl;
  unitAbbrevControl: UntypedFormControl;
  secondaryUnitsControl: UntypedFormControl;
  notesUrlControl: UntypedFormControl;
  maxCommitPctControl: UntypedFormControl;

  constructor(
    public dialogRef: MatDialogRef<EditPeriodDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditPeriodDialogData
  ) {
    this.periodIdControl = new UntypedFormControl(
      data.period.id,
      Validators.required
    );
    this.displayNameControl = new UntypedFormControl(
      data.period.displayName,
      Validators.required
    );
    this.unitControl = new UntypedFormControl(
      data.period.unit,
      Validators.required
    );
    this.unitAbbrevControl = new UntypedFormControl(data.period.unitAbbrev);
    this.secondaryUnitsControl = new UntypedFormControl(
      data.period.secondaryUnits
        .map((su) => su.name + ':' + su.conversionFactor)
        .join(',')
    );
    this.notesUrlControl = new UntypedFormControl(data.period.notesURL);
    this.maxCommitPctControl = new UntypedFormControl(
      data.period.maxCommittedPercentage,
      [Validators.min(0), Validators.max(100)]
    );
  }

  parseSecondaryUnits(): SecondaryUnit[] {
    return this.secondaryUnitsControl.value
      .split(',')
      .filter((kv: string) => !!kv.trim())
      .map((kv: string) => {
        let result: SecondaryUnit;
        const parts = kv.split(':').map((s) => s.trim());
        if (parts.length > 1) {
          result = { name: parts[0], conversionFactor: parseFloat(parts[1]) };
        } else {
          result = { name: parts[0], conversionFactor: 1.0 };
        }
        return result;
      });
  }

  onOK(): void {
    if (this.data.allowEditID) {
      this.data.period.id = this.periodIdControl.value;
    }
    this.data.period.displayName = this.displayNameControl.value;
    this.data.period.unit = this.unitControl.value;
    this.data.period.unitAbbrev = this.unitAbbrevControl.value;
    const secondaryUnits: SecondaryUnit[] = this.parseSecondaryUnits();
    this.data.period.secondaryUnits = secondaryUnits;
    this.data.period.notesURL = this.notesUrlControl.value;
    this.data.period.maxCommittedPercentage = this.maxCommitPctControl.value;
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  isDataValid(): boolean {
    return (
      this.periodIdControl.valid &&
      this.displayNameControl.valid &&
      this.unitControl.valid &&
      this.secondaryUnitsControl.valid &&
      this.notesUrlControl.valid &&
      this.maxCommitPctControl.valid
    );
  }
}
