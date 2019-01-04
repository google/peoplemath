import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Objective } from '../objective';
import { Assignment } from '../assignment';
import { MatDialog } from '@angular/material';
import { PersonAssignmentData, AssignmentDialogComponent } from '../assignment-dialog/assignment-dialog.component';
import { EditObjectiveDialogComponent } from '../edit-objective-dialog/edit-objective-dialog.component';

@Component({
  selector: 'app-objective',
  templateUrl: './objective.component.html',
  styleUrls: ['./objective.component.css']
})
export class ObjectiveComponent implements OnInit {
  @Input() objective: Objective;
  @Input() unit: string;
  @Input() uncommittedTime: Map<string, number>;
  @Output() onDelete = new EventEmitter<Objective>();
  
  constructor(public dialog: MatDialog) { }

  ngOnInit() {
  }

  isFullyAssigned(): boolean {
    let assigned = this.objective.assignments.map(a => a.commitment)
        .reduce((sum, current) => sum + current, 0);
    return assigned >= this.objective.resourceEstimate;
  }

  assignmentSummary(): string {
    return this.objective.assignments.filter(a => a.commitment > 0)
        .map(a => a.personId + ": " + a.commitment).join(", ");
  }

  currentAssignment(personId: string): number {
    return this.objective.assignments.filter(a => a.personId === personId)
        .map(a => a.commitment)
        .reduce((sum, current) => sum + current, 0);
  }

  assign(): void {
    let assignmentData = [];
    this.uncommittedTime.forEach((uncommitted, personId) => {
      let currentAssignment = this.currentAssignment(personId);
      assignmentData.push(new PersonAssignmentData(
        personId, uncommitted + currentAssignment, currentAssignment));
    });
    const dialogRef = this.dialog.open(AssignmentDialogComponent, {
      'width': '700px',
      'data': {
        'objective': this.objective,
        'people': assignmentData,
        'timeEstimate': this.objective.resourceEstimate,
        'unit': this.unit,
        'columns': ['person', 'available', 'assign', 'actions']}});
    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return;
      }
      this.objective.assignments = result.people.filter((pad: PersonAssignmentData) => pad.assign > 0)
          .map((pad: PersonAssignmentData) => new Assignment(pad.username, pad.assign));
    });
  }

  edit(): void {
    this.dialog.open(EditObjectiveDialogComponent, {
      'data': {
        'objective': this.objective,
        'title': 'Edit Objective',
        'okAction': 'OK',
        'allowCancel': false,
        'unit': this.unit,
        'onDelete': this.onDelete,
      }
    });
  }
}
