/*
 * Copyright 2020 Google LLC
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
      switchMap(token => {
        if (token != null) {
          const cloned = req.clone({
            headers: req.headers.set('Authentication', 'Bearer ' + token)
          });
          return next.handle(cloned);
        } else {
          return next.handle(req);
        }
      })
    ); } else {
      return next.handle(req);
    }
  }
}
