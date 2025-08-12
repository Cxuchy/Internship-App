import { Component, OnInit } from '@angular/core';
import { OfferService } from '../core/services/offer.service';
import { ChangeDetectorRef } from '@angular/core';
import { Offer } from '../core/models/offer.model';
import { CommonModule } from '@angular/common';

import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { User } from '../core/models/user.model';
import { AuthService } from '../core/services/auth.service';
import { CvService } from '../core/services/cv.service';

import { jsPDF } from 'jspdf';


@Component({
  selector: 'app-recent-offers',
  templateUrl: './recent-offers.component.html',
  styleUrls: ['./recent-offers.component.css']
})
export class RecentOffersComponent implements OnInit {

  searchTerm: string = '';
  userOffers: any[] = [];
  offers: any[] = [];
  current_user: User = null;
  Resume: any = null;

  generating_cover_letter: boolean = false;

  constructor(private offerService: OfferService, private cdr: ChangeDetectorRef,
     private authService: AuthService, private cvService: CvService) { }

  ngOnInit(): void {

    this.current_user = this.authService.getCurrentUser();


    this.offerService.getOffersByUserEmail(this.current_user.email).subscribe((data) => {
      //console.log('Received offers:', data);
      this.offers = data;
    });

    this.offers = this.offers.map(offer => ({
      ...offer,
      expanded: false
    }));


    this.cvService.getCvByUserEmail(this.current_user.email).subscribe(
      response => {
        try {
          this.Resume = response[0];
        } catch (e) {
        }
      },
      error => {
        console.error('Error uploading PDF:', error);
      }
    );


  }




  getOfferFields(offer: any): [string, any][] {
    return Object.entries(offer);
  }


  deleteOffer(id: any) {

    this.offerService.deleteOffer(id).subscribe({
      next: () => {
        //console.log('Offer deleted');
        // Remove the offer from local array or reload data
        this.offers = this.offers.filter(o => o._id !== id);

      },
      error: (err) => console.error('Delete failed', err)
    });



  }

  private excludedKeysExcel =
  [
    'img', '_id', '__v',
    'userEmail', 'Countrytext', 'Countrycode',
    'expanded','salaryMin','salaryMax',
    'matchScore','feedback','isStrongMatch'

  ];
  //to fix later , not fully implemented
  exportToExcel(): void {


    // Filter the keys from each offer
    const cleanedData = this.filteredOffers().map(offer => {
      const filteredOffer = {};
      Object.keys(offer).forEach(key => {
        if (!this.excludedKeysExcel.includes(key)) {
          filteredOffer[key] = offer[key];
        }
      });
      return filteredOffer;
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(cleanedData);
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Offers': worksheet },
      SheetNames: ['Offers']
    };

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    FileSaver.saveAs(blob, 'offers_export.xlsx');
  }



  private excludedKeys = ['company', 'location', 'img', 'title', '_id', '__v',
    'userEmail', 'Countrytext', 'Countrycode', 'expanded', 'source',
    'salaryMax', 'salaryMin', 'matchScore','feedback','isStrongMatch',
    'postedDate'

  ];

  getDisplayKeys(offer: any): string[] {
    return Object.keys(offer).filter(key =>
      !this.excludedKeys.includes(key)
    );
  }

  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  isUrl(value: any): boolean {
    if (typeof value !== 'string') return false;
    const urlPattern = /^(https?:\/\/|www\.)[^\s]+$/i;
    return urlPattern.test(value);
  }

  // Optional: Beautify field labels
  formatKey(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')   // split camelCase
      .replace(/_/g, ' ')           // underscores to space
      .replace(/\b\w/g, char => char.toUpperCase()); // capitalize
  }


  filteredOffers() {
    const term = this.searchTerm.toLowerCase();
    return this.offers.filter(offer =>
      (offer.title && offer.title.toLowerCase().includes(term)) ||
      (offer.company && offer.company.toLowerCase().includes(term)) ||
      (offer.location && offer.location.toLowerCase().includes(term))
    );
  }


  sortByDate(descending: boolean = true): void {
    this.offers.sort((a, b) => {
      const dateA = new Date(a.postedDate).getTime();
      const dateB = new Date(b.postedDate).getTime();
      return descending ? dateB - dateA : dateA - dateB;
    });
  }



   GenerateCoverLetter(resume: any, offer: any) {
    this.generating_cover_letter = true;
    this.offerService.generateCoverLetter(resume, offer).subscribe({
      next: (res) => {
        const coverLetter = res.coverLetter || res;

        // Create PDF
        const doc = new jsPDF();
        const margin = 10;
        const pageWidth = doc.internal.pageSize.getWidth() ;
        const text = doc.splitTextToSize(res.coverLetter, pageWidth);

        doc.setFont('Times', 'Normal');
        doc.setFontSize(12);
        doc.text(text, margin, 20);

        // Save as file
        doc.save(this.current_user.firstName + '_' + this.current_user.lastName + '_CoverLetter.pdf');

        this.generating_cover_letter = false;

      },
      error: (err) => console.error('Failed to generate a Cover Letter', err)
    });
  }


}
