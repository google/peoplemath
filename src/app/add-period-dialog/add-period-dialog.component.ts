import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
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
