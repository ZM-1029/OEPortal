import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPdfComponent } from './add-pdf.component';

describe('AddPdfComponent', () => {
  let component: AddPdfComponent;
  let fixture: ComponentFixture<AddPdfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddPdfComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddPdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
