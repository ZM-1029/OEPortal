import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { AddPdfComponent } from './add-pdf/add-pdf.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-marketing',
  imports: [CarouselModule,
    CommonModule, MatIconModule
  ],
  templateUrl: './marketing.component.html',
  styleUrls: ['./marketing.component.scss']
})
export class MarketingComponent implements OnInit {
  constructor(private dialog: MatDialog,) { }

  ngOnInit(): void {

  }

  addPdf() {
    this.openForm(0);
  }

  openForm(customerId: number): void {
    const dialogRef = this.dialog.open(AddPdfComponent, {
      width: "500px",
      height: "500px",
      disableClose: true,
      data: "Customer",
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result == true) {
        console.log("Delete confirmed");
        // this.deleteRow(customerId);
      } else {
        console.log("Delete action canceled");
      }
    });
  }

  marketingCards = [
    { id: 1, title: 'Company Overview', subtitle: 'Innovative solutions for evolving needs.', showButton: false },
    { id: 2, title: 'Company Overview', subtitle: 'Innovative solutions for evolving needs.', showButton: false },
    { id: 3, title: 'Company Overview', subtitle: 'Innovative solutions for evolving needs.', showButton: true },
    { id: 4, title: 'Company Overview', subtitle: 'Innovative solutions for evolving needs.', showButton: false }
  ];

  carouselOptions = {
    loop: false,
    margin: 10,
    nav: false,
    dots: true,
    responsive: {
      0: {
        items: 1
      },
      600: {
        items: 2
      },
      1000: {
        items: 4
      }
    }
  };

}
