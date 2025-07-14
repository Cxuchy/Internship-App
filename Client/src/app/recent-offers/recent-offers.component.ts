import { Component, OnInit } from '@angular/core';
import { OfferService } from '../core/services/offer.service';
import { ChangeDetectorRef } from '@angular/core';
import { Offer } from '../core/models/offer.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recent-offers',
  templateUrl: './recent-offers.component.html',
  styleUrls: ['./recent-offers.component.css']
})
export class RecentOffersComponent implements OnInit {



   allOffers: Offer[] = [];
  userOffers: Offer[] = [];

  constructor(private offerService: OfferService,private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadAllOffers();
    //this.loadOffersByUserId('123'); // to replace with actual user ID --> from token
  }

  loadAllOffers() {
  this.offerService.getAllOffers().subscribe(data => {
    this.allOffers = data;
    this.cdr.detectChanges(); // force update
    console.log('All offers loaded:', this.allOffers);
  });
}


  getOfferFields(offer: any): [string, any][] {
  return Object.entries(offer);
}


  /*
  loadOffersByUserId(userId: string) {
    this.offerService.getOffersByQuery({ userId }).subscribe(data => {
      this.userOffers = data;
    });
  }
    */



  isArray(value: any): boolean {
  return Array.isArray(value);
}

}
