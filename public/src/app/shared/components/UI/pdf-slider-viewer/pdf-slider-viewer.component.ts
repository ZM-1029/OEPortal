import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CarouselModule } from 'ngx-owl-carousel-o';
import * as pdfjsLib from 'pdfjs-dist';
import { MarketingService } from 'src/app/features/marketing/marketing.service';

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = 
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${(pdfjsLib as any).version}/pdf.worker.min.js`;

@Component({
  selector: 'app-pdf-slider-viewer',
  imports: [CommonModule, CarouselModule],
  templateUrl: './pdf-slider-viewer.component.html',
  styleUrl: './pdf-slider-viewer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PdfSliderViewerComponent implements OnInit {
  pageImages: string[] = [];
  loading = true;

  customOptions = {
    loop: false,
    dots: true,
    nav: true,
    navText: ['<', '>'],
    items: 1,
  };

  constructor(
    public dialogRef: MatDialogRef<PdfSliderViewerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: number,
    private cdr: ChangeDetectorRef,
    private marketingService:MarketingService
  ) {}

  ngOnInit(): void {
    const pdfId = this.data;
    
    // Verify PDF.js worker is loaded
    if (!(pdfjsLib as any).GlobalWorkerOptions.workerSrc) {
      console.error('PDF.js worker not configured');
      this.loading = false;
      this.cdr.markForCheck();
      return;
    }
  
    this.marketingService.downloadPdf(pdfId).subscribe({
      next: (response: Blob) => {
        if (!response.type.includes('pdf')) {
          console.error('Invalid content type:', response.type);
          this.loading = false;
          this.cdr.markForCheck();
          return;
        }
  
        const blobUrl = URL.createObjectURL(response);
        
        const loadingTask = pdfjsLib.getDocument(blobUrl);
        
        loadingTask.promise.then((pdf: any) => {
          // ... rest of your rendering code ...
        }).catch((err) => {
          console.error('PDF processing error:', err);
          this.loading = false;
          this.cdr.markForCheck();
        });
      },
      error: (err) => {
        console.error('PDF download failed:', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
  
  closeDialog() {
    this.dialogRef.close();
  }
}
