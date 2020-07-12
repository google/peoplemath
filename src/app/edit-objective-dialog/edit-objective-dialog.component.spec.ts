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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditObjectiveDialogComponent, EditObjectiveDialogData, makeEditedObjective, makeTags, makeGroups, EditedObjective } from './edit-objective-dialog.component';
import { MaterialModule } from '../material/material.module';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommitmentType, ImmutableObjective } from '../objective';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('EditObjectiveDialogComponent', () => {
  let component: EditObjectiveDialogComponent;
  let fixture: ComponentFixture<EditObjectiveDialogComponent>;
  let dialogSpy = jasmine.createSpyObj('MatDialogRef', ['open']);
  let objective = ImmutableObjective.fromObjective({
    name: 'My test objective',
    resourceEstimate: 17,
    commitmentType: CommitmentType.Aspirational,
    groups: [
      {groupType: 'G1', groupName: 'v1'},
      {groupType: 'G2', groupName: 'v2'},
    ],
    tags: [
      {name: 't1'}, {name: 't2'},
    ],
    notes: '',
    assignments: [],
  });
  let DIALOG_DATA: EditObjectiveDialogData = {
    objective: makeEditedObjective(objective),
    original: objective,
    title: 'My test dialog',
    okAction: 'OK',
    unit: 'person weeks',
    otherBuckets: [],
    onMoveBucket: undefined,
    onDelete: undefined,
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditObjectiveDialogComponent ],
      imports: [
        MaterialModule,
        FormsModule,
        BrowserAnimationsModule,
      ],
      providers: [
        {provide: MatDialogRef, useValue: dialogSpy},
        {provide: MAT_DIALOG_DATA, useValue: DIALOG_DATA},
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditObjectiveDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should convert tags as expected', () => {
    expect(makeTags('')).toEqual([]);
    expect(makeTags('single')).toEqual([{name: 'single'}]);
    expect(makeTags('one, two ,three ')).toEqual([{name: 'one'}, {name: 'two'}, {name: 'three'}])
  });

  it('should convert groups as expected', () => {
    expect(makeGroups('')).toEqual([]);
    expect(makeGroups('Single:val')).toEqual([{groupType: 'Single', groupName: 'val'}]);
    expect(makeGroups('G1:val1, G2: val2')).toEqual([
      {groupType: 'G1', groupName: 'val1'}, {groupType: 'G2', groupName: 'val2'}]);
    expect(makeGroups('val1,G2:val2')).toEqual([
      {groupType: 'Group', groupName: 'val1'}, {groupType: 'G2', groupName: 'val2'}]);
  });

  it('should create editable objective as expected', () => {
    let expected: EditedObjective = {
      name: 'My test objective',
      resourceEstimate: 17,
      commitmentType: CommitmentType.Aspirational,
      groups: 'G1:v1,G2:v2',
      tags: 't1,t2',
      notes: '',
      assignments: [],
    };
    expect(makeEditedObjective(objective)).toEqual(expected);
  });
});
