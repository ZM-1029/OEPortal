
import { CommonModule, NgIf } from '@angular/common';
import { Component, Inject, OnInit, OnDestroy, HostListener } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { MarketingService } from 'src/app/features/marketing/marketing.service';
import { LoaderComponent } from 'src/app/shared/components/UI/loader/loader.component';

import * as pdfjsLib from 'pdfjs-dist';
import { Router } from '@angular/router';
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
  lastKeyTime = 0;

  constructor(
    public dialogRef: MatDialogRef<ViewPdfComponent>,
    @Inject(MAT_DIALOG_DATA) public data: number,
    private marketingService: MarketingService,
    private _router: Router,
  ) { }

  ngOnInit(): void {
    this.loadPdf(this.data);
    this.enterFullScreen();
    document.addEventListener('fullscreenchange', this.onFullscreenChange);
  }

  ngOnDestroy(): void {
    if (this.pdfSrc) {
      URL.revokeObjectURL(this.pdfSrc);
    }
    this.exitFullScreen();
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
    const now = Date.now();
    // Limit to 1 action per 200ms
    if (now - this.lastKeyTime < 200) return;
    this.lastKeyTime = now;

    if (event.key === 'ArrowRight') {
      if (this.page < this.totalPages) this.page++;
    } else if (event.key === 'ArrowLeft') {
      if (this.page > 1) this.page--;
    } else if (event.key === 'Escape') {
      this.exitFullScreen();
    }

    if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
      event.preventDefault();
    }
  }


  closeDialog(): void {
    this.dialogRef.close();
  }

  enterFullScreen(): void {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if ((<any>elem).webkitRequestFullscreen) {
      (<any>elem).webkitRequestFullscreen(); 
    } else if ((<any>elem).msRequestFullscreen) {
      (<any>elem).msRequestFullscreen(); 
    }
  }

  exitFullScreen(): void {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ((<any>document).webkitExitFullscreen) {
      (<any>document).webkitExitFullscreen();
    } else if ((<any>document).msExitFullscreen) {
      (<any>document).msExitFullscreen();
    }
  }

  onFullscreenChange = (): void => {
    if (!document.fullscreenElement) {
      this.closeDialog();
    }
  };
}
