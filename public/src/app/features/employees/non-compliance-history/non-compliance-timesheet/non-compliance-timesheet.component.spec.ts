import { ComponentFixture, TestBed } from "@angular/core/testing";

import { NonComplianceTimesheetComponent } from "./non-compliance-timesheet.component";

describe("NonComplianceTimesheetComponent", () => {
  let component: NonComplianceTimesheetComponent;
  let fixture: ComponentFixture<NonComplianceTimesheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NonComplianceTimesheetComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NonComplianceTimesheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
