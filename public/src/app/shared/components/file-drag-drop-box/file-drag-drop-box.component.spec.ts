import { ComponentFixture, TestBed } from "@angular/core/testing";

import { FileDragDropBoxComponent } from "./file-drag-drop-box.component";

describe("FileDragDropBoxComponent", () => {
  let component: FileDragDropBoxComponent;
  let fixture: ComponentFixture<FileDragDropBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileDragDropBoxComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FileDragDropBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
