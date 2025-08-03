import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CvService } from '../core/services/cv.service';
import { User } from '../core/models/user.model';
import { AuthService } from '../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { OfferService } from '../core/services/offer.service';



@Component({
  selector: 'app-cvanalyzer',
  templateUrl: './cvanalyzer.component.html',
  styleUrls: ['./cvanalyzer.component.css']
})
export class CvanalyzerComponent implements OnInit {
  pdfSrc: SafeResourceUrl | null = null;
  isLoading: boolean = false;
  Resume: any = null; // data stored here
  current_user: User = null;
  activeTab: string = 'overview';
  my_saved_offers: any[] = [];
  message: string = '';

  hasFeedback: boolean = false;

  constructor(private sanitizer: DomSanitizer, private cvService: CvService,
    private authService: AuthService, private toastr: ToastrService,
    private offerService: OfferService) { }

  ngOnInit(): void {
    this.current_user = this.authService.getCurrentUser();


    this.cvService.getCvByUserEmail(this.current_user.email).subscribe(
      response => {
        try {
          this.Resume = response[0];
          console.log('✅ Resume data retrieved:', this.Resume);
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


    this.offerService.getOffersByUserEmail(this.current_user.email).subscribe((data) => {
      console.log('Received offers:', data);
      this.my_saved_offers = data;

      // Check if any offer has feedback
      this.hasFeedback = this.my_saved_offers.some(offer => offer.feedback && offer.feedback.trim() !== '');
    });


  }

  onFileSelected(event: any) {

    //delete Resume if existing
    if (this.Resume) {
      this.cvService.deleteCv(this.Resume._id).subscribe(
        response => {
          console.log('✅ Resume deleted successfully:', response);
        },
        error => {
          console.error('❌ Error deleting resume:', error);
        }
      );
    }


    this.isLoading = true;
    this.Resume = null; // Reset Resume data

    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      const blobUrl = URL.createObjectURL(file);
      this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);

      this.cvService.uploadResumeToBackend(file).subscribe(
        response => {

          try {
            console.log('Extacted XXXXXXXXXXXXXXXXXXXXXXXXXXXXXtext from pdf is:', response.summary);
            const jsonStr = response.summary.trim();

            // // Clean it if wrapped in markdown
            const cleanStr = jsonStr.replace(/^```json\n?/, '').replace(/\n?```$/, '');

            // // Parse the JSON string into an object
            const resumeData = JSON.parse(cleanStr);

            console.log('✅ Extracted internship data:', resumeData);

            this.Resume = resumeData;
            this.Resume.userEmail = this.current_user.email;


            // console.log('Internship data :', this.internship);
            this.isLoading = false;
            this.cvService.addResume(this.Resume).subscribe(
              response => {
                console.log('✅ Resume data saved successfully:', response);
                this.toastr.success('Resume data saved successfully!');
              },
              error => {
                console.error('❌ Error saving resume data:', error);
                this.toastr.error('Failed to save resume data.');
              }
            );

          } catch (e) {
            console.error('❌ Failed to parse JSON:', e);
            this.isLoading = false;

          }



        },
        error => {
          console.error('Error uploading PDF:', error);
        }
      );





    } else {
      alert('Please select a valid PDF file.');
      this.isLoading = false;
    }
  }



  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  getStrengthIcon(strength: string): string {
    if (strength.toLowerCase().includes('cloud')) return 'fas fa-cloud';
    if (strength.toLowerCase().includes('programming')) return 'fas fa-code';
    if (strength.toLowerCase().includes('network')) return 'fas fa-shield-alt';
    if (strength.toLowerCase().includes('database')) return 'fas fa-database';
    return 'fas fa-lightbulb';
  }

  getStrengthGradient(index: number): string {
    const gradients = [
      'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      'linear-gradient(135deg, #10b981, #059669)',
      'linear-gradient(135deg, #f59e0b, #d97706)',
      'linear-gradient(135deg, #ef4444, #dc2626)'
    ];
    return gradients[index % gradients.length];
  }




  runMatching() {
    this.isLoading = true;
    const userEmail = this.current_user.email;

    this.cvService.triggerMatching(userEmail).subscribe({
      next: (res: any) => {
        this.message = res.message || 'Matching completed successfully!';
        this.isLoading = false;

        this.offerService.getOffersByUserEmail(this.current_user.email).subscribe((data) => {
          console.log('Received offers:', data);
          this.my_saved_offers = data;

          // Check if any offer has feedback
          this.hasFeedback = this.my_saved_offers.some(offer => offer.feedback && offer.feedback.trim() !== '');
        });


      },
      error: (err) => {
        console.error(err);
        this.message = 'Error occurred during matching.';
        this.isLoading = false;
      }
    });
  }

  DeleteResume() {

    this.isLoading = true;
    if (this.Resume) {
      this.cvService.deleteCv(this.Resume._id).subscribe(
        response => {
          console.log('✅ Resume deleted successfully:', response);
          this.isLoading = false;
          this.Resume = null; // Reset Resume data
        },
        error => {
          console.error('❌ Error deleting resume:', error);
          this.isLoading = false;

        }
      );
    }


  }


}
