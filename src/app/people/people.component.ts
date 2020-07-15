// Copyright 2019-2020 Google LLC
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
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl, ValidatorFn, AbstractControl, Validators } from '@angular/forms';

class PersonData {
  constructor(
      public personDesc: string,
      public location: string,
      public availability: number,
      public allocated: number,
      public unallocated: number,
      public assignmentCount: number,
      public commitFraction: number,
      public isOverallocated: boolean,
      public person: Person,
  ) {}
}

@Component({
  selector: 'app-people',
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.css']
})
export class PeopleComponent implements OnInit {
  @Input() people?: Person[];
  @Input() peopleAllocations?: Map<string, number>;
  @Input() peopleCommittedAllocations?: Map<string, number>;
  @Input() peopleAssignmentCounts?: Map<string, number>;
  @Input() totalAvailable?: number;
  @Input() totalAllocated?: number;
  @Input() totalUnallocated?: number;
  @Input() totalAssignmentCount?: number;
  @Input() unit?: string;
  @Input() isEditingEnabled?: boolean;
  @Output() onChanged = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<Person>();
  @ViewChild(MatSort) sort?: MatSort;

  constructor(public dialog: MatDialog) { }

  ngOnInit() {
  }

  displayedColumns(): string[] {
    let columnLabels = ['personDesc'];
    if (this.people!.find(p => p.location)) {
      columnLabels.push('location');
    }
    columnLabels.push('availability', 'allocated', 'unallocated', 'assignmentCount', 'commitFraction');
    return columnLabels;
  }

  tableData(): MatTableDataSource<PersonData> {
    let data = this.people!.map(p => new PersonData(personDisplayNameWithUsername(p), p.location, p.availability,
      this.personAllocated(p), this.personUnallocated(p), this.personAssignmentCount(p),
      this.personCommitFraction(p), this.isPersonOverallocated(p), p));
    let result = new MatTableDataSource(data);
    result.sort = this.sort!;
    return result;
  }

  /**
   * Amount of the given person's resources allocated to objectives during this period.
   */
  personAllocated(person: Person): number {
    return this.peopleAllocations!.has(person.id) ? this.peopleAllocations!.get(person.id)! : 0;
  }

  /**
   * Amount of the given person's resources not allocated to objectives during this period.
   */
  personUnallocated(person: Person): number {
    return person.availability - this.personAllocated(person);
  }

  /**
   * Number of distinct assignments for the person during this period.
   */
  personAssignmentCount(person: Person): number {
    return this.peopleAssignmentCounts!.has(person.id) ? this.peopleAssignmentCounts!.get(person.id)! : 0;
  }

  /**
   * Fraction of a person's assignments which are committed objectives
   */
  personCommitFraction(person: Person): number {
    let totalAllocated = this.personAllocated(person);
    if (!totalAllocated) {
      return 0;
    }
    let committed = this.peopleCommittedAllocations!.has(person.id) ? this.peopleCommittedAllocations!.get(person.id)! : 0;
    return committed / totalAllocated;
  }

  isPersonOverallocated(person: Person): boolean {
    return this.personAllocated(person) > person.availability;
  }

  isTeamOverallocated(): boolean {
    return this.totalUnallocated! < 0;
  }

  /**
   * Just calculate the modal availability
   */
  defaultPersonAvailability(): number {
    let availCounts = new Map<number, number>();
    this.people!.forEach(p => {
      if (!availCounts.get(p.availability)) {
        availCounts.set(p.availability, 0);
      }
      availCounts.set(p.availability, availCounts.get(p.availability)! + 1);
    });
    let maxFreq = 0;
    let mode = 0;
    availCounts.forEach((freq, a) => {
      if (freq > maxFreq) {
        maxFreq = freq;
        mode = a;
      }
    })
    return mode;
  }

  addPerson(): void {
    if (!this.isEditingEnabled) {
      return;
    }
    const person = new Person('', '', '', this.defaultPersonAvailability());
    const dialogData: EditPersonDialogData = {
      person: person, unit: this.unit!, title: "Add person", okAction: "Add",
      existingUserIDs: this.people!.map(p => p.id),
      allowCancel: true, allowDelete: false, showDeleteConfirm: false,
      allowUsernameEdit: true, onDelete: undefined,
    };
    const dialogRef = this.dialog.open(EditPersonDialog, {data: dialogData});
    dialogRef.afterClosed().subscribe(ok => {
      if (ok) {
        this.people!.push(person);
        this.people!.sort((a, b) => a.id < b.id ? -1 : (a.id > b.id ? 1 : 0));
        this.onChanged.emit(person);
      }
    });
  }

  editPerson(p: Person): void {
    if (!this.isEditingEnabled || !p) {
      return;
    }
    const dialogData: EditPersonDialogData = {
      person: p, unit: this.unit!, title: 'Edit person "' + p.id + '"', okAction: "OK",
      existingUserIDs: [], // Doesn't matter for existing people
      allowCancel: false, allowDelete: true, showDeleteConfirm: false,
      allowUsernameEdit: false, onDelete: this.onDelete,
    };
    const dialogRef = this.dialog.open(EditPersonDialog, {data: dialogData});
    dialogRef.afterClosed().subscribe(ok => {
      if (ok) {
        this.onChanged.emit(p);
      }
    });
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
  existingUserIDs: Array<String>;
  onDelete?: EventEmitter<Person>;
}

@Component({
  selector: 'app-edit-person-dialog',
  templateUrl: 'edit-person-dialog.html'
})
export class EditPersonDialog {
  userIdControl: FormControl;
  locationControl: FormControl;
  displayNameControl: FormControl;
  availabilityControl: FormControl;

  constructor(
    public dialogRef: MatDialogRef<EditPersonDialog>,
    @Inject(MAT_DIALOG_DATA) public data: EditPersonDialogData) {
      this.userIdControl = new FormControl(data.person.id, [this.validateUserId, Validators.required]);
      this.locationControl = new FormControl(data.person.location);
      this.displayNameControl = new FormControl(data.person.displayName);
      this.availabilityControl = new FormControl(data.person.availability);
  }

  get validateUserId(): ValidatorFn {
    return (c: AbstractControl) => {
      if (this.data.allowUsernameEdit && this.data.existingUserIDs.includes(c.value)) {
        return {'nonunique': true};
      }
      return null;
    };
  }

  isDataValid(): boolean {
    return this.userIdControl.valid && this.displayNameControl.valid
        && this.availabilityControl.valid;
  }

  onOK(): void {
    this.data.person.id = this.userIdControl.value;
    this.data.person.location = this.locationControl.value;
    this.data.person.displayName = this.displayNameControl.value;
    this.data.person.availability = this.availabilityControl.value;
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
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
    this.data.onDelete!.emit(this.data.person);
    this.dialogRef.close(false);
  }
}
