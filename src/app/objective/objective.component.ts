import { Component, OnInit, Input } from '@angular/core';
import { Objective } from '../objective';

@Component({
  selector: 'app-objective',
  templateUrl: './objective.component.html',
  styleUrls: ['./objective.component.css']
})
export class ObjectiveComponent implements OnInit {
  @Input() objective: Objective;
  @Input() unit: string;
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
