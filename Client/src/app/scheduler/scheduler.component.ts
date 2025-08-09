import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import { User } from '../core/models/user.model';

@Component({
  selector: 'app-scheduler',
  templateUrl: './scheduler.component.html',
  styleUrls: ['./scheduler.component.css']
})
export class SchedulerComponent implements OnInit {

  constructor(private http: HttpClient, private authService: AuthService) { }
  current_user: User = null;
  jobLogs: any[] = [];

  formData = {
    frequency: '0 0 * * *',
    website: 'LinkedIn',
    keywords: ''
  };
  ngOnInit(): void {

    this.current_user = this.authService.getCurrentUser();


    this.authService.getJobLogs(this.current_user._id).subscribe(res => {
      this.jobLogs = res.jobLogs;
      //console.log("xxxxxxxxxxxxxxxxxxxxx"+res.jobLogs);
    });

  }



  onSaveSchedule() {
    if (!this.current_user || !this.current_user._id) {
      console.error('User ID is missing!');
      return;
    }
    console.log('Scheduling with data:', this.formData);

    this.authService.updateUserKeywordAndSchedule(
      this.current_user._id,
      this.formData.keywords,
      this.formData.frequency
    ).subscribe(
      response => {
        console.log('Schedule saved successfully:', response);





      },
      error => {
        console.error('Error saving schedule:', error);
      }
    );
  }



  removeSchedule() {
    console.log('Running job now with:', this.formData);
    this.authService.removeSchedule(this.current_user._id).subscribe(
      response => {
        console.log('Schedule removed successfully:', response);
        this.jobLogs = [];
      }
      , error => {
        console.error('Error removing schedule:', error);
      }
    );
  }

}
