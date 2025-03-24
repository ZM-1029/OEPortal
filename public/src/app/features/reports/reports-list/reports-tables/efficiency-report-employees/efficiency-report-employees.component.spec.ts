import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EfficiencyReportEmployeesComponent } from './efficiency-report-employees.component';

describe('EfficiencyReportEmployeesComponent', () => {
  let component: EfficiencyReportEmployeesComponent;
  let fixture: ComponentFixture<EfficiencyReportEmployeesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EfficiencyReportEmployeesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EfficiencyReportEmployeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
