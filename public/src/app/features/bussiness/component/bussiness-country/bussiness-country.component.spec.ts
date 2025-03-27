import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BussinessCountryComponent } from './bussiness-country.component';

describe('BussinessCountryComponent', () => {
  let component: BussinessCountryComponent;
  let fixture: ComponentFixture<BussinessCountryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BussinessCountryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BussinessCountryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
