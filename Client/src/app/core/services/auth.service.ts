import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


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

  constructor(private http: HttpClient) {}

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


}
