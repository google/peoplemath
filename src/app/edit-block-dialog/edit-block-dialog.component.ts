/**
 * Copyright 2021, 2023, 2025 Google LLC
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

import { Component, Inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
} from '@angular/material/dialog';
import { ImmutableObjective } from '../objective';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatSelectionList, MatListOption } from '@angular/material/list';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { MatButton } from '@angular/material/button';

export interface EditBlockDialogData {
  blockPlaceholder: ImmutableObjective;
  blocksBelow: ImmutableObjective[];
}

export enum BlockAction {
  Create = 'create',
  Split = 'split',
}

export interface EditBlockInstruction {
  action: BlockAction;
  downToIdx?: number;
}

@Component({
  selector: 'app-edit-block-dialog',
  templateUrl: './edit-block-dialog.component.html',
  styleUrls: ['./edit-block-dialog.component.css'],
  imports: [
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatSelectionList,
    FormsModule,
    NgFor,
    MatListOption,
    MatDialogActions,
    MatButton,
    NgIf,
  ],
})
export class EditBlockDialogComponent {
  selected: string[] = [];

  constructor(
    public dialogRef: MatDialogRef<
      EditBlockDialogComponent,
      EditBlockInstruction
    >,
    @Inject(MAT_DIALOG_DATA) public data: EditBlockDialogData
  ) {}

  createBlock(): void {
    if (this.selected.length === 0) {
      return;
    }
    this.dialogRef.close({
      action: BlockAction.Create,
      downToIdx: parseInt(this.selected[0]),
    });
  }

  splitBlock(): void {
    this.dialogRef.close({ action: BlockAction.Split });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
