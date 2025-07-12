import { Component, OnInit } from '@angular/core';
import { OfferService } from '../core/services/offer.service';

@Component({
  selector: 'app-offer',
  templateUrl: './offer.component.html',
  styleUrls: ['./offer.component.css']
})
export class OfferComponent implements OnInit {
     internship: any = null;
isLoading: boolean = false;

  constructor(private offerService : OfferService) { }

  ngOnInit(): void {
  }


  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file: File = input.files[0];
    const fileType = file.type;


      this.isLoading = true;  // Start loading


    if (fileType === 'application/pdf') {
      this.handlePDF(file);
    } else if (fileType.startsWith('image/')) {
      this.handleImage(file);
    } else {
      console.warn('Unsupported file type:', fileType);
    }
  }

  handlePDF(file: File): void {
    console.log('Handling PDF:', file.name);
    this.offerService.uploadInternshipPDF(file).subscribe(
      response => {

        try {
        //console.log('Extacted XXXXXXXXXXXXXXXXXXXXXXXXXXXXXtext from pdf is:', response.summary);
        const jsonStr = response.summary.trim();

        // Clean it if wrapped in markdown
        const cleanStr = jsonStr.replace(/^```json\n?/, '').replace(/\n?```$/, '');

        // Parse the JSON string into an object
        const internshipData = JSON.parse(cleanStr);

        console.log('✅ Extracted internship data:', internshipData);

        // Now bind this to a property in your component
        this.internship = internshipData;
        console.log('Internship data :', this.internship);
              this.isLoading = false;  // ✅ Done loading

      } catch (e) {
        console.error('❌ Failed to parse JSON:', e);
              this.isLoading = false;  // ✅ Done loading

      }



      },
      error => {
        console.error('Error uploading PDF:', error);
      }
    );
  }

  handleImage(file: File): void {
    console.log('Handling Image:', file.name);
    this.offerService.uploadInternshipIMG(file).subscribe(
      response => {
        try {
        //console.log('Extacted XXXXXXXXXXXXXXXXXXXXXXXXXXXXXtext from pdf is:', response.summary);
        const jsonStr = response.summary.trim();

        // Clean it if wrapped in markdown
        const cleanStr = jsonStr.replace(/^```json\n?/, '').replace(/\n?```$/, '');

        // Parse the JSON string into an object
        const internshipData = JSON.parse(cleanStr);

        console.log('✅ Extracted internship data:', internshipData);

        // Now bind this to a property in your component
        this.internship = internshipData;
        console.log('Internship data :', this.internship);
              this.isLoading = false;  // ✅ Done loading

      } catch (e) {
        console.error('❌ Failed to parse JSON:', e);
              this.isLoading = false;  // ✅ Done loading

      }

      },
      error => {
        console.error('Error uploading IMG :', error);
              this.isLoading = false;  // ✅ Done loading

      }
    );
    // Your image handling logic
  }

}
