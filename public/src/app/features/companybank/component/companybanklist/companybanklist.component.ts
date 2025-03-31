import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from "@angular/core";
import { AgGridAngular } from "ag-grid-angular";
import { AllCommunityModule, GridApi, GridReadyEvent, ModuleRegistry } from "ag-grid-community";
import { CommonModule } from "@angular/common";
import { PageHeaderComponent } from "../../../../shared/components/UI/page-header/page-header.component";


import { MatDialog } from "@angular/material/dialog";
import { DeleteModalComponent } from "../../../../shared/components/UI/delete-modal/delete-modal.component";
import { Subject } from "rxjs";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SuccessModalComponent } from "src/app/shared/components/UI/success-modal/success-modal.component";
import { SideDrawerComponent } from "src/app/shared/components/UI/side-drawer/side-drawer.component";

import { Router } from "@angular/router";

import { AppComponent } from "src/app/app.component";
import { AddcompanybankComponent } from "../addcompanybank/addcompanybank.component";
import { CompanybanklistService } from "../../companybanklist.service";


ModuleRegistry.registerModules([AllCommunityModule]);
@Component({
  selector: 'app-companybanklist',
  imports: [
     AgGridAngular,
        CommonModule,
        AddcompanybankComponent,
        PageHeaderComponent,
        SideDrawerComponent
  ],
  templateUrl: './companybanklist.component.html',
  styleUrl: './companybanklist.component.scss'
})
export class CompanybanklistComponent {
 columnDefs: any = [
    { headerName: "S. No", valueGetter: "node.rowIndex + 1", pinned: "left" },
    { headerName: "Actions", field: "actions", cellRenderer: (params: any) => this.renderActionIcons(params), pinned: "right" },
    { field: "bankName", headerName: "Bank Name", sortable: true, filter: true },
    { field: "accountNumber", headerName: "AccounNumber", sortable: true, filter: true },
    { field: "ifscCode", headerName: "IFSC Code", sortable: true, filter: true },
    { field: "accountType", headerName: "Account Type", sortable: true, filter: true },
    { field: "swissCode", headerName: "Swiss Code", sortable: true, filter: true },
    { field: "sortcode", headerName: "Sort Code", sortable: true, filter: true },
   
   
   
   
  ];

  defaultColDef = { sortable: true, filter: true, resizable: true, flex: 1 };
  rowData: any[] = [];
  private gridApi!: GridApi<any>;
  private _unsubscribeAll$: Subject<any> = new Subject<any>();
  public isSideDrawerOpen: boolean = false;
  public id: number = 0;

  constructor(
    
    private _changeDetectorRef: ChangeDetectorRef,
    private dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private CompanyService:CompanybanklistService,
   
  ){
      
    }
  



  openAddCountryDrawer(): void {
    this.id = 0;  // Set ID to 0 for adding a new country
    this.isSideDrawerOpen = true;
  }

  closeSideDrawer(): void {
    this.isSideDrawerOpen = false;
    this.getCountryList(); // Refresh country list after closing
  }

  formClose(event: any) {
    this.sideDrawer();
    if (event) {
      this.getCountryList();
      this.id = 0;
    }
  }

  ngOnInit(): void {
    this.getCountryList();
  }

  getCountryList() {
    
    this.CompanyService.GetAllBankDetail().subscribe({next:(data:any)=>{
     this.rowData=data.data;
     this._changeDetectorRef.detectChanges();
    }})
    
  }
  sideDrawer() {
    if (this.isSideDrawerOpen) {
      this.isSideDrawerOpen = false;
      this._changeDetectorRef.detectChanges();
    }
  }

  onGridReady(params: GridReadyEvent<any>) {
    this.gridApi = params.api;
    this.gridApi.hideOverlay();
    this.getCountryList();
  }

  renderActionIcons(params: any): string {
    return `
      <div class="action-icons d-flex align-items-center justify-content-around">
        <span class="icon-container text-primary edit-icon" data-id="${params.data.id}" style="display: block; width: 20px; height: 20px; cursor:pointer">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
          </svg>
        </span>
       
      </div>
    `;
  }


  updateCompanyProfile(event: any): void {
    debugger
    const id = event.data.id;
   
    this.isSideDrawerOpen=true;
      this.id = Number(id);
     
      
    
  }

  // openDeleteModal(id: number): void {
  //   const dialogRef = this.dialog.open(DeleteModalComponent, {
  //     width: "400px",
  //     height: "175px",
  //     disableClose: true,
  //     data: "Country",
  //   });

  //   dialogRef.afterClosed().subscribe((result) => {
  //     if (result) {
  //       this.deleteRow(id);
  //     }
  //   });
  // }

  // deleteRow(id: number) {
  //   // this._countryService.deleteCountryById(id).subscribe({
  //   //   next: (response: any) => {
  //   //     this.showSuccessMessage(response.message);
  //   //     this.getCountryList();
  //   //   },
  //   //   error: (err) => {
  //   //     this.showErrorMessage(err);
  //   //   },
  //   // });
  // }

  // showSuccessMessage(message: string) {
  //   this._snackBar.openFromComponent(SuccessModalComponent, {
  //     data: { message },
  //     duration: 4000,
  //     panelClass: ["custom-toast"],
  //     verticalPosition: "top",
  //     horizontalPosition: "right",
  //   });
  // }

  // showErrorMessage(err: any) {
  //   this._snackBar.open(err.error.message, "Close", {
  //     duration: 4000,
  //     panelClass: ["error-toast"],
  //     verticalPosition: "top",
  //     horizontalPosition: "right",
  //   });
  // }

  showErrorOverlay(message: string) {
    if (this.gridApi) {
      this.gridApi.showNoRowsOverlay();
      setTimeout(() => {
        const overlay = document.querySelector(".ag-overlay-no-rows-center");
        if (overlay) overlay.innerHTML = `<span style="color: #2e3b64; font-weight: bold;">${message}</span>`;
        this._changeDetectorRef.detectChanges();
      }, 100);
    }
  }

  ngOnDestroy(): void {
    this._unsubscribeAll$.next(null);
    this._unsubscribeAll$.complete();
  }
}
