import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {auth} from 'firebase/app';
import {AngularFireAuth} from '@angular/fire/auth';
import {Observable} from 'rxjs';
import {User} from './user.model';
import * as firebase from 'firebase';
import {NotificationService} from './notification.service';
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
    private router: Router,
    private notificationService: NotificationService
  ) {
    // @ts-ignore
    this.user$ = this.firebaseAuth.authState;
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

  private updateUserData(user: firebase.User | null) {
    if (user !== null) {
      const userData = {
        uid: user.uid,
        displayName: user.displayName
      };
      if (this.authenticateUserOnServer()) {
        this.user$ = of({uid: user.uid});
      } else {
        // LOG OUT USER
      }
      console.log('User data: ', userData);
    } else {
      console.log('user passed was null.');
    }
  }

  async getIdToken(): Promise<string | null> {
    const currentUser = await firebase.auth().currentUser;
    if (currentUser != null) {
      return currentUser.getIdToken();
    }
    return null;
  }

  private authenticateUserOnServer() {
    // Decode token on backend
    // Check with users on backend
    // Return whether user is authenticated
    // Store user on server side?
    // -> quicker authentication by only confirming uid rather than searching for user?
  return false;
  }

  signOut() {
    this.notificationService.notification$.next('Attempting to log out.');
    firebase.auth().signOut().then(result => {
      this.notificationService.notification$.next('Logout successful.');
      this.router.navigate(['/login']);
    }).catch(error => {
      console.log('Sign out error: ', error);
      this.notificationService.notification$.next('Logout unsuccessful, please try again.');
    });
  }
}
