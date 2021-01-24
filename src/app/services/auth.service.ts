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
import firebase from 'firebase/app';
import 'firebase/auth';
import {AngularFireAuth} from '@angular/fire/auth';
import {Observable, BehaviorSubject} from 'rxjs';
import {User} from '../models/user.model';
import {NotificationService} from './notification.service';
import {environment} from '../../environments/environment';

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
        this.updateUserData(firebaseUser);
      });
      }
  }

  getDomain(email: string): string {
    const emailParts: string[] = email.split('@');
    return emailParts[emailParts.length - 1];
  }

  googleSignin(): void {
    const provider = new firebase.auth.GoogleAuthProvider();
    this.angularFireAuth.signInWithPopup(provider).then((result: firebase.auth.UserCredential) => {
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
    if (firebaseUser !== null && firebaseUser.email !== null) {
      const user: User = {email: firebaseUser.email, domain: this.getDomain(firebaseUser.email)};
      if (firebaseUser.displayName !== null) {
        user.displayName = firebaseUser.displayName;
      }
      this.user$.next(user);
    } else {
      this.user$.next(null);
    }
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
