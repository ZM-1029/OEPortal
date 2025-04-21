import { CommonModule, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { LoaderComponent } from 'src/app/shared/components/UI/loader/loader.component';
import { PdfSliderViewerComponent } from 'src/app/shared/components/UI/pdf-slider-viewer/pdf-slider-viewer.component';
import { SalesService } from '../../sales/sales.service';
import { MarketingService } from '../marketing.service';
import { ViewPdfComponent } from '../view-pdf/view-pdf.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-view-slider',
  imports: [CommonModule, CarouselModule, PdfViewerModule,
    FormsModule,  MatIconModule,NgIf,LoaderComponent],
  templateUrl: './view-slider.component.html',
  styleUrl: './view-slider.component.scss',
    encapsulation: ViewEncapsulation.None // ← change this
  
})
export class ViewSliderComponent implements OnInit,OnDestroy {
  pdfSrc: string | undefined;
  loading: boolean = true;
  errorMessage: string | null = null;
  page: number = 1;
  totalPages: number = 0;
  zoom: number = 1.0;
  id:number=0;
  constructor(
    private route: ActivatedRoute,
    private marketingService: MarketingService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get("id"));;
    this.loadPdf(this.id);
  }

  ngOnDestroy(): void {
    if (this.pdfSrc) {
      URL.revokeObjectURL(this.pdfSrc);
    }
  }

  loadPdf(id: number): void {
    this.marketingService.downloadPdf(id).subscribe({
      next: (response: Blob) => {
        console.log('Blob type:', response.type);
        const blobUrl = URL.createObjectURL(response);
        this.pdfSrc = blobUrl;
        this.loading = false;
        this.cdr.detectChanges();

        // Optional test
        // window.open(blobUrl, '_blank');
      },
      error: (err) => {
        console.error('Failed to load PDF:', err);
        this.errorMessage = 'Failed to load PDF';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onPdfLoad(pdf: any): void {
    this.totalPages = pdf._pdfInfo.numPages;
    this.loading = false;
    this.cdr.detectChanges();
  }

  onPdfError(error: any): void {
    console.error('PDF Render Error:', error);
    this.errorMessage = 'PDF rendering failed';
  }

  zoomIn(): void {
    if (this.zoom < 3.0) this.zoom += 0.1;
  }

  zoomOut(): void {
    if (this.zoom > 0.3) this.zoom -= 0.1;
  }

  previousPage(): void {
    if (this.page > 1) this.page--;
  }

  nextPage(): void {
    if (this.page < this.totalPages) this.page++;
  }

  downloadPdf(): void {
    if (this.pdfSrc) {
      const link = document.createElement('a');
      link.href = this.pdfSrc;
      link.download = 'Document.pdf';
      link.click();
    }
  }

  viewFullScreen(): void {
    this.dialog.open(ViewPdfComponent, {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      panelClass: 'full-screen-dialog',
      data: this.id,
    });
  }

  closeDialog(): void {
    // this.dialogRef.close();
  }
}
