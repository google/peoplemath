import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Assignment } from '../assignment';

@Component({
  selector: 'app-assignment',
  templateUrl: './assignment.component.html',
  styleUrls: ['./assignment.component.css']
})
export class AssignmentComponent implements OnInit {
  @Input() assignment: Assignment;
  @Input() unit: string;
  @Input() objectiveResourceEstimate;
  @Input() objectiveResourcesCommitted;
  @Input() validAssignees: string[];
  @Output() onDelete = new EventEmitter<Assignment>();
  isForcedEditing: boolean = false;

  constructor() { }

  ngOnInit() {
  }

  isValidAssignee(): boolean {
    return this.validAssignees.findIndex(id => id === this.assignment.personId) >= 0;
  }

  isEditing(): boolean {
    return this.isForcedEditing || !this.isValidAssignee();
  }

  edit(): void {
    this.isForcedEditing = true;
  }

  stopEditing(): void {
    this.isForcedEditing = false;
  }

  delete(): void {
    this.onDelete.emit(this.assignment);
  }
}
