import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { User } from './user.model';
import * as firebase from 'firebase';
import { NotificationService} from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Should be null when logged out
  // When logged in, 'switchmap'(?) to Observable of user's profile in database
  user$: Observable<User>;

  constructor(
    private firebaseAuth: AngularFireAuth,
    private router: Router,
    private notificationService: NotificationService
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

  googleSignin() {
    const provider = new auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then(result => {
      this.notificationService.notification$.next('Sign-in successful.');
      this.router.navigate(['/']);
      return this.updateUserData(result.user);
    }).catch(error => {
      console.log(error);
      return error;
    });
  }

  signOut() {
    this.notificationService.notification$.next('Attempting to log out.');
    firebase.auth().signOut().then(result => {
      this.notificationService.notification$.next('Logout successful.');
      this.router.navigate(['/login']);
    }).catch(error => {
      console.log(error);
      this.notificationService.notification$.next('Logout unsuccessful, please try again.');
    });
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
