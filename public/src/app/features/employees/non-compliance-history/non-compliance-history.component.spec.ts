import { ComponentFixture, TestBed } from "@angular/core/testing";

import { NonComplianceHistoryComponent } from "./non-compliance-history.component";

describe("NonComplianceHistoryComponent", () => {
  let component: NonComplianceHistoryComponent;
  let fixture: ComponentFixture<NonComplianceHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NonComplianceHistoryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NonComplianceHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
