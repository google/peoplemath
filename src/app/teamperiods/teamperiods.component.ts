// Copyright 2019-2023, 2025 Google LLC
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

import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Period, ImmutablePeriod } from '../period';
import { Team, ImmutableTeam } from '../team';
import { StorageService } from '../storage.service';
import { MatDialog } from '@angular/material/dialog';
import {
  EditPeriodDialogComponent,
  EditPeriodDialogData,
} from '../edit-period-dialog/edit-period-dialog.component';
import {
  EditTeamDialogComponent,
  EditTeamDialogData,
} from '../edit-team-dialog/edit-team-dialog.component';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import {
  AddPeriodDialogData,
  AddPeriodDialogComponent,
  CreateMethod,
} from '../add-period-dialog/add-period-dialog.component';
import { Bucket, ImmutableBucket } from '../bucket';
import { Person } from '../person';
import { Assignment } from '../assignment';
import { Objective } from '../objective';
import { AuthService } from '../services/auth.service';
import { environment } from 'src/environments/environment';
import { NotificationService } from '../services/notification.service';
import { PageTitleService } from '../services/pagetitle.service';
import { NgIf, NgFor } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import {
  MatCard,
  MatCardHeader,
  MatCardTitle,
  MatCardContent,
  MatCardActions,
} from '@angular/material/card';
import {
  MatIconButton,
  MatIconAnchor,
  MatButton,
} from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatNavList, MatListItem } from '@angular/material/list';

const DEFAULT_MAX_COMMITTED_PERCENTAGE = 50;

@Component({
  selector: 'app-teamperiods',
  templateUrl: './teamperiods.component.html',
  styleUrls: ['./teamperiods.component.css'],
  imports: [
    NgIf,
    MatProgressSpinner,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatIconButton,
    MatIcon,
    MatCardContent,
    MatNavList,
    NgFor,
    MatListItem,
    RouterLink,
    MatCardActions,
    MatIconAnchor,
    MatButton,
  ],
})
export class TeamPeriodsComponent implements OnInit {
  private storage = inject(StorageService);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);
  authService = inject(AuthService);
  private pageTitle = inject(PageTitleService);

  team?: ImmutableTeam;
  periods?: readonly ImmutablePeriod[];
  userHasEditPermissions = true;

  ngOnInit(): void {
    this.route.paramMap.subscribe((m) => {
      const teamId = m.get('team');
      if (teamId) {
        this.loadDataFor(teamId);
      }
    });
  }

  loadDataFor(teamId: string): void {
    this.team = undefined;
    this.periods = undefined;
    this.storage
      .getTeam(teamId)
      .pipe(
        catchError((error) => {
          this.notificationService.notifyError(
            'Could not load team "' + teamId + '": ',
            error
          );
          return of(undefined);
        })
      )
      .subscribe((team?: Team) => {
        if (team) {
          this.team = new ImmutableTeam(team);
          this.pageTitle.setPageTitle(team.displayName);
          // TODO(#83) Replace this logic with something determined by the server, like CanAddTeam
          if (environment.requireAuth && team.teamPermissions !== undefined) {
            const user = this.authService.user$.getValue();
            const userEmail = user?.email;
            const userDomain = user?.domain;
            const principalTypeEmail = 'email';
            const principalTypeDomain = 'domain';
            this.userHasEditPermissions = false;
            team.teamPermissions.write.allow.forEach((permission) => {
              if (
                (permission.type === principalTypeDomain &&
                  permission.id.toLowerCase() === userDomain?.toLowerCase()) ||
                (permission.type === principalTypeEmail &&
                  permission.id.toLowerCase() === userEmail?.toLowerCase())
              ) {
                this.userHasEditPermissions = true;
              }
            });
          }
        } else {
          this.team = undefined;
        }
      });

    this.storage
      .getPeriods(teamId)
      .pipe(
        catchError((error) => {
          this.notificationService.notifyError('Could not load periods', error);
          return of(undefined);
        })
      )
      .subscribe((periods?: Period[]) => {
        if (periods) {
          this.periods = periods.map((p) => ImmutablePeriod.fromPeriod(p));
        } else {
          this.periods = undefined;
        }
      });
  }

  isLoaded(): boolean {
    return this.team !== undefined && this.periods !== undefined;
  }

  sortedPeriods(): ImmutablePeriod[] {
    const result = this.periods!.slice();
    result.sort((a, b) =>
      a.displayName < b.displayName ? 1 : a.displayName > b.displayName ? -1 : 0
    );
    return result;
  }

  addPeriod(): void {
    if (this.periods!.length === 0) {
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
    const dialogRef = this.dialog.open(AddPeriodDialogComponent, {
      data: dialogData,
    });
    dialogRef.afterClosed().subscribe((data) => {
      if (!data) {
        return;
      }
      let newPeriod: Period;
      if (data.createMethod === CreateMethod.Blank) {
        newPeriod = data.period;
      } else if (data.createMethod === CreateMethod.Copy) {
        const copiedPeriod = this.periods!.find(
          (p) => p.id === data.copyFromPeriodID
        );
        if (!copiedPeriod) {
          this.notificationService.notifyError(
            'Cannot find period with ID "' + data.copyFromPeriodID + '"'
          );
          return;
        }
        newPeriod = {
          id: data.period.id,
          displayName: data.period.displayName,
          unit: data.copyUnit ? copiedPeriod.unit : data.period.unit,
          unitAbbrev: data.copyUnit
            ? copiedPeriod.unitAbbrev
            : data.period.unitAbbrev,
          secondaryUnits: data.copyUnit
            ? copiedPeriod.secondaryUnits.map((su) => su.toOriginal())
            : data.period.secondaryUnits,
          notesURL: data.period.notesURL,
          maxCommittedPercentage: data.copyUnit
            ? copiedPeriod.maxCommittedPercentage
            : data.period.maxCommittedPercentage,
          buckets: data.copyBuckets
            ? this.copyBuckets(
                copiedPeriod.buckets,
                data.copyObjectives,
                data.copyAssignments
              )
            : [],
          people: data.copyPeople
            ? copiedPeriod.people.map((p) => p.toOriginal())
            : [],
          lastUpdateUUID: '',
        };
      } else {
        this.notificationService.notifyError(
          'Unexpected createMethod "' + data.createMethod + '"'
        );
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

  copyBuckets(
    orig: readonly ImmutableBucket[],
    copyObjectives: boolean,
    copyAssignments: boolean
  ): Bucket[] {
    const result: Bucket[] = [];
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
            groups: o.groups.map((g) => g.toOriginal()),
            tags: o.tags.map((t) => t.toOriginal()),
            assignments,
          });
        }
      }
      result.push({
        displayName: b.displayName,
        allocationPercentage: b.allocationPercentage,
        allocationAbsolute: b.allocationAbsolute,
        allocationType: b.allocationType,
        objectives: objectives,
      });
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
    const dialogRef = this.dialog.open(EditPeriodDialogComponent, {
      data: dialogData,
    });
    dialogRef.afterClosed().subscribe((ok) => {
      if (ok) {
        this.storeNewPeriod(dialogData.period);
      }
    });
  }

  storeNewPeriod(period: Period): void {
    this.storage
      .addPeriod(this.team!.id, period)
      .pipe(
        catchError((error) => {
          this.notificationService.notifyError(
            'Could not save new period',
            error
          );
          return of(undefined);
        })
      )
      .subscribe((updateResponse) => {
        if (updateResponse) {
          period.lastUpdateUUID = updateResponse.lastUpdateUUID;
          this.periods = this.periods!.concat([
            ImmutablePeriod.fromPeriod(period),
          ]);
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
    const dialogRef = this.dialog.open(EditTeamDialogComponent, {
      data: dialogData,
    });
    dialogRef.afterClosed().subscribe((team) => {
      this.storage
        .updateTeam(team)
        .pipe(
          catchError((error) => {
            this.notificationService.notifyError('Could not save team', error);
            return of('error');
          })
        )
        .subscribe((res) => {
          if (res !== 'error') {
            this.notificationService.notifyInfo('Saved');
            this.team = new ImmutableTeam(team);
          }
        });
    });
  }
}
