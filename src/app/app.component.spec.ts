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

import { TestBed, inject, waitForAsync } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { RouterTestingModule } from '@angular/router/testing';
import { StorageService } from './storage.service';
import { MaterialModule } from './material/material.module';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { firebaseConfig } from '../environments/firebaseConfig';
import { AuthService } from './services/auth.service';
describe('AppComponent', () => {
  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [AppComponent],
        imports: [
          RouterTestingModule,
          MaterialModule,
          AngularFireModule.initializeApp(
            firebaseConfig.firebase,
            'firebaseApp'
          ),
          AngularFireAuthModule,
        ],
        providers: [StorageService],
      }).compileComponents();
    })
  );

  it(
    'should create the app',
    waitForAsync(() => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.debugElement.componentInstance;
      expect(app).toBeTruthy();
    })
  );

  it(
    'should render title in a h1 tag',
    waitForAsync(() => {
      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      const compiled = fixture.debugElement.nativeElement;
      expect(compiled.querySelector('h1').textContent).toContain('PeopleMath');
    })
  );

  it(
    'should not show log out button if no user is logged in',
    waitForAsync(
      inject([AuthService], (auth: AuthService) => {
        const fixture = TestBed.createComponent(AppComponent);
        fixture.detectChanges();
        const compiled = fixture.debugElement.nativeElement;
        auth.user$.subscribe((user) => {
          if (!user) {
            expect(compiled.querySelector('#logout-button')).toBe(null);
          }
        });
      })
    )
  );
});
