import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Team } from '../team';

export interface EditTeamDialogData {
  team: Team;
  title: string;
  okAction: string;
  allowCancel: boolean;
  allowEditID: boolean;
}

@Component({
  selector: 'app-edit-team-dialog',
  templateUrl: './edit-team-dialog.component.html',
  styleUrls: ['./edit-team-dialog.component.css']
})
export class EditTeamDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<EditTeamDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditTeamDialogData) { }

  ngOnInit() {
  }

  onCancel() {
    this.dialogRef.close();
  }

  isDataValid(): boolean {
    return this.data.team.id != "" && this.data.team.displayName != "";
  }
}
