
import { CommonModule, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CarouselModule } from 'ngx-owl-carousel-o';
import * as pdfjsLib from 'pdfjs-dist';
import { MarketingService } from 'src/app/features/marketing/marketing.service';
import { PdfSliderViewerComponent } from 'src/app/shared/components/UI/pdf-slider-viewer/pdf-slider-viewer.component';
import { SalesService } from '../../sales/sales.service';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { LoaderComponent } from 'src/app/shared/components/UI/loader/loader.component';

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = 
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${(pdfjsLib as any).version}/pdf.worker.min.js`;

@Component({
  selector: 'app-view-pdf',
  imports: [CommonModule, CarouselModule, PdfViewerModule,FormsModule,LoaderComponent, MatIconModule,NgIf],
  templateUrl: './view-pdf.component.html',
  styleUrl: './view-pdf.component.scss'
})
export class ViewPdfComponent implements OnInit, OnDestroy {
  pageImages: string[] = [];
  loading = true;
  errorMessage: string | null = null;
  page: number = 1;
  totalPages: number = 0;
  zoom: number = 0.7;
  pdfSrc: string | undefined;

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
    private marketingService: MarketingService,
    private _salesService: SalesService
  ) {}

  ngOnInit(): void {
    this.loadPdf(this.data);
  }

  ngOnDestroy(): void {
    if (this.pdfSrc) {
      URL.revokeObjectURL(this.pdfSrc);
    }
  }

  onPdfLoad(pdf: any): void {
    this.totalPages = pdf._pdfInfo.numPages;
  }

  zoomIn(): void {
    if (this.zoom < 2.5) this.zoom += 0.1;
  }

  zoomOut(): void {
    if (this.zoom > 0.3) this.zoom -= 0.1;
  }

  downloadQuotationPdf() {
    if (this.pdfSrc) {
      const link = document.createElement('a');
      link.href = this.pdfSrc;
      link.download = 'Quotation.pdf';
      link.click();
    } else {
      console.warn('PDF source is undefined');
    }
  }

  loadPdf(quotationId: number): void {
    this.marketingService.downloadPdf(quotationId).subscribe({
      next: (response: Blob) => {
        const blobUrl = URL.createObjectURL(response);
        this.pdfSrc = blobUrl;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to load PDF:', err);
        this.errorMessage = 'Failed to load PDF';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
