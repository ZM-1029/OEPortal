import { CommonModule, NgClass } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { AddPdfComponent } from './add-pdf/add-pdf.component';
import { MatDialog } from '@angular/material/dialog';
import { MarketingService } from '../marketing.service';
import { MarketingList } from 'src/app/shared/types/marketing.type';
import { DeleteModalComponent } from 'src/app/shared/components/UI/delete-modal/delete-modal.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SuccessModalComponent } from 'src/app/shared/components/UI/success-modal/success-modal.component';
import { Router, ActivatedRoute } from '@angular/router';
import { RolePermissionService } from '../../role-permissions/role-permission.service';
import { rolePermissionListI } from 'src/app/shared/types/roles.type';

@Component({
  selector: 'app-marketing',
  imports: [
    CommonModule, MatIconModule, CarouselModule, NgClass
  ],
  templateUrl: './marketing.component.html',
  styleUrls: ['./marketing.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MarketingComponent implements OnInit {
  marketingList: MarketingList[] = []
  allMarketing: MarketingList[] = []
  logoUrl: any;
  marketingAccess: rolePermissionListI = {
    id: 0,
    formId: 0,
    form: '',
    view: false,
    add: false,
    edit: false
  };

  constructor(private dialog: MatDialog, private router: Router, private route: ActivatedRoute,
    private marketingService: MarketingService,
    private _successMessage: MatSnackBar, private changeDetectorRef: ChangeDetectorRef,
    private rolePermissionService: RolePermissionService
  ) { }

  ngOnInit(): void {
    this.getPermissionToAccessPage(Number(localStorage.getItem('role')));
  }

  getPermissionToAccessPage(roleId: any) {
    this.rolePermissionService.getPermissionsByRoleId(roleId).subscribe({
      next: (response) => {
        if (response.success) {
          for (const marketingAccess of response.data) {
            if (marketingAccess.form === "Marketing") {
              this.marketingAccess = marketingAccess;
              this.changeDetectorRef.detectChanges();
              if (this.marketingAccess.view) {
                this.getMarketingList();
                setTimeout(() => {
                  this.getMarketingPermissionByRoleId(Number(localStorage.getItem('role')));
                }, 100)
              } else {
                // this.rowData = [];
                // this.showErrorOverlay("You have not permission");
              }
              this.changeDetectorRef.detectChanges();
            }
          }
        } else {
          this.handleError(response.message);
        }
      },
      error: (err) => {
        this.handleError("please try again later");
      },
    });
  }

  getMarketingPermissionByRoleId(RoleId: number) {
    this.marketingService.getMarketingPermissionById(RoleId).subscribe({
      next: (res) => {
        if (Number(localStorage.getItem('role')) == 1) {
          this.allMarketing = [...this.marketingList]; // clone the list
          this.changeDetectorRef.detectChanges();
        } else {
          this.allMarketing = this.marketingList.filter((perm: any) =>
            res.some((item: any) => perm.id === item.marketingId)
          );
        }
        this.changeDetectorRef.detectChanges();
        console.log(this.allMarketing, "allMarketing");
      },
      error: (error) => {
        console.error("Error fetching marketing list");
        this.handleError(error.error.message);
      }
    });
  }


  // getMarketingPermissionByRoleId(RoleId: number) {
  //   this.marketingService.getMarketingPermissionById(RoleId).subscribe(
  //     {
  //       next: ((res) => {
  //         // Filter marketing list where permission exists and isView is true
  //         if (Number(localStorage.getItem('role')) == 1) {
  //           this.allMarketing = this.marketingList;
  //           this.changeDetectorRef.detectChanges();
  //         } else {
  //           res.filter((item: any) =>
  //             this.marketingList.some(
  //               (perm: any) => {
  //                 if (perm.id === item.marketingId) {
  //                   this.allMarketing.push(perm);
  //                 }
  //               }
  //             )
  //           );
  //         }
  //         console.log(this.allMarketing, "allMarketing");
  //         this.changeDetectorRef.detectChanges();
  //       }),
  //       error: ((error) => {
  //         console.error("Error fetching marketing list");
  //         this.handleError(error.error.message);
  //       })
  //     }
  //   );
  // }


  addPdf() {
    this.openForm(0);
  }

  viewPdf(id: number) {
    this.router.navigateByUrl("/admin/marketing/" + id);
  }

  editCard(card: MarketingList) {
    this.openForm(card.id);
  }

  getMarketingList() {
    this.marketingService.getMarketingList().subscribe({
      next: (response) => {
        this.marketingList = response.data;
        this.logoUrl = response.data;
        this.allMarketing = [...this.marketingList];
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
      height: "450px",
      disableClose: false,
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
      disableClose: false,
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
