/**
 * Copyright 2020-2021, 2023 Google LLC
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

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  public notification$: Subject<string> = new Subject<string>();
  public error$: Subject<string> = new Subject<string>();

  notifyInfo(message: string): void {
    this.notification$.next(message);
  }

  notifyError(message: string, error?: unknown): void {
    console.error(message);
    console.error(error);
    if (error === undefined) {
      this.error$.next(message);
    } else {
      this.error$.next(message + ': ' + JSON.stringify(error));
    }
  }
}
