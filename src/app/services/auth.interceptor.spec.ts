/*
 * Copyright 2020 Google LLC
 */

import {getTestBed, inject, TestBed} from '@angular/core/testing';

import { AuthInterceptor } from './auth.interceptor';
import {HTTP_INTERCEPTORS, HttpClient} from '@angular/common/http';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {StorageService} from '../storage.service';
import {RouterTestingModule} from '@angular/router/testing';
import {firebaseConfig} from '../../environments/firebaseConfig';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';



describe('AuthInterceptor', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([]),
        AngularFireModule.initializeApp(firebaseConfig.firebase, 'firebaseApp'),
        AngularFireAuthModule,
        HttpClientTestingModule
      ],
      providers: [
        StorageService,
        {
        provide: HTTP_INTERCEPTORS,
        useClass: AuthInterceptor,
        multi: true
      }]
    });
  });

  afterEach(inject([HttpTestingController], (mock: HttpTestingController) => {
    mock.verify();
  }));

  it('should add authentication header to http request',
    inject([HttpClient, HttpTestingController],
      (http: HttpClient, mock: HttpTestingController) => {

      http.get('/api/team/').subscribe(response => {
        console.log('RESPONSE:' + response);
        expect(response).toBeTruthy();
      }, error => {
        console.log('ERROR:' + error);
      });

      const request = mock.expectOne(req => (req.headers.has('Authentication')));
      request.flush({data: 'data'});
      mock.verify();
  }));
});
