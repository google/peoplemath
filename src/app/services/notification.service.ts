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

import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ModalComponent } from '../modal/modal.component';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private snackbar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  notifyInfo(message: string): void {
    this.snackbar.open(message, '', { duration: 2000 });
  }

  notifyError(message: string, error?: unknown): void {
    console.error(message);
    console.error(error);
    const displayText =
      error === undefined ? '' : message + ': ' + JSON.stringify(error);
    this.dialog.open(ModalComponent, { data: displayText });
  }
}
