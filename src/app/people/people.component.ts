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

  addPerson(): void {
    const person = new Person();
    person.availability = this.defaultPersonAvailability;
    this.people.push(person);
  }

}
