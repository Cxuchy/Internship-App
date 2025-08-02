import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { User } from '../models/user.model';


export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  profilePicture?: string; // base64 or URL
}

export interface SignInData {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:3000/api'; // Your backend URL

  constructor(private http: HttpClient) { }

  signUp(user: SignUpData): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, user);
  }

  signIn(credentials: SignInData): Observable<any> {
    return this.http.post(`${this.apiUrl}/signin`, credentials);
  }

  saveToken(token: string) {
    localStorage.setItem('authToken', token);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout() {
    localStorage.removeItem('authToken');
  }


  getCurrentUser(): User | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded: any = jwtDecode(token);

      const user: User = {
        _id: decoded._id,
        email: decoded.email,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        dateOfBirth: decoded.dateOfBirth,
        profilePicture: decoded.profilePicture,
      };

      return user;
    } catch (error) {
      console.error('Invalid token:', error);
      return null;
    }
  }



  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }


  resetPassword(token: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password/${token}`, { password });
  }


  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    const token = localStorage.getItem('authToken');

    const headers = {
      Authorization: `Bearer ${token}`
    };

    return this.http.post(`${this.apiUrl}/change-password`, {
      oldPassword,
      newPassword
    }, { headers });
  }


}
