import { Component, OnInit } from '@angular/core';
import { OfferService, ScraperSearchParams } from '../core/services/offer.service';
import { AuthService } from '../core/services/auth.service';
import { User } from '../core/models/user.model';
import { JobInterface } from '../core/models/JobInterface.model';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-offer',
  templateUrl: './offer.component.html',
  styleUrls: ['./offer.component.css']
})
export class OfferComponent implements OnInit {
  internship: any = null;
  isLoading: boolean = false;
  submitted = false;



  constructor(private offerService: OfferService, private authService: AuthService,private toastr: ToastrService) { }


  jobUrl: string = '';
  current_user: User = null;


  searchParams: ScraperSearchParams = {
    searchSite: '',
    searchText: '',
    locationText: '',
    pageNumber: 0
  };

  results: JobInterface[] = [];


  ngOnInit(): void {
    this.current_user = this.authService.getCurrentUser();
    console.log('Current email:', this.current_user.email);
  }

  showNotification(from, align){
        this.toastr.info('<span class="now-ui-icons ui-1_bell-53"></span> Added the Offer <b>To your offers</b>.', '', {
           timeOut: 8000,
           closeButton: true,
           enableHtml: true,
           toastClass: "alert alert-warning alert-with-icon",
           positionClass: 'toast-' + from + '-' +  align
         });

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

          //console.log('✅ Extracted internship data:', internshipData);

          this.internship = internshipData;
          this.internship.userEmail = this.current_user.email;
                    this.internship.source = 'Via Upload';


          console.log('Internship data :', this.internship);
          this.isLoading = false;

        } catch (e) {
          console.error('❌ Failed to parse JSON:', e);
          this.isLoading = false;

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

          const internshipData = JSON.parse(cleanStr);

          console.log('✅ Extracted internship data:', internshipData);

          this.internship = internshipData;
          this.internship.userEmail = this.current_user.email;
          this.internship.source = 'Via Upload';

          console.log('Internship data :', this.internship);
          this.isLoading = false;

        } catch (e) {
          console.error('❌ Failed to parse JSON:', e);
          this.isLoading = false;

        }

      },
      error => {
        console.error('Error uploading IMG :', error);
        this.isLoading = false;

      }
    );
  }




  addJob() {
    if (this.internship != null) {
      this.offerService.addOffer(this.internship).subscribe(
        response => {
          console.log('Offer added successfully:', response);
          this.internship = null;
          this.showNotification('bottom','right');
        },
        error => {
          console.error('Error adding offer:', error);
        }
      );
    }
  }

  addScappedJob(job: JobInterface) {

    (job as any).userEmail = this.current_user.email;
    (job as any).source = 'Via Web(LinkedIn/Tanitjobs...)';

    console.log('Adding scraped job:', job);
    if (job != null) {
      this.offerService.addOffer(job).subscribe(
        response => {
          console.log('job added successfully:', response);
          this.showNotification('bottom','right');

        },
        error => {
          console.error('Error adding job:', error);
        }
      );
    }
  }




  onSubmitUrl(event: Event): void {
    event.preventDefault();

    if (!this.jobUrl) {
      alert('Please enter a valid job offer URL.');
      return;
    }

    console.log('Submitted URL:', this.jobUrl);
    this.scrapeJobs();

  }

  scrapeJobs() {

    this.offerService.scrapeJobs(this.jobUrl).subscribe({
      next: (data) => {
        console.log('Scraped job results:', data);
        this.results = data;
      },
      error: (err) => console.error('Scraping error:', err)
    });


  }


  onSubmitForScraping() {
    this.isLoading = false;
    this.isLoading = true;
    this.submitted = true;


    if (this.searchParams.searchSite === 'LinkedIn') {
      this.offerService.scrapeLinkedInJobs(this.searchParams).subscribe({
        next: (data) => {
          this.results = data;
          console.log('Scraped jobs:', data);
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Scraping error:', err);
          this.isLoading = false;

        }
      });
    }
    else if (this.searchParams.searchSite === 'Indeed') {

    }
    else if (this.searchParams.searchSite === 'Monster') {

    }
    else if (this.searchParams.searchSite === 'Tanitjobs')  //scrapeOps -> cloudFlare prevention
    {
      this.offerService.scrapeTantiJobs(this.searchParams).subscribe({
        next: (data) => {
          this.results = data;
          console.log('Scraped jobs :', data);
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Scraping error:', err);
          this.isLoading = false;

        }
      });
    }
  }


}

