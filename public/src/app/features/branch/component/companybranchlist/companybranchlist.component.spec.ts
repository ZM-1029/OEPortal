import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanybranchlistComponent } from './companybranchlist.component';

describe('CompanybranchlistComponent', () => {
  let component: CompanybranchlistComponent;
  let fixture: ComponentFixture<CompanybranchlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanybranchlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanybranchlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
