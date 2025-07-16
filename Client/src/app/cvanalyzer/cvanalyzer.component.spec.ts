import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CvanalyzerComponent } from './cvanalyzer.component';

describe('CvanalyzerComponent', () => {
  let component: CvanalyzerComponent;
  let fixture: ComponentFixture<CvanalyzerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CvanalyzerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CvanalyzerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
