import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree {
    const token = localStorage.getItem('authToken');
    if (token) {
      // If token exists, allow navigation
      return true;
    } else {
      // If no token, redirect to login
      return this.router.parseUrl('/login');
    }
  }
}
