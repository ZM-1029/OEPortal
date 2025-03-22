import { ComponentFixture, TestBed } from "@angular/core/testing";

import { FileIconXlsComponent } from "./file-icon-xls.component";

describe("FileIconXlsComponent", () => {
  let component: FileIconXlsComponent;
  let fixture: ComponentFixture<FileIconXlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileIconXlsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FileIconXlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
