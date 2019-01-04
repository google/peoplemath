import { Component, OnInit, Input, Inject } from '@angular/core';
import { Person } from '../person';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

class PersonData {
  constructor(
      public personDesc: string,
      public availability: number,
      public committed: number,
      public uncommitted: number,
      public assignmentCount: number,
      public isOvercommitted: boolean,
      public isTotal: boolean,
      public person: Person,
  ) {}
}

@Component({
  selector: 'app-people',
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.css']
})
export class PeopleComponent implements OnInit {
  @Input() people: Person[];
  @Input() peopleCommitments: Map<string, number>;
  @Input() peopleAssignmentCounts: Map<string, number>;
  @Input() totalAvailable: number;
  @Input() totalCommitted: number;
  @Input() totalUncommitted: number;
  @Input() totalAssignmentCount: number;
  @Input() unit: string;
  editingPerson: Person = undefined;
  displayedColumns: string[] = ["person", "available", "committed", "uncommitted", "assignmentCount"];
  
  constructor(public dialog: MatDialog) { }

  ngOnInit() {
  }

  tableData(): PersonData[] {
    let result = this.people.map(p => new PersonData(p.displayNameWithUsername(), p.availability,
      this.personCommitted(p), this.personUncommitted(p), this.personAssignmentCount(p),
      this.isPersonOvercommitted(p), false, p));
    result.push(new PersonData("Total", this.totalAvailable,
      this.totalCommitted, this.totalUncommitted, this.totalAssignmentCount,
      this.isTeamOvercommitted(), true, undefined));
    return result;
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

  /**
   * Number of distinct assignments for the person during this period.
   */
  personAssignmentCount(person: Person): number {
    return this.peopleAssignmentCounts.has(person.id) ? this.peopleAssignmentCounts.get(person.id) : 0;
  }

  isPersonOvercommitted(person: Person): boolean {
    return this.personCommitted(person) > person.availability;
  }

  isTeamOvercommitted(): boolean {
    return this.totalUncommitted < 0;
  }

  /**
   * Just calculate the modal availability
   */
  defaultPersonAvailability(): number {
    var availCounts = {};
    this.people.forEach(p => {
      if (availCounts[p.availability] === undefined) {
        availCounts[p.availability] = 0;
      }
      availCounts[p.availability] += 1;
    });
    var maxFreq = 0;
    var mode: string = "0";
    for (var a in availCounts) {
      if (availCounts[a] > maxFreq) {
        maxFreq = availCounts[a];
        mode = a;
      }
    }
    return parseInt(mode, 10);
  }

  addPerson(): void {
    const person = new Person('', '', this.defaultPersonAvailability());
    const dialogRef = this.dialog.open(EditPersonDialog, {
      data: {
        person: person, unit: this.unit, title: "Add person", okAction: "Add",
        allowCancel: true, allowUsernameEdit: true}});
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.people.push(result);
      }
    });
  }

  editPerson(p: Person): void {
    if (!p) {
      return;
    }
    this.dialog.open(EditPersonDialog, {
      data: {
        person: p, unit: this.unit, title: 'Edit person "' + p.id + '"', okAction: "OK",
        allowCancel: false, allowUsernameEdit: false}});
  }
}

export interface EditPersonDialogData {
  person: Person;
  unit: string;
  title: string;
  okAction: string;
  allowCancel: boolean;
  allowUsernameEdit: boolean;
}

@Component({
  selector: 'app-edit-person-dialog',
  templateUrl: 'edit-person-dialog.html'
})
export class EditPersonDialog {
  constructor(
    public dialogRef: MatDialogRef<EditPersonDialog>,
      @Inject(MAT_DIALOG_DATA) public data: EditPersonDialogData) {}

  onCancel(): void {
    this.dialogRef.close();
  }
}