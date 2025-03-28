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
import { AddCountryComponent } from "../add-country/add-country.component";
import { CountryService } from "../../country.service";
import { Router } from "@angular/router";

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: "app-country-list",
  standalone: true,
  imports: [
    AgGridAngular,
    CommonModule,
   
    PageHeaderComponent,
    SideDrawerComponent,
    AddCountryComponent
  ],
  providers: [],
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountryListComponent implements OnInit, OnDestroy {

  columnDefs: any = [
    { headerName: "S. No", valueGetter: "node.rowIndex + 1", pinned: "left" },
    { headerName: "Actions", field: "actions", cellRenderer: (params: any) => this.renderActionIcons(params), pinned: "right" },
    { field: "name", headerName: "Country Name", sortable: true, filter: true },
    { field: "id", headerName: "Country id", sortable: true, filter: true },
   
  ];

  defaultColDef = { sortable: true, filter: true, resizable: true, flex: 1 };
  rowData: any[] = [];
  private gridApi!: GridApi<any>;
  private _unsubscribeAll$: Subject<any> = new Subject<any>();
  public isSideDrawerOpen: boolean = false;
  public countryId: number = 0;

  constructor(
    
    private _changeDetectorRef: ChangeDetectorRef,
    private dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private countryService:CountryService,
    private router:Router,
  ){
      
    }
  



  openAddCountryDrawer(): void {
    this.countryId = 0;  // Set ID to 0 for adding a new country
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
      this.countryId = 0;
    }
  }

  ngOnInit(): void {
    this.getCountryList();
  }

  getCountryList() {
    
    this.countryService.getAllCountry().subscribe({next:(data:any)=>{
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
           <i style="cursor:pointer; font-size:1.2rem" class="fa-solid fa-eye"></i>
        </span>
      
      </div>
    `;
  }


  updateCountry(event: any): void {
    debugger
    const countryId = event.data.id;
   
     
      this.countryId = Number(countryId);
      this.router.navigate(["/admin/country",this.countryId])
      
    
  }

  openDeleteModal(countryId: number): void {
    const dialogRef = this.dialog.open(DeleteModalComponent, {
      width: "400px",
      height: "175px",
      disableClose: true,
      data: "Country",
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.deleteRow(countryId);
      }
    });
  }

  deleteRow(id: number) {
    // this._countryService.deleteCountryById(id).subscribe({
    //   next: (response: any) => {
    //     this.showSuccessMessage(response.message);
    //     this.getCountryList();
    //   },
    //   error: (err) => {
    //     this.showErrorMessage(err);
    //   },
    // });
  }

  showSuccessMessage(message: string) {
    this._snackBar.openFromComponent(SuccessModalComponent, {
      data: { message },
      duration: 4000,
      panelClass: ["custom-toast"],
      verticalPosition: "top",
      horizontalPosition: "right",
    });
  }

  showErrorMessage(err: any) {
    this._snackBar.open(err.error.message, "Close", {
      duration: 4000,
      panelClass: ["error-toast"],
      verticalPosition: "top",
      horizontalPosition: "right",
    });
  }

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
