import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentOffersComponent } from './recent-offers.component';

describe('RecentOffersComponent', () => {
  let component: RecentOffersComponent;
  let fixture: ComponentFixture<RecentOffersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecentOffersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecentOffersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
