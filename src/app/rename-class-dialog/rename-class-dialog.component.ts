/**
 * Copyright 2020-2021, 2023, 2025 Google LLC
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

import { Component, OnInit, inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
} from '@angular/material/dialog';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';

export interface RenameClassDialogData {
  classType: string;
  currentName: string;
}

@Component({
  selector: 'app-rename-class-dialog',
  templateUrl: './rename-class-dialog.component.html',
  styleUrls: ['./rename-class-dialog.component.css'],
  imports: [
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatFormField,
    MatInput,
    FormsModule,
    MatDialogActions,
    MatButton,
  ],
})
export class RenameClassDialogComponent implements OnInit {
  dialogRef = inject<MatDialogRef<RenameClassDialogComponent>>(MatDialogRef);
  data = inject<RenameClassDialogData>(MAT_DIALOG_DATA);

  newName = '';

  ngOnInit(): void {
    this.newName = this.data.currentName;
  }

  save(): void {
    this.dialogRef.close(this.newName.trim());
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
