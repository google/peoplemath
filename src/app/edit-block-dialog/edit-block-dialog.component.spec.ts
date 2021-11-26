/**
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MaterialModule } from '../material/material.module';
import { ImmutableObjective } from '../objective';

import {
  EditBlockDialogComponent,
  EditBlockDialogData,
} from './edit-block-dialog.component';

describe('EditBlockDialogComponent', () => {
  let component: EditBlockDialogComponent;
  let fixture: ComponentFixture<EditBlockDialogComponent>;

  let dialogSpy = jasmine.createSpyObj('MatDialogRef', ['open']);
  let dialogData: EditBlockDialogData = {
    blockPlaceholder: ImmutableObjective.fromObjective({
      name: 'O',
      resourceEstimate: 1,
      assignments: [],
      groups: [],
      tags: [],
      notes: '',
    }),
    blocksBelow: [],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditBlockDialogComponent],
      imports: [MaterialModule, FormsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogSpy },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditBlockDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
