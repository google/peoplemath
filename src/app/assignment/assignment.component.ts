import { Component, OnInit, Input } from '@angular/core';
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
  isEditing: boolean = false;

  constructor() { }

  ngOnInit() {
  }

  isValidAssignee(): boolean {
    return this.validAssignees.findIndex(id => id === this.assignment.personId) >= 0;
  }

  edit(): void {
    this.isEditing = true;
  }

  stopEditing(): void {
    this.isEditing = false;
  }
}
