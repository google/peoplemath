import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Period } from '../period';
import { Team } from '../team';
import { OkrStorageService } from '../okrstorage.service';
import { MatDialog } from '@angular/material';
import { EditPeriodDialogComponent } from '../edit-period-dialog/edit-period-dialog.component';
import { EditTeamDialogComponent } from '../edit-team-dialog/edit-team-dialog.component';


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
  ) { }

  ngOnInit() {
    this.loadData();
  }

  loadData(): void {
    const teamId = this.route.snapshot.paramMap.get('team');
    this.okrStorage.getTeam(teamId).subscribe(team => this.team = team);
    this.okrStorage.getPeriods(teamId).subscribe(periods => this.periods = periods);
  }

  addPeriod(): void {
    const dialogRef = this.dialog.open(EditPeriodDialogComponent, {
      data: {
        period: new Period('', '', 'person weeks', [], []),
        title: 'New Period',
        okAction: 'Add',
        allowCancel: true,
        allowEditID: true,
      },
    });
    dialogRef.afterClosed().subscribe(period => {
      if (!period) {
        return;
      }
      this.periods.push(period);
    });
  }

  editTeam(): void {
    this.dialog.open(EditTeamDialogComponent, {
      data: {
        team: this.team,
        title: 'Edit Team "' + this.team.id + '"',
        okAction: 'OK',
        allowCancel: false,
        allowEditID: false,
      },
    });
  }
}
