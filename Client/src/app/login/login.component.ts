import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { GoogleAuthService } from '../core/services/google-auth.service';

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
    dateOfBirth: '',
    profilePicture: '' // base64 or URL
  };

  confirmPassword: string = '';
  errorMessage: string = '';




  constructor(private authService: AuthService, private router: Router, private http: HttpClient,
    private googleAuthService: GoogleAuthService
  ) { }
  ngOnInit(): void {
    this.activeTab = 'signin';
    //console.log('Login component initialized with activeTab:', this.activeTab);


  }

   loginWithGoogle() {
        this.googleAuthService.signIn().then((user) => {
            console.log('User Info:', user);
            console.log('User email is:', user.email);

        });
    }


  onSignIn() {
    this.errorMessage = '';
    this.authService.signIn(this.signInData)
      .subscribe({
        next: (res) => {
          //console.log('Sign In Success', res);
          this.authService.saveToken(res.token);
          //console.log('Token stored now :', res.token);
          this.router.navigate(['/']);

        },
        error: (err) => {
          this.errorMessage = 'Sign in failed';
        }
      });
  }

  onSignUp() {
    this.errorMessage = '';

    if (this.signUpData.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      console.log(this.errorMessage);
    }
    else {
      this.authService.signUp(this.signUpData)
        .subscribe({
          next: (res) => {
            // Handle successful sign up (e.g., redirect)
            //console.log('Sign Up Success', res);
            this.activeTab = 'signin'; // Switch to sign in tab after successful sign up
            this.signInData.email = this.signUpData.email; // Pre-fill email for sign
          },
          error: (err) => {
            this.errorMessage = 'Sign up failed';
          }
        });
    }
  }

  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        //console.log('Selected image path:', file.name);
      };
      reader.readAsDataURL(file);

      this.signUpData.profilePicture = file.name
      //console.log('Profile picture selected:', this.signUpData.profilePicture);

    }
  }

  switchTab() {
    this.activeTab = this.activeTab === 'signin' ? 'signup' : 'signin';
    this.errorMessage = ''; // Clear any existing error messages
  }

}

