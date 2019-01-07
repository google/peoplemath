import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Period } from '../period';
import { Team } from '../team';
import { StorageService } from '../storage.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { EditPeriodDialogComponent, EditPeriodDialogData } from '../edit-period-dialog/edit-period-dialog.component';
import { EditTeamDialogComponent, EditTeamDialogData } from '../edit-team-dialog/edit-team-dialog.component';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';


@Component({
  selector: 'app-teamperiods',
  templateUrl: './teamperiods.component.html',
  styleUrls: ['./teamperiods.component.css']
})
export class TeamPeriodsComponent implements OnInit {
  team: Team;
  periods: Period[];

  constructor(
    private storage: StorageService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    this.loadData();
  }

  loadData(): void {
    const teamId = this.route.snapshot.paramMap.get('team');
    this.storage.getTeam(teamId).pipe(
      catchError(error => {
        this.snackBar.open('Could not load team "' + teamId + '": ' + error.error, 'Dismiss');
        console.log(error);
        return of(new Team('', ''));
      })
    ).subscribe(team => this.team = team);

    this.storage.getPeriods(teamId).pipe(
      catchError(error => {
        this.snackBar.open('Could not load periods for team "' + teamId + '": ' + error.error, 'Dismiss');
        console.log(error);
        return of([])
      })
    ).subscribe(periods => this.periods = periods);
  }

  isLoaded(): boolean {
    return this.team != undefined && this.periods != undefined;
  }

  sortedPeriods(): Period[] {
    let result = this.periods.slice();
    result.sort((a, b) => a.displayName < b.displayName ? 1 : (a.displayName > b.displayName ? -1 : 0));
    return result;
  }

  addPeriod(): void {
    const dialogData: EditPeriodDialogData = {
      period: new Period('', '', 'person weeks', [], [], ''),
      title: 'New Period',
      okAction: 'Add',
      allowCancel: true,
      allowEditID: true,
    };
    const dialogRef = this.dialog.open(EditPeriodDialogComponent, {data: dialogData});
    dialogRef.afterClosed().subscribe(period => {
      if (!period) {
        return;
      }
      this.storage.addPeriod(this.team.id, period).pipe(
        catchError(error => {
          this.snackBar.open('Could not save new period: ' + error.error, 'Dismiss');
          console.log(error);
          return of(undefined);
        })
      ).subscribe(updateResponse => {
        if (updateResponse) {
          period.lastUpdateUUID = updateResponse.lastUpdateUUID;
          this.periods.push(period);
        }
      })
    });
  }

  editTeam(): void {
    const dialogData: EditTeamDialogData = {
      team: this.team,
      title: 'Edit Team "' + this.team.id + '"',
      okAction: 'OK',
      allowCancel: false,
      allowEditID: false,
    };
    const dialogRef = this.dialog.open(EditTeamDialogComponent, {data: dialogData});
    dialogRef.afterClosed().subscribe(team => {
      this.storage.updateTeam(team).pipe(
        catchError(error => {
          this.snackBar.open('Could not save team: ' + error.error, 'Dismiss');
          console.log(error);
          return of("error");
        })
      ).subscribe(res => {
        if (res != "error") {
          this.snackBar.open('Saved', '', {duration: 2000});
        }
      });
    });
  }
}
