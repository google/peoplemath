import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { User } from './user.model';
import * as firebase from 'firebase';
import {switchMap} from 'rxjs/operators';
import {of} from 'rxjs/internal/observable/of';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Should be null when logged out
  // When logged in, 'switchmap'(?) to Observable of user's profile in database
  user$: Observable<User>;

  constructor(
    private firebaseAuth: AngularFireAuth,
    private router: Router
  ) {
    // @ts-ignore
    this.user$ = this.firebaseAuth.authState;
      /*.pipe(
      switchMap(user => {
          // Logged in
        if (user) {
          return user;
        } else {
          // Logged out
          return of(null);
        }
      })
    );*/
  }

  async googleSignin() {
    const provider = new auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then(result => {
      this.router.navigate(['/']);
      return this.updateUserData(result.user);
    }).catch(error => {
      console.log(error);
      return error;
    });
  }

  async signOut() {
    await firebase.auth().signOut();
    return this.router.navigate(['/login']);
  }

  private updateUserData(user: firebase.User | null) {
    // const userRef: AngularFirestoreDocument<User> = this.afs.doc('users/${user.uid}');
    if (user !== null) {
      const userData = {
        uid: user.uid,
        displayName: user.displayName
      };
      console.log(userData);
    } else {
      console.log('user passed was null.');
    }

// firebase.login().currentUser.getIdToken(/* forceRefresh */ true).then(function(idToken) {
    // Send token to your backend via HTTPS
    // ...
// }).catch(function(error) {
    // Handle error
// });
  }
}
