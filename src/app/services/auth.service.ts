import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {auth} from 'firebase/app';
import {Observable} from 'rxjs';
import {User} from '../models/user.model';
import * as firebase from 'firebase';
import {NotificationService} from './notification.service';
import {of} from 'rxjs/internal/observable/of';
import {firebaseConfig} from '../../environments/firebaseConfig';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<User | null>;

  constructor(
    private router: Router,
    private notificationService: NotificationService
  ) {
    if (environment.requireAuth) {
      console.log('initialisation:' + firebase.initializeApp(firebaseConfig.firebase).name);
      firebase.apps.forEach(app => {console.log('FIREBASE APP:\n' + app.name); }); // debug
      const firebaseUser = firebase.auth().currentUser;
      if (firebaseUser == null) {
        this.user$ = of(null);
      } else {
        const user: User = {uid: firebaseUser.uid, displayName: firebaseUser.displayName};
        this.user$ = of(user);
      }
    } else {
      this.user$ = of(null);
    }
  }

  googleSignin(): void {
    firebase.apps.forEach(app => {console.log('FIREBASE APP:\n' + app.name); }); // debug
    const provider = new auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then(result => {
      const user = result.user;
      if (user == null) {
        throw new Error('User is null');
      } else {
        this.notificationService.notification$.next('Signed in as ' + user.displayName);
        this.router.navigate(['/']);
        return this.updateUserData(user);
      }
    }).catch(error => {
      console.log(error);
      return error;
    });
  }

  private updateUserData(firebaseUser: firebase.User): void {
    const user: User = {uid: firebaseUser.uid};
    if (firebaseUser.displayName != null) {
      user.displayName = firebaseUser.displayName;
    }
    this.user$ = of(user);
  }

  async getIdToken(): Promise<string | null> {
    console.log('Getting ID token');
    firebase.apps.forEach(app => {console.log('FIREBASE APP:\n' + app.name); }); // debug
    const currentUser = await firebase.auth().currentUser;
    if (currentUser != null) {
      return currentUser.getIdToken();
    }
    return null;
  }

  signOut() {
    firebase.auth().signOut().then(result => {
      this.user$ = of(null);
      this.router.navigate(['/login']);
    }).catch(error => {
      console.log('Sign out error: ', error);
    });
  }
}
