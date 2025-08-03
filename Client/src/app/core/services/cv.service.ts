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

  addResume(Data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/add-cv`, Data);
  }

  getCvByUserEmail(userEmail: string): Observable<any[]> {
    const params = new HttpParams().set('userEmail', userEmail);
    return this.http.get<any[]>(`${this.apiUrl}/get-cv-by-userEmail`, { params });
  }

  deleteCv(id: string) {
    return this.http.delete(`${this.apiUrl}/delete-cv/${id}`);
  }


  triggerMatching(userEmail: string) {
    return this.http.post(`${this.apiUrl}/match`, { userEmail });
  }

}
