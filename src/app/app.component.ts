// Copyright 2019, 2021-22 Google LLC
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

import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { NotificationService } from './services/notification.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ModalComponent } from './modal/modal.component';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { PageTitleService } from './services/pagetitle.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  constructor(
    public auth: AuthService,
    private notificationService: NotificationService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private titleService: Title,
    private pageTitleService: PageTitleService
  ) {
    this.notificationService.notification$.subscribe((message) => {
      this.snackBar.open(message, '', { duration: 2000 });
    });
    this.notificationService.error$.subscribe((message) => {
      this.dialog.open(ModalComponent, { data: message });
    });
    this.pageTitleService.title$.subscribe((title) =>
      this.titleService.setTitle(title)
    );
  }
}
