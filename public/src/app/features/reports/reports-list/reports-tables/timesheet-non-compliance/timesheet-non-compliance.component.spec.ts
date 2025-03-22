import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetNonComplianceComponent } from './timesheet-non-compliance.component';

describe('TimesheetNonComplianceComponent', () => {
  let component: TimesheetNonComplianceComponent;
  let fixture: ComponentFixture<TimesheetNonComplianceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimesheetNonComplianceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimesheetNonComplianceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
