import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface RenameClassDialogData {
  classType: string;
  currentName: string;
}

@Component({
  selector: 'app-rename-class-dialog',
  templateUrl: './rename-class-dialog.component.html',
  styleUrls: ['./rename-class-dialog.component.css']
})
export class RenameClassDialog implements OnInit {
  newName: string;

  constructor(
    public dialogRef: MatDialogRef<RenameClassDialog>,
    @Inject(MAT_DIALOG_DATA) public data: RenameClassDialogData,
  ) { }

  ngOnInit(): void {
    this.newName = this.data.currentName;
  }

  save(): void {
    this.dialogRef.close(this.newName.trim());
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
