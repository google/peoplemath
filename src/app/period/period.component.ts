import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Bucket, bucketResourcesCommitted } from '../bucket';
import { Period } from '../period';
import { Team } from '../team';
import { StorageService } from '../storage.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { EditBucketDialogComponent, EditBucketDialogData } from '../edit-bucket-dialog/edit-bucket-dialog.component';
import { EditPeriodDialogComponent, EditPeriodDialogData } from '../edit-period-dialog/edit-period-dialog.component';
import { catchError, debounceTime } from 'rxjs/operators';
import { of, Subject } from 'rxjs';

@Component({
  selector: 'app-period',
  templateUrl: './period.component.html',
  styleUrls: ['./period.component.css'],
})
export class PeriodComponent implements OnInit {
  team: Team;
  period: Period;
  showOrderButtons: boolean;
  eventsRequiringSave = new Subject<any>();
 
  constructor(
    private storage: StorageService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    this.showOrderButtons = false;
    this.loadData();
    this.eventsRequiringSave.pipe(debounceTime(2000)).subscribe(_ => this.performSave());
  }

  /**
   * Total resources available for the period across all people
   */
  totalAvailable(): number {
    return this.period.people
        .map(person => person.availability)
        .reduce((sum, current) => sum + current, 0);
  }

  /**
   * Total resources for this period which have been committed to objectives
   */
  totalCommitted(): number {
    return this.period.buckets
        .map(bucketResourcesCommitted)
        .reduce((sum, prev) => sum + prev, 0);
  }

  /**
   * Total resources for this period which have not been committed to objectives
   */
  totalUncommitted(): number {
    return this.totalAvailable() - this.totalCommitted();
  }

  /**
   * Sum of bucket allocation percentages. Should generally be 100 (and never more).
   */
  totalAllocationPercentage(): number {
    return this.period.buckets
        .map(bucket => bucket.allocationPercentage)
        .reduce((sum, current) => sum + current, 0);
  }

  totalAssignmentCount(): number {
    return this.period.buckets.map(
      bucket => bucket.objectives.map(
        objective => objective.assignments.length).reduce(
          (sum, current) => sum + current, 0)).reduce(
            (sum, current) => sum + current, 0);
  }

  peopleCommitments(): Map<string, number> {
    let result: Map<string, number> = new Map();
    this.period.buckets.forEach(bucket => {
      bucket.objectives.forEach(objective => {
        objective.assignments.forEach(assignment => {
          let personId = assignment.personId;
          if (!result.has(personId)) {
            result.set(personId, 0);
          }
          result.set(personId, result.get(personId) + assignment.commitment);
        })
      })
    });
    return result;
  }

  peopleAssignmentCounts(): Map<string, number> {
    let result = new Map();
    this.period.buckets.forEach(bucket => {
      bucket.objectives.forEach(objective => {
        objective.assignments.forEach(assignment => {
          let personId = assignment.personId;
          if (!result.has(personId)) {
            result.set(personId, 0);
          }
          result.set(personId, result.get(personId) + 1);
        })
      })
    });
    return result;
  }

  /**
   * Amount of uncommitted time for each person
   */
  uncommittedTime(): Map<string,number> {
    let result = new Map();
    this.period.people.forEach(p => result.set(p.id, p.availability));
    this.period.buckets.forEach(b => {
      b.objectives.forEach(o => {
        o.assignments.forEach(a => {
          result.set(a.personId, result.get(a.personId) - a.commitment);
        });
      });
    });
    return result;
  }

  loadData(): void {
    const teamId = this.route.snapshot.paramMap.get('team');
    const periodId = this.route.snapshot.paramMap.get('period');
    this.storage.getTeam(teamId).pipe(
      catchError(error => {
        this.snackBar.open('Could not load team "' + teamId + '": ' + error.error, 'Dismiss');
        console.log(error);
        return of(new Team('', ''));
      })
    ).subscribe(team => this.team = team);

    this.storage.getPeriod(teamId, periodId).pipe(
      catchError(error => {
        this.snackBar.open('Could not load period "' + periodId + '" for team "' + teamId + '": '
          + error.error, 'Dismiss');
        console.log(error);
        return of(new Period('', '', '', [], [], ''));
      })
    ).subscribe(period => this.period = period);
  }

  isLoaded(): boolean {
    return this.team != undefined && this.period != undefined;
  }

  save(): void {
    // Running through a Subject allows debouncing
    this.eventsRequiringSave.next();
  }

  performSave(): void {
    this.storage.updatePeriod(this.team.id, this.period).pipe(
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
        this.period.lastUpdateUUID = updateResponse.lastUpdateUUID;
      }
    });
  }

  edit(): void {
    const dialogData: EditPeriodDialogData = {
      period: this.period, title: 'Edit Period "' + this.period.id + '"',
      okAction: 'OK', allowCancel: false, allowEditID: false,
    };
    const dialogRef = this.dialog.open(EditPeriodDialogComponent, {data: dialogData});
    dialogRef.afterClosed().subscribe(_ => this.save());
  }

  addBucket(): void {
    const dialogData: EditBucketDialogData = {
      bucket: new Bucket('', 0, []),
      okAction: 'Add', allowCancel: true, title: 'Add bucket'};
    const dialogRef = this.dialog.open(EditBucketDialogComponent, {data: dialogData});
    dialogRef.afterClosed().subscribe(bucket => {
      if (!bucket) {
        return;
      }
      this.period.buckets.push(bucket);
      this.save();
    });
  }

  moveBucketUpOne(bucket: Bucket): void {
    let index = this.period.buckets.findIndex(b => b === bucket);
    if (index > 0) {
      this.period.buckets[index] = this.period.buckets[index - 1];
      this.period.buckets[index - 1] = bucket;
    }
    this.save();
  }

  moveBucketDownOne(bucket: Bucket): void {
    let index = this.period.buckets.findIndex(b => b === bucket);
    if (index >= 0 && index < this.period.buckets.length - 1) {
      this.period.buckets[index] = this.period.buckets[index + 1];
      this.period.buckets[index + 1] = bucket;
    }
    this.save();
  }
}
