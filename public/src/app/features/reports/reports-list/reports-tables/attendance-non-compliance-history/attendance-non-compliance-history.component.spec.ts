import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AttendanceNonComplianceHistoryComponent } from "./attendance-non-compliance-history.component";

describe("AttendanceNonComplianceHistoryComponent", () => {
  let component: AttendanceNonComplianceHistoryComponent;
  let fixture: ComponentFixture<AttendanceNonComplianceHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttendanceNonComplianceHistoryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AttendanceNonComplianceHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
