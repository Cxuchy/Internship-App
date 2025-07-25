import { Injectable } from '@angular/core';
import { gapi } from 'gapi-script';


@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {

  private clientId = '600401080456-1bfbul26i21vqusfh3hq3flqpvvvgjbe.apps.googleusercontent.com';

  constructor() {
    gapi.load('auth2', () => {
      gapi.auth2.init({
        client_id: this.clientId,
        scope: 'profile email',
      });
    });
  }

  signIn(): Promise<any> {
    const auth2 = gapi.auth2.getAuthInstance();
    return auth2.signIn().then((user) => {
      const profile = user.getBasicProfile();
      return {
        id: profile.getId(),
        given_name: profile.getGivenName(),
        family_name: profile.getFamilyName(),
        email: profile.getEmail(),
        imageUrl: profile.getImageUrl(),
        idToken: user.getAuthResponse().id_token,
      };
    });
  }
}
