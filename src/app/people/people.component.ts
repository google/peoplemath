import { Component, OnInit, Input } from '@angular/core';
import { Person } from '../person';

@Component({
  selector: 'app-people',
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.css']
})
export class PeopleComponent implements OnInit {
  @Input() people: Person[];
  @Input() peopleCommitments: Map<string, number>;
  @Input() totalAvailable: number;
  @Input() totalCommitted: number;
  @Input() totalUncommitted: number;
  @Input() unit: string;
  defaultPersonAvailability: number = 6;
  editingPerson: Person = undefined;
  
  constructor() { }

  ngOnInit() {
  }

  /**
   * Amount of the given person's resources committed to objectives during this period.
   */
  personCommitted(person: Person): number {
    return this.peopleCommitments.has(person.id) ? this.peopleCommitments.get(person.id) : 0;
  }

  /**
   * Amount of the given person's resources not committed to objectives during this period.
   */
  personUncommitted(person: Person): number {
    return person.availability - this.personCommitted(person);
  }

  isPersonOvercommitted(person: Person): boolean {
    return this.personCommitted(person) > person.availability;
  }

  isTeamOvercommitted(): boolean {
    return this.totalUncommitted < 0;
  }

  addPerson(): void {
    const person = new Person('new', '', this.defaultPersonAvailability);
    this.people.push(person);
    this.edit(person);
  }

  isEditing(person: Person): boolean {
    return this.editingPerson === person;
  }

  edit(person: Person) {
    this.editingPerson = person;
  }

  stopEditing(): void {
    this.editingPerson = undefined;
  }
}
