import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class OfferService {

  constructor(private http: HttpClient) { }
  private apiUrl = 'http://localhost:3000/api'; // Your backend URL



  uploadInternshipPDF(file: File): Observable<any> {
  const formData = new FormData();
  formData.append('file', file);
  return this.http.post(`${this.apiUrl}/extract-offer-pdf`, formData);
}


uploadInternshipIMG(file: File): Observable<any> {
  const formData = new FormData();
  formData.append('file', file);
  return this.http.post(`${this.apiUrl}/extract-offer-img`, formData);
}




}
