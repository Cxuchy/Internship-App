import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class CvService {

  constructor(private http: HttpClient) { }

   private apiUrl = 'http://localhost:3000/api'; // Your backend URL


   uploadResumeToBackend(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/extract-data-resume`, formData);
  }


}
