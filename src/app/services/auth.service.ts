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

import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {auth} from 'firebase/app';
import {Observable, BehaviorSubject} from 'rxjs';
import {User} from '../models/user.model';
import * as firebase from 'firebase';
import {NotificationService} from './notification.service';
import {environment} from '../../environments/environment';
import {AngularFireAuth} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  readonly user$ = new BehaviorSubject<User | null | undefined>(undefined);

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    public angularFireAuth: AngularFireAuth
  ) {
    if (environment.requireAuth) {
      angularFireAuth.onAuthStateChanged((firebaseUser: firebase.User | null) => {
        if (firebaseUser != null) {
          const user: User = {uid: firebaseUser.uid, displayName: firebaseUser.displayName};
          this.user$.next(user);
        } else {
          this.user$.next(null);
        }
      });
      }
  }

  googleSignin(): void {
    const provider = new auth.GoogleAuthProvider();
    this.angularFireAuth.signInWithPopup(provider).then((result: auth.UserCredential) => {
      const user = result.user;
      this.notificationService.notification$.next('Signed in as ' + user?.displayName);
      this.router.navigate(['/']);
      return this.updateUserData(user);
    }).catch(error => {
      this.notificationService.error$.next(error);
      return error;
    });
  }

  private updateUserData(firebaseUser: firebase.User | null): void {
    const user: User = {uid: firebaseUser?.uid};
    if (firebaseUser?.displayName != null) {
      user.displayName = firebaseUser?.displayName;
    }
    this.user$.next(user);
  }

  public getIdToken(): Observable<string | null> {
    return this.angularFireAuth.idToken;
  }

  public signOut(): void {
    this.angularFireAuth.signOut().then(() => {
      this.user$.next(null);
      this.router.navigate(['/login']);
    }).catch(error => {
      this.notificationService.error$.next(error);
    });
  }
}
