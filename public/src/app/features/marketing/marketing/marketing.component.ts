import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { AddPdfComponent } from './add-pdf/add-pdf.component';
import { MatDialog } from '@angular/material/dialog';
import { MarketingService } from '../marketing.service';
import { MarketingList } from 'src/app/shared/types/marketing.type';
import { DeleteModalComponent } from 'src/app/shared/components/UI/delete-modal/delete-modal.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SuccessModalComponent } from 'src/app/shared/components/UI/success-modal/success-modal.component';
import { PdfSliderViewerComponent } from 'src/app/shared/components/UI/pdf-slider-viewer/pdf-slider-viewer.component';
import { ViewPdfComponent } from '../view-pdf/view-pdf.component';
import { ViewSliderComponent } from '../view-slider/view-slider.component';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-marketing',
  imports: [
    CommonModule, MatIconModule,CarouselModule
  ],
  templateUrl: './marketing.component.html',
  styleUrls: ['./marketing.component.scss']
})
export class MarketingComponent implements OnInit {
  marketingList: MarketingList[] = []
  logoUrl: any;
  constructor(private dialog: MatDialog,private router: Router, private route: ActivatedRoute, private marketingService: MarketingService,
    private _successMessage: MatSnackBar, private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.getMarketingList();

  }

  addPdf() {
    this.openForm(0);
  }

  
  viewPdf(id: number) {
    this.router.navigateByUrl("/admin/marketing/" + id);
  }
 
  // viewPdf(id: number) {
  //   this.dialog.open(ViewSliderComponent, {
  //     width: '100vw',
  //     height: '100vh',
  //     maxWidth: '100vw',
  //     panelClass: 'full-screen-dialog',
  //     data: id,
  //   });
  // }

  editCard(card: MarketingList) {
    console.log('Edit card', card);
    this.openForm(card.id);
  }

  getMarketingList() {
    this.marketingService.getMarketingList().subscribe({
      next: (response) => {
        this.marketingList = response.data;
        this.logoUrl = response.data;
        this.changeDetectorRef.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching marketing list', err);
      },
    });
  }


  openForm(id: number): void {
    const dialogRef = this.dialog.open(AddPdfComponent, {
      width: "500px",
      height: "500px",
      disableClose: true,
      data: id,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result == true) {
        setTimeout(() => {
          this.getMarketingList();
        }, 1000);
      } else {
        console.log("canceled");
      }
    });
  }

  DeleteModal(id: number) {
    const dialogRef = this.dialog.open(DeleteModalComponent, {
      width: "400px",
      height: "175px",
      disableClose: true,
      data: "Marketing",
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result == true) {
        console.log("Delete confirmed");
        this.delete(id);
      } else {
        console.log("Delete action canceled");
      }
    });
  }

  delete(id: number) {
    this.marketingService.deleteMarketingById(id).subscribe(
      {
        next: ((response) => {
          if (response.success) {
            this.showSuccessMessage(response.message);
            this.getMarketingList();
          } else {
            this.handleError(response.message);
          }
        }),
        error: ((err) => {
          this.handleError(err.error.message);
        })
      }
    )
  }

  //  Function to show success messages
  private showSuccessMessage(message: string) {
    this._successMessage.openFromComponent(SuccessModalComponent, {
      data: { message },
      duration: 4000,
      panelClass: ["custom-toast"],
      verticalPosition: "top",
      horizontalPosition: "right",
    });
  }

  //  Function to handle API errors
  private handleError(err: any) {
    this._successMessage.open(err, "Close", {
      duration: 4000,
      panelClass: ["error-toast"],
      verticalPosition: "top",
      horizontalPosition: "right",
    });
  }

}
