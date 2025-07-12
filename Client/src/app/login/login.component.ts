import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  activeTab: 'signin' | 'signup' = 'signin';

  signInData = {
    email: '',
    password: ''
  };

  signUpData = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    dateOfBirth : '',
    //profilePicture: '' // base64 or URL
  };

  confirmPassword: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService) {}
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  onSignIn() {
    this.errorMessage = '';
    this.authService.signIn(this.signInData)
      .subscribe({
        next: (res) => {
          // Handle successful sign in (e.g., redirect)
          console.log('Sign In Success', res);
          this.authService.saveToken(res.token); // Assuming the response contains a token
          console.log('Token stored now :', res.token);
        },
        error: (err) => {
          this.errorMessage = 'Sign in failed';
        }
      });
  }

  onSignUp() {
    this.errorMessage = '';

    if(this.signUpData.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      console.log(this.errorMessage);
    }
    else
    {
      this.authService.signUp(this.signUpData)
      .subscribe({
        next: (res) => {
          // Handle successful sign up (e.g., redirect)
          console.log('Sign Up Success', res);
        },
        error: (err) => {
          this.errorMessage = 'Sign up failed';
        }
      });
    }


  }
}
