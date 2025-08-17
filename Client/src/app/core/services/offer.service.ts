import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ScraperSearchParams } from '../models/ScraperSearchParams.model';
import { JobInterface } from '../models/JobInterface.model';
export { JobInterface, ScraperSearchParams };


@Injectable({
  providedIn: 'root'
})
export class OfferService {

  constructor(private http: HttpClient) { }
  private apiUrl = 'https://backend-fetchtern.francecentral.cloudapp.azure.com/api'; // Your backend URL






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



  getAllOffers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/get-all-offers`);
  }

  getOffersByUserEmail(userEmail: string): Observable<any[]> {
    const params = new HttpParams().set('userEmail', userEmail);
    return this.http.get<any[]>(`${this.apiUrl}/get-offers-by-userEmail`, { params });
  }



  deleteOffer(id: string) {
    return this.http.delete(`${this.apiUrl}/delete-offer/${id}`);
  }


  generateCoverLetter(resume: any, offer: any): Observable<{ coverLetter: string }> {
    return this.http.post<{ coverLetter: string }>(
      `${this.apiUrl}/generate-cover-letter`,
      { resume, offer }
    );
  }


  addOffer(offerData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/add-offer`, offerData);
  }


  scrapeJobs(url: string): Observable<any[]> {
    return this.http.post<any[]>(`${this.apiUrl}/scrape-from-url`, { url });
  }


  scrapeLinkedInJobs(params: ScraperSearchParams): Observable<JobInterface[]> {
    return this.http.post<JobInterface[]>(`${this.apiUrl}/scrape-linkedin`, params);
  }


  scrapeTantiJobs(params: ScraperSearchParams): Observable<JobInterface[]> {
    return this.http.post<JobInterface[]>(`${this.apiUrl}/scrape-tanitjobs`, params);
  }

  scrapeKeeJob(params: ScraperSearchParams): Observable<JobInterface[]> {
    return this.http.post<JobInterface[]>(`${this.apiUrl}/scrape-keejob`, params);
  }

  scrapeIndeed(params: ScraperSearchParams): Observable<JobInterface[]> {
    return this.http.post<JobInterface[]>(`${this.apiUrl}/scrape-indeed`, params);
  }

  scrapeMonster(params: ScraperSearchParams): Observable<JobInterface[]> {
    return this.http.post<JobInterface[]>(`${this.apiUrl}/scrape-monster`, params);
  }




}
