import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SalaryBulkEditComponent } from "./salary-bulk-edit.component";

describe("SalaryBulkEditComponent", () => {
  let component: SalaryBulkEditComponent;
  let fixture: ComponentFixture<SalaryBulkEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalaryBulkEditComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SalaryBulkEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
