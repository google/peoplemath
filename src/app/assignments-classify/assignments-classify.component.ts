/**
 * Copyright 2020-2022 Google LLC
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

import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnDestroy,
} from '@angular/core';
import { ImmutablePeriod } from '../period';
import {
  editObjective,
  ImmutableObjective,
  totalResourcesAllocated,
} from '../objective';
import { MatDialog } from '@angular/material/dialog';
import {
  RenameClassDialogComponent,
  RenameClassDialogData,
} from '../rename-class-dialog/rename-class-dialog.component';
import { ImmutableBucket } from '../bucket';
import { Subscription } from 'rxjs';

export enum AggregateBy {
  Group = 'group',
  Tag = 'tag',
}

@Component({
  selector: 'app-assignments-classify',
  templateUrl: './assignments-classify.component.html',
  styleUrls: ['./assignments-classify.component.css'],
  // Requires all inputs to be immutable
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignmentsClassifyComponent implements OnDestroy {
  @Input() period?: ImmutablePeriod;
  @Input() aggregateBy?: AggregateBy;
  @Input() groupType?: string;
  @Input() title?: string;
  @Input() isEditingEnabled?: boolean;
  @Output() rename = new EventEmitter<[string, string]>();
  @Output() bucketChanged = new EventEmitter<
    [ImmutableBucket, ImmutableBucket]
  >();
  subscriptions: Subscription[] = [];

  constructor(private dialog: MatDialog) {}

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  objectivesByGroup(): Array<
    [string, [ImmutableObjective, ImmutableBucket][]]
  > {
    const obsByGroup = new Map<
      string,
      [ImmutableObjective, ImmutableBucket][]
    >();
    this.period!.buckets.forEach((b) => {
      b.objectives.forEach((o) => {
        const mgs = o.groups.filter((g) => g.groupType === this.groupType);
        if (mgs.length > 0) {
          const groupName = mgs[0].groupName;
          if (obsByGroup.has(groupName)) {
            obsByGroup.get(groupName)!.push([o, b]);
          } else {
            obsByGroup.set(groupName, [[o, b]]);
          }
        }
      });
    });
    for (const [_g, obsBuckets] of obsByGroup) {
      obsBuckets.sort(
        (ob1, ob2) => ob2[0].resourcesAllocated() - ob1[0].resourcesAllocated()
      );
    }
    const result = Array.from(obsByGroup.entries());
    result.sort(([g1, obs1], [g2, obs2]) => {
      const resources1 = this.totalAssignedResources(obs1);
      const resources2 = this.totalAssignedResources(obs2);
      return resources2 - resources1 || g1.localeCompare(g2);
    });
    return result;
  }

  hasUngroupedObjectives(): boolean {
    if (this.aggregateBy !== AggregateBy.Group) {
      return false;
    }
    for (const bucket of this.period!.buckets) {
      for (const objective of bucket.objectives) {
        const mgs = objective.groups.filter(
          (g) => g.groupType === this.groupType
        );
        if (mgs.length === 0) {
          return true;
        }
      }
    }
    return false;
  }

  ungroupedObjectives(): [ImmutableObjective, ImmutableBucket][] {
    const result: [ImmutableObjective, ImmutableBucket][] = [];
    this.period!.buckets.forEach((b) => {
      b.objectives.forEach((o) => {
        const mgs = o.groups.filter((g) => g.groupType === this.groupType);
        if (mgs.length === 0) {
          result.push([o, b]);
        }
      });
    });
    return result;
  }

  objectivesByTag(): Array<[string, [ImmutableObjective, ImmutableBucket][]]> {
    const obsByTag = new Map<string, [ImmutableObjective, ImmutableBucket][]>();
    this.period!.buckets.forEach((b) => {
      b.objectives.forEach((o) => {
        o.tags.forEach((t) => {
          if (obsByTag.has(t.name)) {
            obsByTag.get(t.name)!.push([o, b]);
          } else {
            obsByTag.set(t.name, [[o, b]]);
          }
        });
      });
    });
    for (const [_g, obsBuckets] of obsByTag) {
      obsBuckets.sort(
        (ob1, ob2) => ob2[0].resourcesAllocated() - ob1[0].resourcesAllocated()
      );
    }
    const result = Array.from(obsByTag.entries());
    result.sort(([g1, _obs1], [g2, _obs2]) => g1.localeCompare(g2));
    return result;
  }

  objectivesByClass(): Array<
    [string, [ImmutableObjective, ImmutableBucket][]]
  > {
    switch (this.aggregateBy) {
      case AggregateBy.Group:
        return this.objectivesByGroup();
      case AggregateBy.Tag:
        return this.objectivesByTag();
    }
    console.error('Unsupported aggregateBy "' + this.aggregateBy + '"');
    return [];
  }

  classTrackBy(
    _index: number,
    classObjBuckets: [string, [ImmutableObjective, ImmutableBucket][]]
  ): string {
    return classObjBuckets[0];
  }

  assignedResources(objective: ImmutableObjective): number {
    return objective.resourcesAllocated();
  }

  totalAssignedResources(
    objBuckets: readonly [ImmutableObjective, ImmutableBucket][]
  ): number {
    return totalResourcesAllocated(objBuckets.map((ob) => ob[0]));
  }

  renameClass(cname: string): void {
    const data: RenameClassDialogData = {
      classType: this.aggregateBy || '',
      currentName: cname,
    };
    const dialog = this.dialog.open(RenameClassDialogComponent, { data });
    dialog.afterClosed().subscribe((newName) => {
      if (newName) {
        this.rename.emit([cname, newName]);
      }
    });
  }

  editObjective(obj: ImmutableObjective, bucket: ImmutableBucket): void {
    if (!this.isEditingEnabled) {
      return;
    }
    const changeEmitter = new EventEmitter<
      [ImmutableObjective, ImmutableObjective]
    >();
    this.subscriptions.push(
      changeEmitter.subscribe(([before, after]) =>
        this.bucketChanged!.emit([
          bucket,
          bucket.withObjectiveChanged(before, after),
        ])
      )
    );
    const deleteEmitter = new EventEmitter<ImmutableObjective>();
    this.subscriptions.push(
      deleteEmitter.subscribe((o) =>
        this.bucketChanged!.emit([bucket, bucket.withObjectiveDeleted(o)])
      )
    );
    editObjective(
      obj,
      this.period?.unit!,
      [], // Don't allow moving between buckets via this path - it's not really important
      undefined,
      deleteEmitter,
      changeEmitter,
      this.dialog
    );
  }
}
