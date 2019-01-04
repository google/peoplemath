import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Bucket } from '../bucket';
import { Period } from '../period';
import { Team } from '../team';
import { OkrStorageService } from '../okrstorage.service';
import { MatDialog } from '@angular/material';
import { EditBucketDialogComponent } from '../edit-bucket-dialog/edit-bucket-dialog.component';
import { EditPeriodDialogComponent } from '../edit-period-dialog/edit-period-dialog.component';

@Component({
  selector: 'app-period',
  templateUrl: './period.component.html',
  styleUrls: ['./period.component.css'],
})
export class PeriodComponent implements OnInit {
  team: Team;
  period: Period;
 
  constructor(
    private okrStorage: OkrStorageService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.loadData();
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
        .map(bucket => bucket.resourcesCommitted())
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
    this.okrStorage.getTeam(teamId).subscribe(team => this.team = team);
    this.okrStorage.getPeriod(teamId, periodId).subscribe(period => this.period = period);
  }

  edit(): void {
    this.dialog.open(EditPeriodDialogComponent, {
      data: {
        period: this.period, title: 'Edit Period "' + this.period.id + '"',
        okAction: 'OK', allowCancel: false, allowEditID: false,
      },
    });
  }

  addBucket(): void {
    const dialogRef = this.dialog.open(EditBucketDialogComponent, {
      data: {bucket: new Bucket('', 0, []), okAction: 'Add', allowCancel: true, title: 'Add bucket'},
    });
    dialogRef.afterClosed().subscribe(bucket => {
      if (!bucket) {
        return;
      }
      this.period.buckets.push(bucket);
    })
  }
}
