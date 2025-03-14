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
import { ImmutableObjective, totalResourcesAllocated } from '../objective';
import {
  MatCard,
  MatCardHeader,
  MatCardTitle,
  MatCardContent,
} from '@angular/material/card';
import { NgFor } from '@angular/common';
import { ObjectiveSummaryComponent } from '../objective-summary/objective-summary.component';
import { ResourceQuantityComponent } from '../resource-quantity/resource-quantity.component';

@Component({
  selector: 'app-tag-summary',
  templateUrl: './tag-summary.component.html',
  styleUrls: ['./tag-summary.component.css'],
  // Requires all inputs to be immutable
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    NgFor,
    ObjectiveSummaryComponent,
    ResourceQuantityComponent,
  ],
})
export class TagSummaryComponent {
  @Input() period?: ImmutablePeriod;
  @Input() tag?: string;

  taggedObjectives(): ImmutableObjective[] {
    const result: ImmutableObjective[] = [];
    this.period!.buckets.forEach((b) => {
      b.objectives.forEach((o) => {
        if (o.tags.map((t) => t.name).includes(this.tag!)) {
          result.push(o);
        }
      });
    });
    result.sort((o1, o2) => o2.resourcesAllocated() - o1.resourcesAllocated());
    return result;
  }

  /**
   * Total resources allocated to tagged objectives
   */
  totalAllocationsForTag(): number {
    return totalResourcesAllocated(this.taggedObjectives());
  }

  /**
   * Resources allocated to tagged objectives, as a fraction of total allocated
   * resources for the period.
   */
  allocationsFractionForTag(): number {
    return this.totalAllocationsForTag() / this.period!.resourcesAllocated();
  }
}
