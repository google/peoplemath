import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { User } from './user.model';
import * as firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<User>;

  constructor(
    private firebaseAuth: AngularFireAuth,
    private router: Router
  ) {
    // @ts-ignore
    this.user$ = this.firebaseAuth.authState;
  }

  async googleSignin() {
    const provider = new auth.GoogleAuthProvider();
    // const credential = await this.firebaseAuth.auth.signInWithPopup(provider);
    firebase.auth().signInWithPopup(provider).then(result => {
      const user = result.user;
      // @ts-ignore
      return this.updateUserData( user);
    }).catch(error => {
      const errorCode = error.code;
      const errorMessage = error.message;
      const email = error.email;
      const credential = error.credentials;
      console.log(error);
    });
  }

  async signOut() {
    await firebase.auth().signOut();
    return this.router.navigate(['/']);
  }

  private updateUserData({user}: { user: any }) {
    console.log(user);
  }
}
