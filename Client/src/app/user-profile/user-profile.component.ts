import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import { User } from '../core/models/user.model';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {

  constructor(private authService : AuthService) { }

  current_user : User = null;
  ngOnInit() {
    this.current_user = this.authService.getCurrentUser();
  }

}
