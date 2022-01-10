/**
 * Copyright 2019-2022 Google LLC
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
import { ImmutablePeriod } from '../period';
import { catchError } from 'rxjs/operators';
import { combineLatest, of } from 'rxjs';
import { ImmutableTeam } from '../team';
import { ImmutableBucket } from '../bucket';
import { NotificationService } from '../services/notification.service';
import { PageTitleService } from '../services/pagetitle.service';

@Component({
  selector: 'app-period-summary',
  templateUrl: './period-summary.component.html',
  styleUrls: ['./period-summary.component.css'],
})
export class PeriodSummaryComponent implements OnInit {
  team?: ImmutableTeam;
  period?: ImmutablePeriod;

  constructor(
    private storage: StorageService,
    private route: ActivatedRoute,
    private notificationService: NotificationService,
    private pageTitle: PageTitleService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((m) => {
      const teamId = m.get('team');
      const periodId = m.get('period');
      if (teamId && periodId) {
        this.loadDataFor(teamId, periodId);
      }
    });
  }

  bucketAllocationFraction(bucket: ImmutableBucket): number {
    const total = this.period!.resourcesAllocated();
    return total === 0 ? 0 : bucket.resourcesAllocated() / total;
  }

  allGroupTypes(): string[] {
    const groupTypes = new Set<string>();
    this.period!.buckets.forEach((b) => {
      b.objectives.forEach((o) => {
        o.groups.forEach((g) => {
          groupTypes.add(g.groupType);
        });
      });
    });
    const result = Array.from(groupTypes);
    result.sort();
    return result;
  }

  allTags(): string[] {
    const tags = new Set<string>();
    this.period!.buckets.forEach((b) => {
      b.objectives.forEach((o) => {
        o.tags.forEach((t) => tags.add(t.name));
      });
    });
    const result = Array.from(tags);
    result.sort();
    return result;
  }

  loadDataFor(teamId: string, periodId: string): void {
    this.team = undefined;
    this.period = undefined;
    let teamObs = this.storage.getTeam(teamId);
    teamObs
      .pipe(
        catchError((err) => {
          this.notificationService.error$.next(
            'Could not load team "' + teamId + '": ' + JSON.stringify(err)
          );
          console.error(err);
          return of(undefined);
        })
      )
      .subscribe((team) => {
        if (team) {
          this.team = new ImmutableTeam(team);
        } else {
          this.team = undefined;
        }
      });

    let periodObs = this.storage.getPeriod(teamId, periodId);
    periodObs
      .pipe(
        catchError((err) => {
          this.notificationService.error$.next(
            'Could not load period "' +
              periodId +
              '" for team "' +
              teamId +
              '": ' +
              JSON.stringify(err)
          );
          console.error(err);
          return of(undefined);
        })
      )
      .subscribe((period) => {
        if (period) {
          this.period = ImmutablePeriod.fromPeriod(period);
        } else {
          this.period = undefined;
        }
      });

    combineLatest([teamObs, periodObs]).subscribe(([t, p]) => {
      if (t && p) {
        this.pageTitle.setPageTitle(
          t.displayName + ': ' + p.displayName + ' summary'
        );
      }
    });
  }

  isLoaded(): boolean {
    return !!this.team && !!this.period;
  }
}
