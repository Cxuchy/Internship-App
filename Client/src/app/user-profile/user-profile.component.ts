import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import { User } from '../core/models/user.model';
import { ToastrService } from 'ngx-toastr'; // Optional for notifications
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {

  passwordData = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  constructor(private authService: AuthService, private http: HttpClient, private toastr: ToastrService) { }

  current_user: User = null;
  ngOnInit() {
    this.current_user = this.authService.getCurrentUser();
  }



  changePassword() {
    this.authService.changePassword(
      this.passwordData.oldPassword,
      this.passwordData.newPassword
    ).subscribe({
      next: res => {
        this.toastr.success('Password changed successfully');
      },
      error: err => {
        this.toastr.error(err.error.message || 'Password change failed');
      }
    });
  }

}
