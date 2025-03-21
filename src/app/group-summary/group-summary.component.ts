/**
 * Copyright 2020-2021, 2023, 2025 Google LLC
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

import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { ImmutablePeriod } from '../period';
import { ImmutableBucket } from '../bucket';
import { ImmutableObjective, totalResourcesAllocated } from '../objective';
import {
  MatCard,
  MatCardHeader,
  MatCardTitle,
  MatCardContent,
} from '@angular/material/card';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { ObjectiveSummaryComponent } from '../objective-summary/objective-summary.component';
import { ResourceQuantityComponent } from '../resource-quantity/resource-quantity.component';

@Component({
  selector: 'app-group-summary',
  templateUrl: './group-summary.component.html',
  styleUrls: ['./group-summary.component.css'],
  // Requires all inputs to be immutable
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatSlideToggle,
    FormsModule,
    NgIf,
    NgFor,
    ObjectiveSummaryComponent,
    ResourceQuantityComponent,
  ],
})
export class GroupSummaryComponent {
  @Input() period?: ImmutablePeriod;
  @Input() groupType?: string;
  showObjectives = false;
  showByBucket = true;

  bucketObjectivesByGroup(
    bucket: ImmutableBucket
  ): [string, ImmutableObjective[]][] {
    // We order groups by the order the first item from each appears within the bucket
    const groupOrder: string[] = [];
    const obsByGroup = new Map<string, ImmutableObjective[]>();
    const noGroup: ImmutableObjective[] = [];
    bucket.objectives.forEach((o) => {
      const gs = o.groups.filter((g) => g.groupType === this.groupType);
      if (gs.length > 0) {
        const groupName = gs[0].groupName;
        if (obsByGroup.has(groupName)) {
          obsByGroup.get(groupName)!.push(o);
        } else {
          obsByGroup.set(groupName, [o]);
          groupOrder.push(groupName);
        }
      } else {
        noGroup.push(o);
      }
    });

    // We don't change the sort order of objectives within each group here,
    // as we want objectives to remain in priority order

    const result: [string, ImmutableObjective[]][] = groupOrder.map((g) => [
      g,
      obsByGroup.get(g)!,
    ]);
    if (noGroup.length > 0) {
      result.push(['No ' + this.groupType, noGroup]);
    }
    return result;
  }

  allObjectivesByGroup(): [string, ImmutableObjective[]][] {
    const obsByGroup = new Map<string, ImmutableObjective[]>();
    const noGroup: ImmutableObjective[] = [];
    this.period!.buckets.forEach((b) => {
      b.objectives.forEach((o) => {
        const gs = o.groups.filter((g) => g.groupType === this.groupType);
        if (gs.length > 0) {
          const groupName = gs[0].groupName;
          const obs = obsByGroup.has(groupName)
            ? obsByGroup.get(groupName)!
            : [];
          obs.push(o);
          obsByGroup.set(groupName, obs);
        } else {
          noGroup.push(o);
        }
      });
    });

    // Sort objectives in each group by descending allocation
    for (const [_g, obs] of obsByGroup) {
      obs.sort((o1, o2) => o2.resourcesAllocated() - o1.resourcesAllocated());
    }
    noGroup.sort((o1, o2) => o2.resourcesAllocated() - o1.resourcesAllocated());

    const result: [string, ImmutableObjective[]][] = Array.from(
      obsByGroup.entries()
    );
    result.sort(
      ([g1, obs1], [g2, obs2]) =>
        totalResourcesAllocated(obs2) - totalResourcesAllocated(obs1) ||
        g1.localeCompare(g2)
    );
    if (noGroup.length > 0) {
      result.push(['No ' + this.groupType, noGroup]);
    }

    return result;
  }

  summaryObjective(
    groupName: string,
    objectives: ImmutableObjective[]
  ): ImmutableObjective {
    return ImmutableObjective.fromObjective({
      name: groupName,
      commitmentType: undefined,
      resourceEstimate: objectives.reduce(
        (sum, ob) => sum + ob.resourceEstimate,
        0
      ),
      assignments: [
        { personId: '', commitment: totalResourcesAllocated(objectives) },
      ],
      notes: 'Summary objective for ' + this.groupType + ' ' + groupName,
      groups: [],
      tags: [],
    });
  }

  totalResourcesAllocated(objectives: readonly ImmutableObjective[]): number {
    return totalResourcesAllocated(objectives);
  }

  /**
   * Fraction of total period allocated resources which are allocated to a
   * particular set of objectives.
   */
  fractionResourcesAllocated(
    objectives: readonly ImmutableObjective[]
  ): number {
    return (
      this.totalResourcesAllocated(objectives) /
      this.period!.resourcesAllocated()
    );
  }
}
