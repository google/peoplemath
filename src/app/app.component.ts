// Copyright 2019, 2021-23, 2025 Google LLC
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

import { Component, inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Title } from '@angular/platform-browser';
import { PageTitleService } from './services/pagetitle.service';
import {
  MatSidenavContainer,
  MatSidenavContent,
} from '@angular/material/sidenav';
import { MatToolbar } from '@angular/material/toolbar';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatButton, MatAnchor } from '@angular/material/button';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [
    MatSidenavContainer,
    MatSidenavContent,
    MatToolbar,
    RouterLink,
    MatButton,
    MatAnchor,
    RouterOutlet,
  ],
})
export class AppComponent {
  private titleService = inject(Title);
  private pageTitleService = inject(PageTitleService);
  public auth = inject(AuthService);
  public user = toSignal(this.auth.user$);

  constructor() {
    this.pageTitleService.title$.subscribe((title) =>
      this.titleService.setTitle(title)
    );
  }
}
