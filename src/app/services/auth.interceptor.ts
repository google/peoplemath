/**
 * Copyright 2020 Google LLC
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

import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/internal/Observable';
import {from as observableFrom} from 'rxjs';
import {AuthService} from './auth.service';
import {switchMap} from 'rxjs/operators';
import {environment} from '../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {
  }

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (environment.requireAuth) {
      return this.authService.getIdToken().pipe(
        switchMap((token: string | null) => {
          if (token != null) {
            const cloned = req.clone({
              headers: req.headers.set('Authentication', 'Bearer ' + token)
            });
            return next.handle(cloned);
          } else {
            return next.handle(req);
          }
        })
      );
    } else {
      return next.handle(req);
    }
  }
}
