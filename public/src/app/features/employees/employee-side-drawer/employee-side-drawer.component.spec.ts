import { ComponentFixture, TestBed } from "@angular/core/testing";

import { EmployeeSideDrawerComponent } from "./employee-side-drawer.component";

describe("EmployeeSideDrawerComponent", () => {
  let component: EmployeeSideDrawerComponent;
  let fixture: ComponentFixture<EmployeeSideDrawerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeSideDrawerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeSideDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
