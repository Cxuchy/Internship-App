import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  newpassword: string = '';
  confirmpassword: string = '';
  token: string = '';
  isSubmitted: boolean = false;

  constructor(private route: ActivatedRoute, private authService: AuthService) { }

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token')!;

  }

  onSubmit() {
    if (this.newpassword !== this.confirmpassword) {
      alert('Passwords do not match');
      return;
    }

    this.authService.resetPassword(this.token, this.newpassword).subscribe({
      next: () => {
        this.isSubmitted = true;
      }
    });
  }
}

