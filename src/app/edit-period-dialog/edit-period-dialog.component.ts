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
