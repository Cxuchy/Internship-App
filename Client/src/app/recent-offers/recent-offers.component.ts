import { Component, OnInit } from '@angular/core';
import { OfferService } from '../core/services/offer.service';
import { ChangeDetectorRef } from '@angular/core';
import { Offer } from '../core/models/offer.model';
import { CommonModule } from '@angular/common';

import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';



@Component({
  selector: 'app-recent-offers',
  templateUrl: './recent-offers.component.html',
  styleUrls: ['./recent-offers.component.css']
})
export class RecentOffersComponent implements OnInit {



  //allOffers: any[] = [];
  userOffers: any[] = [];
  offers: Offer[] = [];

  constructor(private offerService: OfferService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.offerService.getAllOffers().subscribe((data) => {
      console.log('Received offers:', data);
      this.offers = data;
    });

    this.offers = this.offers.map(offer => ({
      ...offer,
      expanded: false // initially collapsed
    }));
  }




  getOfferFields(offer: any): [string, any][] {
    return Object.entries(offer);
  }


  deleteOffer(id: any) {

    this.offerService.deleteOffer(id).subscribe({
      next: () => {
        console.log('Offer deleted');
        // Remove the offer from local array or reload data
        this.offers = this.offers.filter(o => o._id !== id);

      },
      error: (err) => console.error('Delete failed', err)
    });



  }

  /*
  loadOffersByUserId(userId: string) {
    this.offerService.getOffersByQuery({ userId }).subscribe(data => {
      this.userOffers = data;
    });
  }
    */






  exportToExcel(): void {
  const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.offers);
  const workbook: XLSX.WorkBook = {
    Sheets: { 'Offers': worksheet },
    SheetNames: ['Offers']
  };
  const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  FileSaver.saveAs(blob, 'offers_export.xlsx');
}


}
