import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

declare interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
    isLogout?: boolean;
}
export const ROUTES: RouteInfo[] = [
  { path: '/dashboard', title: 'Dashboard',  icon: 'design_app', class: '' },
  { path: '/icons', title: 'Icons',  icon:'education_atom', class: '' },
  { path: '/maps', title: 'Maps',  icon:'location_map-big', class: '' },
  { path: '/notifications', title: 'Notifications',  icon:'ui-1_bell-53', class: '' },
  { path: '/table-list', title: 'Table List',  icon:'design_bullet-list-67', class: '' },
  { path: '/typography', title: 'Typography',  icon:'text_caps-small', class: '' },


  { path: '/offer', title: 'Offer extarctor',  icon:'business_briefcase-24', class: '' },
  { path: '/recent-offers', title: 'My Recent Offers',  icon:'arrows-1_refresh-69', class: '' },

  { path: '/user-profile', title: 'My Profile',  icon:'users_single-02', class: '' },
  { path: '', title: 'Logout',  icon:'media-1_button-power', class: 'active active-pro', isLogout: true }
];

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  menuItems: any[];

  constructor(private router : Router) { }

  ngOnInit() {
    this.menuItems = ROUTES.filter(menuItem => menuItem);
  }
  isMobileMenu() {
      if ( window.innerWidth > 991) {
          return false;
      }
      return true;
  };

  logout() {
    localStorage.removeItem('authToken');
    this.router.navigate(['/login']);
  }



}
