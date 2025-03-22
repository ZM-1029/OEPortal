import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SalaryUploadComponent } from "./salary-upload.component";

describe("SalaryUploadComponent", () => {
  let component: SalaryUploadComponent;
  let fixture: ComponentFixture<SalaryUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalaryUploadComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SalaryUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
