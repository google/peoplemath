/**
 * Copyright 2019-2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, OnInit } from '@angular/core';
import { StorageService } from '../storage.service';
import { ActivatedRoute } from '@angular/router';
import { Period, periodResourcesAllocated } from '../period';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Team } from '../team';
import { Bucket, bucketResourcesAllocated } from '../bucket';
import { Objective, CommitmentType, objectiveResourcesAllocated } from '../objective';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-period-summary',
  templateUrl: './period-summary.component.html',
  styleUrls: ['./period-summary.component.css']
})
export class PeriodSummaryComponent implements OnInit {
  team: Team;
  period: Period;

  constructor(
    private storage: StorageService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(m => this.loadDataFor(m.get('team'), m.get('period')));
  }

  bucketAllocationFraction(bucket: Bucket): number {
    const total = periodResourcesAllocated(this.period);
    return (total == 0) ? 0 : bucketResourcesAllocated(bucket) / total;
  }

  hasCommittedObjectives(bucket: Bucket): boolean {
    return this.committedObjectives(bucket).length > 0;
  }

  committedObjectives(bucket: Bucket): Objective[] {
    return bucket.objectives.filter(
      o => o.commitmentType == CommitmentType.Committed &&
      objectiveResourcesAllocated(o) > 0);
  }

  hasAspirationalObjectives(bucket: Bucket): boolean {
    return this.aspirationalObjectives(bucket).length > 0;
  }

  aspirationalObjectives(bucket: Bucket): Objective[] {
    return bucket.objectives.filter(
      o => o.commitmentType != CommitmentType.Committed &&
      objectiveResourcesAllocated(o) > 0);
  }

  hasRejectedObjectives(bucket: Bucket): boolean {
    return this.rejectedObjectives(bucket).length > 0;
  }

  rejectedObjectives(bucket: Bucket): Objective[] {
    return bucket.objectives.filter(o => objectiveResourcesAllocated(o) <= 0);
  }

  loadDataFor(teamId: string, periodId: string) {
    this.team = undefined;
    this.period = undefined;
    this.storage.getTeam(teamId).pipe(
      catchError(err => {
        this.snackBar.open('Could not load team "' + teamId + '": ' + err.error, 'Dismiss');
        console.error(err);
        return of(undefined);
      })
    ).subscribe(team => this.team = team);

    this.storage.getPeriod(teamId, periodId).pipe(
      catchError(err => {
        this.snackBar.open('Could not load period "' + periodId + '" for team "' + teamId + '": ' + err.error, 'Dismiss');
        console.error(err);
        return of(undefined);
      })
    ).subscribe(period => this.period = period);
  }

  isLoaded(): boolean {
    return !!this.team && !!this.period;
  }
}
