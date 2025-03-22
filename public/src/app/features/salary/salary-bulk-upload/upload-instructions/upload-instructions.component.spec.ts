import { ComponentFixture, TestBed } from "@angular/core/testing";

import { UploadInstructionsComponent } from "./upload-instructions.component";

describe("UploadInstructionsComponent", () => {
  let component: UploadInstructionsComponent;
  let fixture: ComponentFixture<UploadInstructionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadInstructionsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UploadInstructionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
