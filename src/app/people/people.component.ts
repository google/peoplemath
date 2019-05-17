// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { Component, OnInit, Input, Inject, EventEmitter, Output, ViewChild } from '@angular/core';
import { Person, personDisplayNameWithUsername } from '../person';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource, MatSort } from '@angular/material';

class PersonData {
  constructor(
      public personDesc: string,
      public availability: number,
      public committed: number,
      public uncommitted: number,
      public assignmentCount: number,
      public isOvercommitted: boolean,
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
  @Input() isEditingEnabled: boolean;
  @Output() onChanged = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<Person>();
  displayedColumns: string[] = ["personDesc", "availability", "committed", "uncommitted", "assignmentCount"];
  @ViewChild(MatSort) sort: MatSort;
  
  constructor(public dialog: MatDialog) { }

  ngOnInit() {
  }

  tableData(): MatTableDataSource<PersonData> {
    let data = this.people.map(p => new PersonData(personDisplayNameWithUsername(p), p.availability,
      this.personCommitted(p), this.personUncommitted(p), this.personAssignmentCount(p),
      this.isPersonOvercommitted(p), p));
    let result = new MatTableDataSource(data);
    result.sort = this.sort;
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
    if (!this.isEditingEnabled) {
      return;
    }
    const person = new Person('', '', this.defaultPersonAvailability());
    const dialogData: EditPersonDialogData = {
      person: person, unit: this.unit, title: "Add person", okAction: "Add",
      allowCancel: true, allowDelete: false, showDeleteConfirm: false,
      allowUsernameEdit: true, onDelete: undefined,
    };
    const dialogRef = this.dialog.open(EditPersonDialog, {data: dialogData});
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.people.push(result);
        this.people.sort((a,b) => a.id < b.id ? -1 : (a.id > b.id ? 1 : 0));
        this.onChanged.emit(result);
      }
    });
  }

  editPerson(p: Person): void {
    if (!this.isEditingEnabled || !p) {
      return;
    }
    const dialogData: EditPersonDialogData = {
      person: p, unit: this.unit, title: 'Edit person "' + p.id + '"', okAction: "OK",
      allowCancel: false, allowDelete: true, showDeleteConfirm: false,
      allowUsernameEdit: false, onDelete: this.onDelete,
    };
    const dialogRef = this.dialog.open(EditPersonDialog, {data: dialogData});
    dialogRef.afterClosed().subscribe(_ => this.onChanged.emit(p));
  }
}

export interface EditPersonDialogData {
  person: Person;
  unit: string;
  title: string;
  okAction: string;
  allowCancel: boolean;
  allowDelete: boolean;
  showDeleteConfirm: boolean;
  allowUsernameEdit: boolean;
  onDelete: EventEmitter<Person>;
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

  delete(): void {
    this.data.allowDelete = false;
    this.data.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.data.allowDelete = true;
    this.data.showDeleteConfirm = false;
  }

  confirmDelete(): void {
    this.data.onDelete.emit(this.data.person);
    this.dialogRef.close();
  }
}
