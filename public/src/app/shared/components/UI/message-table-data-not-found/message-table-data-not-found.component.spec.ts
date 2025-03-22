import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MessageTableDataNotFoundComponent } from "./message-table-data-not-found.component";

describe("MessageTableDataNotFoundComponent", () => {
  let component: MessageTableDataNotFoundComponent;
  let fixture: ComponentFixture<MessageTableDataNotFoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessageTableDataNotFoundComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MessageTableDataNotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
