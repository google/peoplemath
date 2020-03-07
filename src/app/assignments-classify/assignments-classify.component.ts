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

import { Component, OnInit, Input } from '@angular/core';
import { Period } from '../period';
import { Objective } from '../objective';

enum AggregateBy {
  Group = 'group',
  Tag = 'tag',
}

@Component({
  selector: 'app-assignments-classify',
  templateUrl: './assignments-classify.component.html',
  styleUrls: ['./assignments-classify.component.css']
})
export class AssignmentsClassifyComponent implements OnInit {
  @Input() period: Period;
  @Input() aggregateBy: AggregateBy;
  @Input() groupType: string;
  @Input() title: string;

  constructor() { }

  ngOnInit(): void {
  }

  objectivesByGroup(): Array<[string, Objective[]]> {
    let result = new Map<string, Objective[]>();
    this.period.buckets.forEach(b => {
      b.objectives.forEach(o => {
        let mgs = o.groups.filter(g => g.groupType == this.groupType);
        if (mgs.length > 0) {
          let groupName = mgs[0].groupName;
          let obs = result.has(groupName) ? result.get(groupName) : [];
          obs.push(o);
          result.set(groupName, obs);
        }
      });
    });
    return Array.from(result.entries());
  }

  objectivesByTag(): Array<[string, Objective[]]> {
    let result = new Map<string, Objective[]>();
    this.period.buckets.forEach(b => {
      b.objectives.forEach(o => {
        o.tags.forEach(t => {
          let obs = result.has(t.name) ? result.get(t.name) : [];
          obs.push(o);
          result.set(t.name, obs);
        });
      });
    });
    return Array.from(result.entries());
  }

  objectivesByClass(): Array<[string, Objective[]]> {
    switch (this.aggregateBy) {
      case AggregateBy.Group:
        return this.objectivesByGroup();
      case AggregateBy.Tag:
        return this.objectivesByTag();
    }
  }

  assignedResources(objective: Objective): number {
    return objective.assignments.map(a => a.commitment).reduce(
      (sum, next) => sum + next, 0);
  }
}
