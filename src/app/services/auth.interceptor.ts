/*
 * Copyright 2020 Google LLC
 */

import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/internal/Observable';
import {from as observableFrom} from 'rxjs';
import {AuthService} from './auth.service';
import {switchMap} from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {
  }

  // TODO find alternative to disabling no-any and ts-ignore
  // @ts-ignore
  // tslint:disable-next-line:no-any
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return observableFrom(this.authService.getIdToken()).pipe(
      switchMap(token => {
        if (token != null) {
          const cloned = req.clone({
            headers: req.headers.set('Authorisation', 'Bearer ' + token)
          });
          console.log('HTTP REQUEST:', cloned);
          return next.handle(cloned);
        } else {
          console.log('Id token could not be retrieved');
          return next.handle(req);
        }
      })
    );
  }
}
