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
  isEditing: boolean = false;

  constructor() { }

  ngOnInit() {
  }

  edit(): void {
    this.isEditing = true;
  }

  stopEditing(): void {
    this.isEditing = false;
  }
}
