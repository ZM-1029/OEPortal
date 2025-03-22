import { ComponentFixture, TestBed } from "@angular/core/testing";

import { NonComplianceAttendanceComponent } from "./non-compliance-attendance.component";

describe("NonComplianceAttendanceComponent", () => {
  let component: NonComplianceAttendanceComponent;
  let fixture: ComponentFixture<NonComplianceAttendanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NonComplianceAttendanceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NonComplianceAttendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
