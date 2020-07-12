/**
 * Copyright 2020 Google LLC
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

import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { ImmutablePeriod } from '../period';
import { ImmutableObjective, objectiveResourcesAllocated, totalResourcesAllocated } from '../objective';

@Component({
  selector: 'app-tag-summary',
  templateUrl: './tag-summary.component.html',
  styleUrls: ['./tag-summary.component.css'],
  // Requires all inputs to be immutable
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagSummaryComponent implements OnInit {
  @Input() period?: ImmutablePeriod;
  @Input() tag?: string;

  constructor() { }

  ngOnInit(): void {
  }

  taggedObjectives(): ImmutableObjective[] {
    let result: ImmutableObjective[] = [];
    this.period!.buckets.forEach(b => {
      b.objectives.forEach(o => {
        if (o.tags.map(t => t.name).includes(this.tag!)) {
          result.push(o);
        }
      });
    });
    result.sort((o1, o2) => objectiveResourcesAllocated(o2) - objectiveResourcesAllocated(o1));
    return result;
  }

  totalAllocationsForTag(): number {
    return totalResourcesAllocated(this.taggedObjectives());
  }
}
