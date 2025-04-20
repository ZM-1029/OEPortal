import { CommonModule, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, Inject } from '@angular/core';
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

@Component({
  selector: 'app-view-slider',
  imports: [CommonModule, CarouselModule, PdfViewerModule,
    FormsModule,  MatIconModule,NgIf,LoaderComponent],
  templateUrl: './view-slider.component.html',
  styleUrl: './view-slider.component.scss'
})
export class ViewSliderComponent {
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
    private _salesService: SalesService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.loadPdf(this.data);
  }

  ngOnDestroy(): void {
    if (this.pdfSrc) {
      URL.revokeObjectURL(this.pdfSrc);
    }
  }

  viewFullScreen(){
    this.dialog.open(ViewPdfComponent, {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      panelClass: 'full-screen-dialog',
      data: this.data,
    });
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

  downloadPdf() {
    if (this.pdfSrc) {
      const link = document.createElement('a');
      link.href = this.pdfSrc;
      link.download = 'PPT.pdf';
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
  
  previousPage(): void {
    if (this.page > 1) {
      this.page--;
    }
  }

  nextPage(): void {
    if (this.page < this.totalPages) {
      this.page++;
    }
  }

  // onPdfLoad(pdf: any): void {
  //   this.totalPages = pdf.numPages;
  //   this.loading = false;
  // }

  

  closeDialog() {
    this.dialogRef.close();
  }
}
