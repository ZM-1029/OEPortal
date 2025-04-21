
import { CommonModule, NgIf } from '@angular/common';
import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
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

  closeDialog(): void {
    this.dialogRef.close();
  }
  
}
