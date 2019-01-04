import { Component, OnInit } from '@angular/core';
import { Team } from '../team';
import { OkrStorageService } from '../okrstorage.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { EditTeamDialogComponent, EditTeamDialogData } from '../edit-team-dialog/edit-team-dialog.component';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.css']
})
export class TeamsComponent implements OnInit {
  teams: Team[];

  constructor(
    private okrStorage: OkrStorageService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    this.loadData();
  }

  loadData(): void {
    this.okrStorage.getTeams().subscribe(teams => this.teams = teams);
  }

  isLoaded(): boolean {
    return this.teams != undefined;
  }

  addTeam(): void {
    const dialogData: EditTeamDialogData = {
      team: new Team('', ''),
      title: 'Add Team',
      okAction: 'Add',
      allowCancel: true,
      allowEditID: true,
    };
    const dialogRef = this.dialog.open(EditTeamDialogComponent, {data: dialogData});
    dialogRef.afterClosed().subscribe(team => {
      if (!team) {
        return;
      }
      this.okrStorage.addTeam(team).pipe(
        catchError(error => {
          this.snackBar.open("Could not save new team: " + error.error, 'Dismiss');
          console.log(error);
          return of(undefined);
        }),
      ).subscribe(res => this.loadData());
    });
  }
}
