import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Bucket, bucketResourcesCommitted } from '../bucket';
import { Objective } from '../objective';
import { MatDialog } from '@angular/material';
import { EditObjectiveDialogComponent, EditObjectiveDialogData } from '../edit-objective-dialog/edit-objective-dialog.component';
import { EditBucketDialogComponent, EditBucketDialogData } from '../edit-bucket-dialog/edit-bucket-dialog.component';

@Component({
  selector: 'app-bucket',
  templateUrl: './bucket.component.html',
  styleUrls: ['./bucket.component.css']
})
export class BucketComponent implements OnInit {
  @Input() bucket: Bucket;
  @Input() unit: string;
  @Input() totalAllocationPercentage: number;
  @Input() globalResourcesAvailable: number;
  @Input() uncommittedTime: Map<string, number>;
  @Input() showOrderButtons: boolean;
  @Input() isEditingEnabled: boolean;
  @Output() onMoveBucketUp = new EventEmitter<Bucket>();
  @Output() onMoveBucketDown = new EventEmitter<Bucket>();
  @Output() onChanged = new EventEmitter<any>();

  constructor(public dialog: MatDialog) { }

  ngOnInit() {
  }

  /**
   * Resources allocated to the given bucket in this period, based on total available
   * and bucket allocation percentage.
   */
  bucketAllocation(): number {
    return this.globalResourcesAvailable * this.bucket.allocationPercentage / 100;
  }

  edit(): void {
    if (!this.isEditingEnabled) {
      return;
    }
    const dialogData: EditBucketDialogData = {
      'bucket': this.bucket, 'okAction': 'OK', 'allowCancel': false,
      'title': 'Edit bucket "' + this.bucket.displayName + '"',
    };
    const dialogRef = this.dialog.open(EditBucketDialogComponent, {data: dialogData});
    dialogRef.afterClosed().subscribe(_ => this.onChanged.emit(this.bucket));
  }

  addObjective(): void {
    if (!this.isEditingEnabled) {
      return;
    }
    const dialogData: EditObjectiveDialogData = {
      'objective': new Objective('', 0, []),
      'title': 'Add Objective',
      'okAction': 'Add',
      'allowCancel': true,
      'unit': this.unit,
      'onDelete': undefined,
    };
    const dialogRef = this.dialog.open(EditObjectiveDialogComponent, {data: dialogData});
    dialogRef.afterClosed().subscribe(objective => {
      if (!objective) {
        return;
      }
      this.bucket.objectives.push(objective);
      this.onChanged.emit(this.bucket);
    });
  }

  private objectiveIndex(objective: Objective): number {
    return this.bucket.objectives.findIndex(o => o === objective);
  }

  deleteObjective(objective: Objective): void {
    const index = this.objectiveIndex(objective);
    this.bucket.objectives.splice(index, 1);
    this.onChanged.emit(this.bucket);
  }

  moveObjectiveUpOne(objective: Objective): void {
    const index = this.objectiveIndex(objective);
    if (index == 0) {
      return;
    }
    this.bucket.objectives[index] = this.bucket.objectives[index - 1];
    this.bucket.objectives[index - 1] = objective;
    this.onChanged.emit(this.bucket);
  }

  moveObjectiveDownOne(objective: Objective): void {
    const index = this.objectiveIndex(objective);
    if (index >= this.bucket.objectives.length - 1) {
      return;
    }
    this.bucket.objectives[index] = this.bucket.objectives[index + 1];
    this.bucket.objectives[index + 1] = objective;
    this.onChanged.emit(this.bucket);
  }

  onObjectiveChanged(objective: Objective): void {
    this.onChanged.emit(objective);
  }

  moveBucketUp(): void {
    this.onMoveBucketUp.emit(this.bucket);
  }

  moveBucketDown(): void {
    this.onMoveBucketDown.emit(this.bucket);
  }

  resourcesCommitted(): number {
    return bucketResourcesCommitted(this.bucket);
  }
}
