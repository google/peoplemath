import { Component, OnInit, Inject } from '@angular/core';
import { Bucket } from '../bucket';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

export interface EditBucketDialogData {
  bucket: Bucket;
  okAction: string;
  allowCancel: boolean;
  title: string;
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

  ngOnInit() {
  }

  isDataValid(): boolean {
    return this.data.bucket.allocationPercentage > 0 && this.data.bucket.allocationPercentage <= 100;
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
