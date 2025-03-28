import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SalaryListComponent } from "./salary-list.component";

describe("SalaryListComponent", () => {
  let component: SalaryListComponent;
  let fixture: ComponentFixture<SalaryListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalaryListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SalaryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
