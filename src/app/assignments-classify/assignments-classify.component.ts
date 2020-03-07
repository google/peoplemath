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
import { Objective, objectiveResourcesAllocated } from '../objective';

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
    let obsByGroup = new Map<string, Objective[]>();
    this.period.buckets.forEach(b => {
      b.objectives.forEach(o => {
        if (o.assignments.length > 0) {
          let mgs = o.groups.filter(g => g.groupType == this.groupType);
          if (mgs.length > 0) {
            let groupName = mgs[0].groupName;
            let obs = obsByGroup.has(groupName) ? obsByGroup.get(groupName) : [];
            obs.push(o);
            obsByGroup.set(groupName, obs);
          }
        }
      });
    });
    let result = Array.from(obsByGroup.entries());
    result.sort(([g1, obs1], [g2, obs2]) => {
      let resources1 = obs1.reduce((sum, ob) => sum + objectiveResourcesAllocated(ob), 0);
      let resources2 = obs2.reduce((sum, ob) => sum + objectiveResourcesAllocated(ob), 0);
      return (resources2 - resources1) || g1.localeCompare(g2);
    });
    return result;
  }

  objectivesByTag(): Array<[string, Objective[]]> {
    let obsByTag = new Map<string, Objective[]>();
    this.period.buckets.forEach(b => {
      b.objectives.forEach(o => {
        if (o.assignments.length > 0) {
          o.tags.forEach(t => {
            let obs = obsByTag.has(t.name) ? obsByTag.get(t.name) : [];
            obs.push(o);
            obsByTag.set(t.name, obs);
          });
        }
      });
    });
    let result = Array.from(obsByTag.entries());
    result.sort(([g1, _obs1], [g2, _obs2]) => g1.localeCompare(g2));
    return result;
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
    return objectiveResourcesAllocated(objective);
  }
}
