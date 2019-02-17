// Copyright 2019 Google LLC
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
import { AddPeriodDialogData, AddPeriodDialogComponent, CreateMethod } from '../add-period-dialog/add-period-dialog.component';
import { Bucket } from '../bucket';
import { Person } from '../person';
import { Objective } from '../objective';
import { Assignment } from '../assignment';


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
    if (this.periods.length == 0) {
      this.addBlankPeriod();
      return;
    }
    const existingPeriods = this.sortedPeriods();
    const dialogData: AddPeriodDialogData = {
      period: new Period('', '', 'person weeks', [], [], ''),
      createMethod: CreateMethod.Blank,
      existingPeriods: existingPeriods,
      copyFromPeriodID: existingPeriods[0].id,
      copyUnit: true,
      copyPeople: true,
      copyBuckets: true,
      copyObjectives: false,
      copyAssignments: false,
    };
    const dialogRef = this.dialog.open(AddPeriodDialogComponent, {data: dialogData});
    dialogRef.afterClosed().subscribe(data => {
      if (!data) {
        return;
      }
      var newPeriod: Period;
      if (data.createMethod == CreateMethod.Blank) {
        newPeriod = data.period;
      } else if (data.createMethod == CreateMethod.Copy) {
        let copiedPeriod = this.periods.find(p => p.id == data.copyFromPeriodID);
        if (!copiedPeriod) {
          console.error('Cannot find period with ID "' + data.copyFromPeriodID + '"');
          return;
        }
        newPeriod = new Period(data.period.id, data.period.displayName,
          data.copyUnit ? copiedPeriod.unit : data.period.unit,
          data.copyBuckets ? this.copyBuckets(copiedPeriod.buckets, data.copyObjectives, data.copyAssignments) : [],
          data.copyPeople ? copiedPeriod.people : [],
          '');
      } else {
        console.error('Unexpected createMethod "' + data.createMethod + '"');
        return;
      }
      this.storeNewPeriod(newPeriod);
    });
  }

  copyPeople(orig: Person[]): Person[] {
    let result = [];
    for (let p of orig) {
      result.push(new Person(p.id, p.displayName, p.availability));
    }
    return result;
  }

  copyBuckets(orig: Bucket[], copyObjectives: boolean, copyAssignments: boolean): Bucket[] {
    let result = [];
    for (let b of orig) {
      let objectives = [];
      if (copyObjectives) {
        for (let o of b.objectives) {
          let assignments = [];
          if (copyAssignments) {
            for (let a of o.assignments) {
              assignments.push(new Assignment(a.personId, a.commitment));
            }
          }
          objectives.push(new Objective(o.name, o.resourceEstimate, assignments));
        }
      }
      result.push(new Bucket(b.displayName, b.allocationPercentage, objectives));
    }
    return result;
  }

  addBlankPeriod(): void {
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
      this.storeNewPeriod(period);
    });
  }

  storeNewPeriod(period: Period): void {
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
