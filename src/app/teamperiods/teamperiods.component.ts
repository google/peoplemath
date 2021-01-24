// Copyright 2019-2020 Google LLC
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
import { Period, ImmutablePeriod } from '../period';
import {Team, ImmutableTeam, TeamPermissions, Permission} from '../team';
import { StorageService } from '../storage.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EditPeriodDialogComponent, EditPeriodDialogData } from '../edit-period-dialog/edit-period-dialog.component';
import { EditTeamDialogComponent, EditTeamDialogData } from '../edit-team-dialog/edit-team-dialog.component';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { AddPeriodDialogData, AddPeriodDialogComponent, CreateMethod } from '../add-period-dialog/add-period-dialog.component';
import { Bucket, ImmutableBucket } from '../bucket';
import { Person } from '../person';
import { Assignment } from '../assignment';
import { Objective } from '../objective';
import {AuthService} from '../services/auth.service';
import {NotificationService} from '../services/notification.service';
import { environment } from 'src/environments/environment';

const DEFAULT_MAX_COMMITTED_PERCENTAGE = 50;

@Component({
  selector: 'app-teamperiods',
  templateUrl: './teamperiods.component.html',
  styleUrls: ['./teamperiods.component.css']
})
export class TeamPeriodsComponent implements OnInit {
  team?: ImmutableTeam;
  periods?: readonly ImmutablePeriod[];
  userHasEditPermissions = true;

  constructor(
    private storage: StorageService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    public authService: AuthService,
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(m => {
      const teamId = m.get('team');
      if (teamId) {
        this.loadDataFor(teamId);
      }
    });
  }

  loadDataFor(teamId: string): void {
    this.team = undefined;
    this.periods = undefined;
    this.storage.getTeam(teamId).pipe(
      catchError(error => {
        this.snackBar.open('Could not load team "' + teamId + '": ' + error.error, 'Dismiss');
        console.log(error);
        return of(new Team('', ''));
      })
    ).subscribe((team?: Team) => {
      if (team) {
        this.team = new ImmutableTeam(team);
        // TODO(#83) Replace this logic with something determined by the server, like CanAddTeam
        if (environment.requireAuth && team.teamPermissions !== undefined) {
          const user = this.authService.user$.getValue();
          const userEmail = user?.email;
          const userDomain = user?.domain;
          const principalTypeEmail = 'email';
          const principalTypeDomain = 'domain';
          this.userHasEditPermissions = false;
          team.teamPermissions.write.allow.forEach(permission => {
            if ((permission.type === principalTypeDomain && permission.id.toLowerCase() === userDomain?.toLowerCase()) ||
              (permission.type === principalTypeEmail && permission.id.toLowerCase() === userEmail?.toLowerCase())) {
              this.userHasEditPermissions = true;
            }
          });
        }
      } else {
        this.team = undefined;
      }
    });

    this.storage.getPeriods(teamId).pipe(
      catchError(error => {
        this.snackBar.open('Could not load periods for team "' + teamId + '": ' + error.error, 'Dismiss');
        console.log(error);
        return of([]);
      })
    ).subscribe((periods?: Period[]) => {
      if (periods) {
        this.periods = periods.map(p => ImmutablePeriod.fromPeriod(p));
      } else {
        this.periods = undefined;
      }
    });
  }

  isLoaded(): boolean {
    return this.team != undefined && this.periods != undefined;
  }

  sortedPeriods(): ImmutablePeriod[] {
    const result = this.periods!.slice();
    result.sort((a, b) => a.displayName < b.displayName ? 1 : (a.displayName > b.displayName ? -1 : 0));
    return result;
  }

  addPeriod(): void {
    if (this.periods!.length == 0) {
      this.addBlankPeriod();
      return;
    }
    const existingPeriods = this.sortedPeriods();
    const dialogData: AddPeriodDialogData = {
      period: {
        id: '',
        displayName: '',
        unit: 'person weeks',
        secondaryUnits: [],
        notesURL: '',
        maxCommittedPercentage: DEFAULT_MAX_COMMITTED_PERCENTAGE,
        people: [],
        buckets: [],
        lastUpdateUUID: '',
      },
      createMethod: CreateMethod.Blank,
      existingPeriods,
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
      let newPeriod: Period;
      if (data.createMethod == CreateMethod.Blank) {
        newPeriod = data.period;
      } else if (data.createMethod == CreateMethod.Copy) {
        const copiedPeriod = this.periods!.find(p => p.id == data.copyFromPeriodID);
        if (!copiedPeriod) {
          console.error('Cannot find period with ID "' + data.copyFromPeriodID + '"');
          return;
        }
        newPeriod = {
          id: data.period.id,
          displayName: data.period.displayName,
          unit: data.copyUnit ? copiedPeriod.unit : data.period.unit,
          secondaryUnits: data.copyUnit ? copiedPeriod.secondaryUnits : data.period.secondaryUnits,
          notesURL: data.period.notesURL,
          maxCommittedPercentage: data.copyUnit ? copiedPeriod.maxCommittedPercentage : data.period.maxCommittedPercentage,
          buckets: data.copyBuckets ? this.copyBuckets(copiedPeriod.buckets, data.copyObjectives, data.copyAssignments) : [],
          people: data.copyPeople ? copiedPeriod.people.map(p => p.toOriginal()) : [],
          lastUpdateUUID: '',
        };
      } else {
        console.error('Unexpected createMethod "' + data.createMethod + '"');
        return;
      }
      this.storeNewPeriod(newPeriod);
    });
  }

  copyPeople(orig: Person[]): Person[] {
    const result = [];
    for (const p of orig) {
      result.push(new Person(p.id, p.displayName, p.location, p.availability));
    }
    return result;
  }

  copyBuckets(orig: readonly ImmutableBucket[], copyObjectives: boolean, copyAssignments: boolean): Bucket[] {
    const result = [];
    for (const b of orig) {
      const objectives: Objective[] = [];
      if (copyObjectives) {
        for (const o of b.objectives) {
          const assignments = [];
          if (copyAssignments) {
            for (const a of o.assignments) {
              assignments.push(new Assignment(a.personId, a.commitment));
            }
          }
          objectives.push({
            name: o.name,
            resourceEstimate: o.resourceEstimate,
            commitmentType: o.commitmentType,
            notes: o.notes,
            groups: o.groups.map(g => g.toOriginal()),
            tags: o.tags.map(t => t.toOriginal()),
            assignments,
          });
        }
      }
      result.push(new Bucket(b.displayName, b.allocationPercentage, objectives));
    }
    return result;
  }

  addBlankPeriod(): void {
    const dialogData: EditPeriodDialogData = {
      period: {
        id: '',
        displayName: '',
        unit: 'person weeks',
        notesURL: '',
        maxCommittedPercentage: DEFAULT_MAX_COMMITTED_PERCENTAGE,
        people: [],
        buckets: [],
        secondaryUnits: [],
        lastUpdateUUID: '',
      },
      title: 'New Period',
      okAction: 'Add',
      allowEditID: true,
    };
    const dialogRef = this.dialog.open(EditPeriodDialogComponent, {data: dialogData});
    dialogRef.afterClosed().subscribe(ok => {
      if (ok) {
        this.storeNewPeriod(dialogData.period);
      }
    });
  }

  storeNewPeriod(period: Period): void {
    this.storage.addPeriod(this.team!.id, period).pipe(
      catchError(error => {
        this.snackBar.open('Could not save new period: ' + error.error, 'Dismiss');
        console.log(error);
        return of(undefined);
      })
    ).subscribe(updateResponse => {
      if (updateResponse) {
        period.lastUpdateUUID = updateResponse.lastUpdateUUID;
        this.periods = this.periods!.concat([ImmutablePeriod.fromPeriod(period)]);
      }
    });
  }

  editTeam(): void {
    const dialogData: EditTeamDialogData = {
      team: this.team!.toOriginal(),
      title: 'Edit Team "' + this.team!.id + '"',
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
          return of('error');
        })
      ).subscribe(res => {
        if (res != 'error') {
          this.snackBar.open('Saved', '', {duration: 2000});
          this.team = new ImmutableTeam(team);
        }
      });
    });
  }
}
