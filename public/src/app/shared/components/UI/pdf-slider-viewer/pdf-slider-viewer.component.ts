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
  errorMessage: string | null = null;

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
    private marketingService: MarketingService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      await this.setupPdfJsWorker();
      await this.loadAndRenderPdf();
    } catch (error) {
      console.error('PDF initialization failed:', error);
      this.errorMessage = 'Failed to load PDF viewer. Please try again later.';
      this.loading = false;
      this.cdr.markForCheck();
    }
  }

  private async setupPdfJsWorker(): Promise<void> {
    try {
      // Try loading from CDN first
      (pdfjsLib as any).GlobalWorkerOptions.workerSrc = 
        `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${(pdfjsLib as any).version}/pdf.worker.min.js`;
      
      // Test the worker by creating a dummy task
      await pdfjsLib.getDocument({ data: new Uint8Array() }).promise.catch(() => {});
    } catch (cdnError) {
      console.warn('CDN worker failed, falling back to local worker');
      try {
        // Fallback to local worker (make sure you have pdf.worker.js in your assets)
        (pdfjsLib as any).GlobalWorkerOptions.workerSrc = 
          '/assets/pdf.worker.min.js';
      } catch (localError) {
        console.error('Both CDN and local worker failed');
        throw new Error('PDF.js worker initialization failed');
      }
    }
  }

  private async loadAndRenderPdf(): Promise<void> {
    const pdfId = this.data;
    
    this.marketingService.downloadPdf(pdfId).subscribe({
      next: async (response: Blob) => {
        try {
          if (!response.type.includes('pdf')) {
            throw new Error(`Invalid content type: ${response.type}`);
          }

          const blobUrl = URL.createObjectURL(response);
          const pdf = await pdfjsLib.getDocument(blobUrl).promise;
          
          this.pageImages = [];
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d')!;
          
          // Render each page
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 1.5 });
            
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            
            await page.render({
              canvasContext: context,
              viewport: viewport
            }).promise;
            
            this.pageImages.push(canvas.toDataURL('image/png'));
          }
          
          this.loading = false;
          this.cdr.markForCheck();
          URL.revokeObjectURL(blobUrl);
        } catch (error) {
          console.error('PDF rendering error:', error);
          this.errorMessage = 'Failed to render PDF content';
          this.loading = false;
          this.cdr.markForCheck();
        }
      },
      error: (err) => {
        console.error('PDF download failed:', err);
        this.errorMessage = 'Failed to load PDF file';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
