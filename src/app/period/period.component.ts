// Copyright 2019-2020 Google LLC
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

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Bucket, ImmutableBucket } from '../bucket';
import { Period, ImmutablePeriod, periodResourcesAllocated } from '../period';
import { Team, ImmutableTeam } from '../team';
import { StorageService } from '../storage.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EditBucketDialogComponent, EditBucketDialogData } from '../edit-bucket-dialog/edit-bucket-dialog.component';
import { EditPeriodDialogComponent, EditPeriodDialogData } from '../edit-period-dialog/edit-period-dialog.component';
import { catchError, debounceTime } from 'rxjs/operators';
import { of, Subject } from 'rxjs';
import { ImmutablePerson } from '../person';
import { CommitmentType, ImmutableObjective } from '../objective';
import { Assignment, ImmutableAssignment } from '../assignment';
import { AggregateBy } from '../assignments-classify/assignments-classify.component';
import { ThemePalette } from '@angular/material/core';

@Component({
  selector: 'app-period',
  templateUrl: './period.component.html',
  styleUrls: ['./period.component.css'],
})
export class PeriodComponent implements OnInit {
  team?: ImmutableTeam;
  period?: ImmutablePeriod;
  isEditingEnabled: boolean = false;
  showOrderButtons: boolean = false;
  eventsRequiringSave = new Subject<any>();
  // To enable access to this enum from the template
  AggregateBy = AggregateBy;
 
  constructor(
    private storage: StorageService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    this.isEditingEnabled = false;
    this.showOrderButtons = false;
    this.route.paramMap.subscribe(m => {
      const teamId = m.get('team');
      const periodId = m.get('period');
      if (teamId && periodId) {
        this.loadDataFor(teamId, periodId);
      }
    });
    this.eventsRequiringSave.pipe(debounceTime(2000)).subscribe(_ => this.performSave());
  }

  enableEditing(): void {
    this.isEditingEnabled = true;
    this.showOrderButtons = false;
  }

  disableEditing(): void {
    this.isEditingEnabled = false;
    this.showOrderButtons = false;
  }

  toggleReordering(): void {
    this.showOrderButtons = !this.showOrderButtons;
  }

  reorderButtonColour(): ThemePalette {
    return this.showOrderButtons ? "accent" : undefined;
  }

  /**
   * Total resources available for the period across all people
   */
  totalAvailable(): number {
    return this.period!.people
        .map(person => person.availability)
        .reduce((sum, current) => sum + current, 0);
  }

  totalAllocated(): number {
    return periodResourcesAllocated(this.period!);
  }

  /**
   * Total resources for this period which have not been allocated to objectives
   */
  totalUnallocated(): number {
    return this.totalAvailable() - this.totalAllocated();
  }

  /**
   * Sum of bucket allocation percentages. Should generally be 100 (and never more).
   */
  totalAllocationPercentage(): number {
    return this.period!.buckets
        .map(bucket => bucket.allocationPercentage)
        .reduce((sum, current) => sum + current, 0);
  }

  totalAssignmentCount(): number {
    return this.period!.buckets.map(
      bucket => bucket.objectives.map(
        objective => objective.assignments.length).reduce(
          (sum, current) => sum + current, 0)).reduce(
            (sum, current) => sum + current, 0);
  }

  sumAssignmentValByPerson(
    objPred: (o: ImmutableObjective) => boolean,
    valFunc: (a: ImmutableAssignment) => number): ReadonlyMap<string, number> {
    let result: Map<string, number> = new Map();
    this.period!.buckets.forEach(bucket => {
      bucket.objectives.forEach(objective => {
        if (objPred(objective)) {
          objective.assignments.forEach(assignment => {
            let personId = assignment.personId;
            if (!result.has(personId)) {
              result.set(personId, 0);
            }
            result.set(personId, result.get(personId)! + valFunc(assignment));
          })
        }
      })
    });
    return result;
  }

  peopleAllocations(): ReadonlyMap<string, number> {
    return this.sumAssignmentValByPerson(o => true, (a: Assignment) => a.commitment);
  }

  peopleCommittedAllocations(): ReadonlyMap<string, number> {
    return this.sumAssignmentValByPerson(
      (o: ImmutableObjective) => o.commitmentType == CommitmentType.Committed,
      (a: ImmutableAssignment) => a.commitment);
  }

  peopleAssignmentCounts(): ReadonlyMap<string, number> {
    return this.sumAssignmentValByPerson(o => true, a => 1);
  }

  /**
   * Amount of unallocated time for each person
   */
  unallocatedTime(): ReadonlyMap<string,number> {
    let result = new Map();
    this.period!.people.forEach(p => result.set(p.id, p.availability));
    this.period!.buckets.forEach(b => {
      b.objectives.forEach(o => {
        o.assignments.forEach(a => {
          result.set(a.personId, result.get(a.personId) - a.commitment);
        });
      });
    });
    return result;
  }

  /**
   * Resources allocated to committed objectives
   */
  committedAllocations(): number {
    let totalCommitted = 0;
    this.period!.buckets.forEach(bucket => {
      bucket.objectives.forEach(o => {
        if (o.commitmentType == CommitmentType.Committed) {
          o.assignments.forEach(a => {
            totalCommitted += a.commitment;
          })
        }
      })
    });
    return totalCommitted;
  }
  
  /**
   * Fraction of allocated resources which is allocated to committed objectives
   */
  committedAllocationRatio(): number {
    let totalAllocated = this.totalAllocated();
    if (!totalAllocated) {
      return 0;
    }
    return this.committedAllocations() / totalAllocated;
  }

  committedAllocationsTooHigh(): boolean {
    return (this.committedAllocationRatio() * 100) > this.period!.maxCommittedPercentage;
  }

  otherBuckets(bucket: ImmutableBucket): ImmutableBucket[] {
    return this.period!.buckets.filter(b => b !== bucket);
  }

  groupTypesWithAssignments(): string[] {
    let result = new Set<string>();
    this.period!.buckets.forEach(b => {
      b.objectives.forEach(o => {
        if (o.assignments.length > 0) {
          o.groups.forEach(g => {
            result.add(g.groupType);
          });
        }
      });
    });
    return Array.from(result);
  }

  hasTagsWithAssignments(): boolean {
    for (let bucket of this.period!.buckets) {
      for (let objective of bucket.objectives) {
        if (objective.assignments.length > 0 && objective.tags.length > 0) {
          return true;
        }
      }
    }
    return false;
  }

  renameGroup(groupType: string, oldName: string, newName: string): void {
    let changed = false;
    let period = this.period!.toOriginal();
    period.buckets.forEach(b => {
      b.objectives.forEach(o => {
        o.groups.forEach(g => {
          if (g.groupType == groupType && g.groupName == oldName) {
            g.groupName = newName;
            changed = true;
          }
        });
      });
    });
    if (changed) {
      this.period = ImmutablePeriod.fromPeriod(period);
      this.save();
    }
  }

  renameTag(oldName: string, newName: string) {
    let changed = false;
    let period = this.period!.toOriginal();
    period.buckets.forEach(b => {
      b.objectives.forEach(o => {
        o.tags.forEach(t => {
          if (t.name == oldName) {
            t.name = newName;
            changed = true;
          }
        });
      });
    });
    if (changed) {
      this.period = ImmutablePeriod.fromPeriod(period);
      this.save();
    }
  }

  loadDataFor(teamId: string, periodId: string): void {
    this.team = undefined;
    this.period = undefined;
    this.storage.getTeam(teamId).pipe(
      catchError(error => {
        this.snackBar.open('Could not load team "' + teamId + '": ' + error.error, 'Dismiss');
        console.log(error);
        return of(new Team('', ''));
      })
    ).subscribe((team?: Team) => {
      if (team) {
        this.team = new ImmutableTeam(team);
      } else {
        this.team = undefined;
      }
    });

    this.storage.getPeriod(teamId, periodId).pipe(
      catchError(error => {
        this.snackBar.open('Could not load period "' + periodId + '" for team "' + teamId + '": '
          + error.error, 'Dismiss');
        console.log(error);
        return of({
          id: '',
          displayName: '',
          unit: '',
          secondaryUnits: [],
          notesURL: '',
          maxCommittedPercentage: 0,
          people: [],
          buckets: [],
          lastUpdateUUID: '',
        });
      })
    ).subscribe((period?: Period) => {
      if (period) {
        this.period = ImmutablePeriod.fromPeriod(period);
      } else {
        this.period = undefined;
      }
    });
  }

  isLoaded(): boolean {
    return this.team != undefined && this.period != undefined;
  }

  save(): void {
    // Running through a Subject allows debouncing
    this.eventsRequiringSave.next();
  }

  onNewPerson(person: ImmutablePerson): void {
    let newPeople = [...this.period!.people];
    newPeople.push(person);
    newPeople.sort((a,b) => a.id < b.id ? -1 : (a.id > b.id ? 1 : 0));
    this.period = this.period!.withNewPeople(newPeople);
  }

  onChangedPerson(oldPerson: ImmutablePerson, newPerson: ImmutablePerson): void {
    let newPeople = this.period!.people.map(p => (p === oldPerson) ? newPerson : p);
    newPeople.sort((a,b) => a.id < b.id ? -1 : (a.id > b.id ? 1 : 0));
    this.period = this.period!.withNewPeople(newPeople);
  }

  deletePerson(person: ImmutablePerson): void {
    // Deleting a person requires ensuring their assignments are deleted as well
    // TODO Consider making this and other similar cases first-class operations
    const period = this.period!.toOriginal();
    const index = period.people.findIndex(p => p === person);
    period.people.splice(index, 1);
    period.buckets.forEach(b => {
      b.objectives.forEach(o => {
        o.assignments = o.assignments.filter(a => a.personId != person.id);
      });
    });
    this.period = ImmutablePeriod.fromPeriod(period);
    this.save();
  }

  performSave(): void {
    if (!(this.team && this.period)) {
      console.error('performSave() called with team=' + this.team + ', period=' + this.period);
      return;
    }
    this.storage.updatePeriod(this.team.id, this.period.toOriginal()).pipe(
      catchError(error => {
        if (error.status == 409) {
          this.snackBar.open('This period was modified in another session. Try reloading the page and reapplying your edit.', 'Dismiss');
        } else {
          this.snackBar.open('Failed to save period: ' + error.error, 'Dismiss');
        }
        console.log(error);
        return of(undefined);
      })
    ).subscribe(updateResponse => {
      if (updateResponse) {
        this.snackBar.open('Saved', '', {duration: 2000});
        this.period = this.period!.withNewLastUpdateUUID(updateResponse.lastUpdateUUID);
      }
    });
  }

  edit(): void {
    if (!this.isEditingEnabled) {
      return;
    }
    const dialogData: EditPeriodDialogData = {
      period: this.period!.toOriginal(), title: 'Edit Period "' + this.period!.id + '"',
      okAction: 'OK', allowEditID: false,
    };
    const dialogRef = this.dialog.open(EditPeriodDialogComponent, {data: dialogData});
    dialogRef.afterClosed().subscribe(ok => {
      if (ok) {
        this.period = ImmutablePeriod.fromPeriod(dialogData.period);
        this.save();
      }
    });
  }

  addBucket(): void {
    if (!this.isEditingEnabled) {
      return;
    }
    const dialogData: EditBucketDialogData = {
      bucket: new Bucket('', 0, []),
      okAction: 'Add', allowCancel: true, title: 'Add bucket'};
    const dialogRef = this.dialog.open(EditBucketDialogComponent, {data: dialogData});
    dialogRef.afterClosed().subscribe(bucket => {
      if (!bucket) {
        return;
      }
      this.period = this.period!.withNewBucket(bucket);
      this.save();
    });
  }

  moveBucketUpOne(bucket: ImmutableBucket): void {
    this.period = this.period!.withBucketMovedUpOne(bucket);
    this.save();
  }

  moveBucketDownOne(bucket: ImmutableBucket): void {
    this.period = this.period!.withBucketMovedDownOne(bucket);
    this.save();
  }

  onBucketChanged(from: ImmutableBucket, to: ImmutableBucket): void {
    this.period = this.period!.withBucketChanged(from, to);
    this.save();
  }
}
