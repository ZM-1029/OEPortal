import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfSliderViewerComponent } from './pdf-slider-viewer.component';

describe('PdfSliderViewerComponent', () => {
  let component: PdfSliderViewerComponent;
  let fixture: ComponentFixture<PdfSliderViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdfSliderViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PdfSliderViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
