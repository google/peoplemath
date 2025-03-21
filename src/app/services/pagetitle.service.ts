/**
 * Copyright 2022-23 Google LLC
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

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/*
 * The guide says not to use the browser-platform-specific Title service outside the root component:
 * https://angular.io/guide/set-document-title
 * This service abstracts it away.
 */
@Injectable({
  providedIn: 'root',
})
export class PageTitleService {
  public title$ = new Subject<string>();

  public setPageTitle(newTitle: string): void {
    this.title$.next('PeopleMath: ' + newTitle);
  }
}
