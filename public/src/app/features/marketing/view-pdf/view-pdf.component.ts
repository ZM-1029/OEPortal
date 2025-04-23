
import { CommonModule, NgIf } from '@angular/common';
import { Component, Inject, OnInit, OnDestroy, HostListener } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { MarketingService } from 'src/app/features/marketing/marketing.service';
import { LoaderComponent } from 'src/app/shared/components/UI/loader/loader.component';

import * as pdfjsLib from 'pdfjs-dist';
(pdfjsLib as any).GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${(pdfjsLib as any).version}/pdf.worker.min.js`;

@Component({
  selector: 'app-view-pdf',
  standalone: true,
  imports: [CommonModule, PdfViewerModule, LoaderComponent, NgIf],
  templateUrl: './view-pdf.component.html'
})
export class ViewPdfComponent implements OnInit, OnDestroy {
  loading = true;
  pdfSrc: string | undefined;
  page = 1;
  totalPages = 0;

  constructor(
    public dialogRef: MatDialogRef<ViewPdfComponent>,
    @Inject(MAT_DIALOG_DATA) public data: number,
    private marketingService: MarketingService
  ) {}

  ngOnInit(): void {
    this.loadPdf(this.data);
  }

  ngOnDestroy(): void {
    if (this.pdfSrc) {
      URL.revokeObjectURL(this.pdfSrc);
    }
  }

  loadPdf(quotationId: number): void {
    this.marketingService.downloadPdf(quotationId).subscribe({
      next: (response: Blob) => {
        const blobUrl = URL.createObjectURL(response);
        this.pdfSrc = blobUrl;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onPdfLoad(pdf: any): void {
    this.totalPages = pdf.numPages;
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'ArrowRight') {
      if (this.page < this.totalPages) this.page++;
    } else if (event.key === 'ArrowLeft') {
      if (this.page > 1) this.page--;
    }
    // Prevent up/down keys from scrolling
    if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
      event.preventDefault();
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
