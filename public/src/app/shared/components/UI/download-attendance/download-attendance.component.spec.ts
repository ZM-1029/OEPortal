import { ComponentFixture, TestBed } from "@angular/core/testing";

import { DownloadAttendanceComponent } from "./download-attendance.component";

describe("DownloadAttendanceComponent", () => {
  let component: DownloadAttendanceComponent;
  let fixture: ComponentFixture<DownloadAttendanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DownloadAttendanceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DownloadAttendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
