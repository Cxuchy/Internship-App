import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.css']
})
export class ForgetPasswordComponent implements OnInit {

  constructor(private authService : AuthService) { }

  email: string = '';
  isSubmitted: boolean = false;
  ngOnInit(): void {
  }

  onSubmit() {
    console.log("Email:", this.email);
  this.authService.forgotPassword(this.email).subscribe({
    next: () => {
      //alert('Check your email for a reset link')
      this.isSubmitted = true;

    },
    error: (err) => alert('Failed to send reset link')
  });
}

}
