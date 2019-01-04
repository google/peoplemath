import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Period } from '../period';
import { Team } from '../team';
import { OkrStorageService } from '../okrstorage.service';
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
    private okrStorage: OkrStorageService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    this.loadData();
  }

  loadData(): void {
    const teamId = this.route.snapshot.paramMap.get('team');
    this.okrStorage.getTeam(teamId).subscribe(team => this.team = team);
    this.okrStorage.getPeriods(teamId).subscribe(periods => this.periods = periods);
  }

  isLoaded(): boolean {
    return this.team != undefined && this.periods != undefined;
  }

  addPeriod(): void {
    const dialogData: EditPeriodDialogData = {
      period: new Period('', '', 'person weeks', [], []),
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
      this.periods.push(period);
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
      this.okrStorage.updateTeam(team).pipe(
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
