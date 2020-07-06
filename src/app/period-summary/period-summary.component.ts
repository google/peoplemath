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
import { ImmutablePeriod, periodResourcesAllocatedI } from '../period';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { ImmutableTeam } from '../team';
import { ImmutableBucket, bucketResourcesAllocatedI } from '../bucket';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-period-summary',
  templateUrl: './period-summary.component.html',
  styleUrls: ['./period-summary.component.css']
})
export class PeriodSummaryComponent implements OnInit {
  team?: ImmutableTeam;
  period?: ImmutablePeriod;

  constructor(
    private storage: StorageService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(m => {
      const teamId = m.get('team');
      const periodId = m.get('period');
      if (teamId && periodId) {
        this.loadDataFor(teamId, periodId);
      }
    });
  }

  bucketAllocationFraction(bucket: ImmutableBucket): number {
    const total = periodResourcesAllocatedI(this.period!);
    return (total == 0) ? 0 : bucketResourcesAllocatedI(bucket) / total;
  }

  allGroupTypes(): string[] {
    let groupTypes = new Set<string>();
    this.period!.buckets.forEach(b => {
      b.objectives.forEach(o => {
        o.groups.forEach(g => {
          groupTypes.add(g.groupType);
        });
      });
    });
    let result = Array.from(groupTypes);
    result.sort();
    return result;
  }

  allTags(): string[] {
    let tags = new Set<string>();
    this.period!.buckets.forEach(b => {
      b.objectives.forEach(o => {
        o.tags.forEach(t => tags.add(t.name));
      });
    });
    let result = Array.from(tags);
    result.sort();
    return result;
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
    ).subscribe(team => {
      if (team) {
        this.team = new ImmutableTeam(team);
      } else {
        this.team = undefined;
      }
    });

    this.storage.getPeriod(teamId, periodId).pipe(
      catchError(err => {
        this.snackBar.open('Could not load period "' + periodId + '" for team "' + teamId + '": ' + err.error, 'Dismiss');
        console.error(err);
        return of(undefined);
      })
    ).subscribe(period => {
      if (period) {
        this.period = new ImmutablePeriod(period);
      } else {
        this.period = undefined;
      }
    });
  }

  isLoaded(): boolean {
    return !!this.team && !!this.period;
  }
}
