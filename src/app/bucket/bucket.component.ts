// Copyright 2019-2021 Google LLC
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

import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { fromEvent, ReplaySubject } from 'rxjs';
import { filter, map, take, takeUntil } from 'rxjs/operators';
import {
  PersonAssignmentData,
  AssignmentDialogComponent,
  AssignmentDialogData,
} from '../assignment-dialog/assignment-dialog.component';
import { Bucket, ImmutableBucket } from '../bucket';
import {
  EditObjectiveDialogComponent,
  EditObjectiveDialogData,
  makeEditedObjective,
} from '../edit-objective-dialog/edit-objective-dialog.component';
import {
  EditBucketDialogComponent,
  EditBucketDialogData,
} from '../edit-bucket-dialog/edit-bucket-dialog.component';
import { CommitmentType, ImmutableObjective } from '../objective';
import { ObjectiveComponent } from '../objective/objective.component';
import { DisplayObjectivesPipe } from './displayobjectives.pipe';
import { Assignment, ImmutableAssignment } from '../assignment';

@Component({
  selector: 'app-bucket',
  templateUrl: './bucket.component.html',
  styleUrls: ['./bucket.component.css'],
  providers: [DisplayObjectivesPipe],
  // Requires all inputs to be immutable
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class BucketComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() bucket?: ImmutableBucket;
  @Input() unit?: string;
  @Input() totalAllocationPercentage?: number;
  @Input() globalResourcesAvailable?: number;
  @Input() maxCommittedPercentage?: number;
  @Input() unallocatedTime?: ReadonlyMap<string, number>;
  @Input() showOrderButtons?: boolean;
  @Input() isEditingEnabled?: boolean;
  @Input() otherBuckets?: readonly ImmutableBucket[];

  @Output() moveBucketUp = new EventEmitter<ImmutableBucket>();
  @Output() moveBucketDown = new EventEmitter<ImmutableBucket>();
  @Output() moveObjectiveBucket = new EventEmitter<
    [ImmutableObjective, ImmutableBucket, ImmutableObjective, ImmutableBucket]
  >();
  @Output() changed = new EventEmitter<[ImmutableBucket, ImmutableBucket]>();
  @Output() delete = new EventEmitter<ImmutableBucket>();

  @ViewChild(MatCard, { read: ElementRef })
  private readonly card?: ElementRef<HTMLElement>;

  /** The CSS class used for targeting assign actions */
  readonly assignActionClass = 'assign-action';

  /** The objectives to show in the bucket */
  objectives: DisplayObjective[] = [];

  /** Observable to help with unsubscribing when this component is destroyed */
  private readonly destroyed$ = new ReplaySubject<void>(1);

  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly displayObjectives: DisplayObjectivesPipe,
    private readonly dialog: MatDialog
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.bucket) {
      const objectives = this.bucket?.objectives || [];
      this.objectives = this.displayObjectives.transform(objectives);

      // Since we're using OnPush, it's good practice to let Angular's change
      // detector know to check for changes since `this.objectives` has changed
      this.changeDetectorRef.markForCheck();
    }
  }

  ngAfterViewInit(): void {
    // Use event delegation to have a single click listener for all clicks. This
    // listener will handle events from both the assign action and objective
    // clicks. This will stop listening once the component is destroyed.
    fromEvent<MouseEvent>(this.card!.nativeElement, 'click', { passive: true })
      .pipe(
        takeUntil(this.destroyed$),
        map(({ target }) => target),
        filter((t): t is HTMLElement => t instanceof HTMLElement)
      )
      .subscribe((target) => {
        // Find the index of the objective that was clicked. If an index is not
        // found, that means the click happened outside of what we're interested
        // in.
        const dataKey = target.closest<HTMLElement>('[data-key]');
        const keyStr = dataKey instanceof HTMLElement && dataKey.dataset.key;
        const key = keyStr ? Number(keyStr) : Number.NaN;
        if (Number.isNaN(key)) {
          return;
        }

        const objective = this.objectives[key];
        if (!objective) {
          throw new Error(`Could not get objective ${key} from objectives`);
        }

        // Check if this click was on the assign button or the objective. We
        // need to check this first, since the assign target is a child of the
        // objective.
        const assign = target.closest(`.${this.assignActionClass}`);
        if (assign) {
          this.assign(objective.objective);
          return;
        }

        this.editObjective(objective.objective);
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  /**
   * Limit of resources expected to be allocated to the given bucket in this period,
   * based on total available and the percentage the user has set for this bucket.
   */
  bucketAllocationLimit(): number {
    return (
      (this.globalResourcesAvailable! * this.bucket!.allocationPercentage) / 100
    );
  }

  edit(): void {
    if (!this.isEditingEnabled) {
      return;
    }
    const dialogData: EditBucketDialogData = {
      bucket: this.bucket!.toOriginal(),
      original: this.bucket!,
      okAction: 'OK',
      allowCancel: false,
      title: 'Edit bucket "' + this.bucket!.displayName + '"',
      onDelete: this.delete,
    };
    const dialogRef = this.dialog.open(EditBucketDialogComponent, {
      data: dialogData,
    });
    dialogRef.afterClosed().subscribe((bucket?: Bucket) => {
      if (bucket) {
        this.changed.emit([this.bucket!, ImmutableBucket.fromBucket(bucket)]);
      }
    });
  }

  private editObjective(objective: ImmutableObjective): void {
    if (!this.isEditingEnabled) {
      return;
    }

    const dialogRef = this.dialog.open(EditObjectiveDialogComponent, {
      data: {
        objective: makeEditedObjective(objective),
        original: objective,
        title: 'Edit Objective',
        okAction: 'OK',
        unit: this.unit || '',
        otherBuckets: this.otherBuckets || [],
        onMoveBucket: this.moveObjective,
        onDelete: this.deleteObjective,
      } as EditObjectiveDialogData,
    });

    // Listen for events when the dialog is closed. Unsubscribe the listener
    // when this component is either destroyed or when the close action has
    // emitted once.
    dialogRef
      .afterClosed()
      .pipe(
        takeUntil(this.destroyed$),
        take(1),
        filter((obj): obj is ImmutableObjective => !!obj)
      )
      .subscribe((newObjective) => {
        this.onObjectiveChanged(objective, newObjective);
      });
  }

  addObjective(): void {
    if (!this.isEditingEnabled) {
      return;
    }
    const dialogData: EditObjectiveDialogData = {
      objective: {
        name: '',
        resourceEstimate: 0,
        commitmentType: CommitmentType.Aspirational,
        notes: '',
        groups: '',
        tags: '',
        assignments: [],
        displayOptions: { enableMarkdown: false },
      },
      original: undefined,
      title: 'Add Objective',
      okAction: 'Add',
      unit: this.unit!,
      otherBuckets: [],
      onMoveBucket: undefined,
      onDelete: undefined,
    };
    const dialogRef = this.dialog.open(EditObjectiveDialogComponent, {
      data: dialogData,
    });
    dialogRef.afterClosed().subscribe((objective) => {
      if (!objective) {
        return;
      }
      this.changed.emit([
        this.bucket!,
        this.bucket!.withNewObjective(objective),
      ]);
    });
  }

  moveObjective(
    original: ImmutableObjective,
    newObjective: ImmutableObjective,
    newBucket: ImmutableBucket
  ): void {
    // Needs to be done in a single operation. Doing a delete in one bucket followed by an
    // add in the other bucket changes this component in between and doesn't work.
    this.moveObjectiveBucket.emit([
      original,
      this.bucket!,
      newObjective,
      newBucket,
    ]);
  }

  deleteObjective(objective: ImmutableObjective): void {
    this.changed.emit([
      this.bucket!,
      this.bucket!.withObjectiveDeleted(objective),
    ]);
  }

  private assign(objective: ImmutableObjective): void {
    if (!this.enableAssignButton(objective)) {
      return;
    }

    const unallocatedTime = this.unallocatedTime;
    if (!unallocatedTime) {
      throw new Error('Expected unallocatedTime to be defined');
    }

    const dialogRef = this.dialog.open(AssignmentDialogComponent, {
      width: '700px',
      data: {
        objective: objective.toOriginal(),
        people: personAssignmentData(unallocatedTime, objective.assignments),
        unit: this.unit || '',
        columns: ['person', 'available', 'assign', 'actions'],
      } as AssignmentDialogData,
    });

    dialogRef
      .afterClosed()
      .pipe(
        takeUntil(this.destroyed$),
        take(1),
        filter((result): result is AssignmentDialogData => !!result)
      )
      .subscribe((result) => {
        const newAssignments = result.people.reduce(
          (assignments: ImmutableAssignment[], { assign, username }) => {
            if (assign > 0) {
              assignments.push(
                new ImmutableAssignment(new Assignment(username, assign))
              );
            }

            return assignments;
          },
          []
        );

        const newObjective = objective.withAssignments(newAssignments);
        this.onObjectiveChanged(objective, newObjective);
      });
  }

  enableAssignButton(objective: ImmutableObjective): boolean {
    return (
      !!this.isEditingEnabled &&
      (objective.resourceEstimate > 0 || objective.assignments.length > 0) &&
      this.hasPeopleAvailable(objective)
    );
  }

  private hasPeopleAvailable(objective: ImmutableObjective): boolean {
    return (
      objective.assignments.some((a) => a.commitment > 0) ||
      [...this.unallocatedTime!.values()].some((t) => t > 0)
    );
  }

  reorderDrop(event: CdkDragDrop<ObjectiveComponent[]>): void {
    const newObjectives = [...this.bucket!.objectives];
    moveItemInArray(newObjectives, event.previousIndex, event.currentIndex);
    if (event.previousIndex !== event.currentIndex) {
      this.changed.emit([
        this.bucket!,
        this.bucket!.withNewObjectives(newObjectives),
      ]);
    }
  }

  onObjectiveChanged(
    original: ImmutableObjective,
    newObjective: ImmutableObjective
  ): void {
    this.changed.emit([
      this.bucket!,
      this.bucket!.withObjectiveChanged(original, newObjective),
    ]);
  }

  onMoveBucketUp(): void {
    this.moveBucketUp.emit(this.bucket);
  }

  onMoveBucketDown(): void {
    this.moveBucketDown.emit(this.bucket);
  }

  resourcesAllocated(): number {
    return this.bucket!.resourcesAllocated();
  }

  isOverAllocated(): boolean {
    return this.totalAllocationPercentage! > 100;
  }

  committedResourcesAllocated(): number {
    return this.bucket!.committedResourcesAllocated();
  }

  isOverCommitted(): boolean {
    return this.commitRatio() * 100 > this.maxCommittedPercentage!;
  }

  /**
   * Fraction of resources allocated within this bucket to committed objectives
   */
  commitRatio(): number {
    const total = this.resourcesAllocated();
    return total ? this.committedResourcesAllocated() / total : 0;
  }
}

export interface DisplayObjective {
  objective: ImmutableObjective;
  cumulativeSum: number;
}

export const personAssignmentData = (
  unallocatedTime: ReadonlyMap<string, number>,
  assignments: readonly ImmutableAssignment[]
): PersonAssignmentData[] =>
  [...unallocatedTime.entries()].reduce(
    (data: PersonAssignmentData[], [personId, unallocated]) => {
      const assign = currentAssignment(assignments, personId);
      if (unallocated > 0 || assign > 0) {
        data.push({
          assign,
          username: personId,
          available: unallocated + assign,
        });
      }

      return data;
    },
    []
  );

const currentAssignment = (
  assignments: readonly ImmutableAssignment[],
  personId: string
): number =>
  assignments.reduce(
    (sum, a) => (a.personId === personId ? sum + a.commitment : sum),
    0
  );
