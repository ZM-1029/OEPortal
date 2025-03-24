import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EfficiencyReportCustomersComponent } from './efficiency-report-customers.component';

describe('EfficiencyReportCustomersComponent', () => {
  let component: EfficiencyReportCustomersComponent;
  let fixture: ComponentFixture<EfficiencyReportCustomersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EfficiencyReportCustomersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EfficiencyReportCustomersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
