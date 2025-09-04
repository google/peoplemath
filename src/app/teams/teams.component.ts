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
import { Team, ImmutableTeam, TeamList } from '../team';
import { StorageService } from '../storage.service';
import { MatDialog } from '@angular/material/dialog';
import {
  EditTeamDialogComponent,
  EditTeamDialogData,
} from '../edit-team-dialog/edit-team-dialog.component';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { PageTitleService } from '../services/pagetitle.service';

import { MatProgressSpinner } from '@angular/material/progress-spinner';
import {
  MatCard,
  MatCardHeader,
  MatCardTitle,
  MatCardContent,
  MatCardActions,
} from '@angular/material/card';
import { MatNavList, MatListItem } from '@angular/material/list';
import { RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.css'],
  imports: [
    MatProgressSpinner,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatNavList,
    MatListItem,
    RouterLink,
    MatCardActions,
    MatButton
],
})
export class TeamsComponent implements OnInit {
  private storage = inject(StorageService);
  private dialog = inject(MatDialog);
  private notification = inject(NotificationService);
  private pageTitle = inject(PageTitleService);

  teams?: readonly ImmutableTeam[];
  addTeamDisabled = false;

  ngOnInit(): void {
    this.loadData();
    this.pageTitle.setPageTitle('Teams');
  }

  loadData(): void {
    this.storage
      .getTeams()
      .pipe(
        catchError((error) => {
          this.notification.notifyError('Could not load teams', error);
          return of(undefined);
        })
      )
      .subscribe((teamList?: TeamList) => {
        if (teamList?.teams) {
          this.teams = teamList.teams.map((t) => new ImmutableTeam(t));
        } else {
          this.teams = undefined;
        }
        this.addTeamDisabled = !teamList?.canAddTeam;
      });
  }

  isLoaded(): boolean {
    return this.teams !== undefined;
  }

  addTeam(): void {
    const dialogData: EditTeamDialogData = {
      team: new Team('', ''),
      title: 'Add Team',
      okAction: 'Add',
      allowCancel: true,
      allowEditID: true,
    };
    const dialogRef = this.dialog.open(EditTeamDialogComponent, {
      data: dialogData,
    });
    dialogRef.afterClosed().subscribe((team) => {
      if (!team) {
        return;
      }
      this.storage
        .addTeam(team)
        .pipe(
          catchError((error) => {
            this.notification.notifyError('Could not save new team', error);
            return of('error');
          })
        )
        .subscribe((res) => {
          if (res !== 'error') {
            this.teams = this.teams!.concat(new ImmutableTeam(team));
          }
        });
    });
  }
}
