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
import { Team } from '../team';
import { StorageService } from '../storage.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EditTeamDialogComponent, EditTeamDialogData } from '../edit-team-dialog/edit-team-dialog.component';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.css']
})
export class TeamsComponent implements OnInit {
  teams?: Team[];

  constructor(
    private storage: StorageService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    this.loadData();
  }

  loadData(): void {
    this.storage.getTeams().pipe(
      catchError(error => {
        this.snackBar.open('Could not load teams: ' + error.error, 'Dismiss');
        console.log(error);
        return of([])
      })
    ).subscribe(teams => this.teams = teams);
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
      this.storage.addTeam(team).pipe(
        catchError(error => {
          this.snackBar.open("Could not save new team: " + error.error, 'Dismiss');
          console.log(error);
          return of("error");
        }),
      ).subscribe(res => {
        if (res != "error") {
          this.teams!.push(team);
        }
      });
    });
  }
}
