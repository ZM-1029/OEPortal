import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { ModuleRegistry, AllCommunityModule, GridApi, GridReadyEvent } from 'ag-grid-community';
import { Subject } from 'rxjs';
import { DeleteModalComponent } from 'src/app/shared/components/UI/delete-modal/delete-modal.component';
import { LoaderComponent } from 'src/app/shared/components/UI/loader/loader.component';
import { PageHeaderComponent } from 'src/app/shared/components/UI/page-header/page-header.component';
import { SideDrawerComponent } from 'src/app/shared/components/UI/side-drawer/side-drawer.component';
import { SuccessModalComponent } from 'src/app/shared/components/UI/success-modal/success-modal.component';
import { CustomersService } from '../../customers/customers.service';
import { UserService } from '../user.service';
import { UserCreateComponent } from '../user-create/user-create.component';
ModuleRegistry.registerModules([AllCommunityModule]);
@Component({
  selector: 'app-user-list',
  imports: [AgGridAngular,
      CommonModule,
      LoaderComponent,
      PageHeaderComponent,
      SideDrawerComponent,
      UserCreateComponent],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserListComponent implements OnInit, OnDestroy  {
 columnDefs: any = [
    {
      headerName: "S. No",
      valueGetter: "node.rowIndex + 1",
      sortable: false,
      filter: false,
      pinned: "left",
      minWidth: 100,
      maxWidth: 100,
    },
    {
      headerName: "Actions",
      field: "actions",
      cellRenderer: (params: any) => this.renderActionIcons(params),
      minWidth: 100,
      maxWidth: 100,
      cellClass: "hover-effect-cell",
      pinned: "right",
      sortable: false,
      filter: false,
      cellStyle: () => {
        return { border: "none" };
      },
    },
    {
      field: "name",
      headerName: "Name",
      sortable: true,
      filter: true,
      minWidth: 170,
    },
    {
      field: "role",
      headerName: "Role",
      sortable: true,
      filter: true,
      minWidth: 100,
    },
    {
      field: "createdOn",
      headerName: "Created On",
      sortable: true,
      filter: true,
      minWidth: 200,
    },
    {
      field: "email",
      headerName: "Email",
      sortable: true,
      filter: true,
      minWidth: 270,
    },
   
  ];

  defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
  };

  public totalCount: number = 0;
  public activeCustomer: number = 0;
  public terminatedCustomer: number = 0;
  public resignedCustomer: number = 0;
  public currentPageNumber: number = 1;
  public currentPageSize: number = 15;
  public customerId: number = 0;
  public isSideDrawerOpen: boolean = false;
  public paginationPageSize = this.currentPageSize;
  public paginationPageSizeSelector: number[] = [15, 25, 50, 100];
  HeadingName: string = "User";
  rowData: any[]=[];
 private gridApi!: GridApi<any>;

private _unsubscribeAll$: Subject<any> = new Subject<any>();

  constructor(
    private _customerService: CustomersService,
    private _userService: UserService,
    private _changeDetectorRef: ChangeDetectorRef,
    private dialog: MatDialog,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _successMessage: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.pageHeader_customer(this.HeadingName);
    
  }

  addCustomer(event: Event) {
    this.customerId = 0;
    this.isSideDrawerOpen = true;
  }

  pageHeader_customer(customerHeadingName: string) {
    this.HeadingName = customerHeadingName;
  }

  getUserList() {
    this._userService
      .getUserList()
      .subscribe(
        {
          next:((response)=>{
            this.rowData=response;
            this._changeDetectorRef.detectChanges();
          }),error:((err)=>{
            this.rowData=[];
            this.showErrorOverlay('Data is not found')
          })
        }
      //   (result: customerListI) => {
      //   if (result.success) {
      //     this.totalCount = result.totalCount;
      //     this.rowData = result.customers;
      //     this._changeDetectorRef.detectChanges();
      //   } else {
      //     this.rowData=[];
      //     this.showErrorOverlay('Data is not found')
      //     console.log("No customer data returned from API.");
      //   }
      // }
    );
  }


  export(event: Event) {
    alert("export");
  }

  // Form Close
  formClose(event: any) {
    this.sideDrawer();
    if (event) {
      this.getUserList();
      this.customerId = 0;
    }
  }

  // side Drawer close
  sideDrawer() {
    if (this.isSideDrawerOpen) {
      this.isSideDrawerOpen = false;
      this._changeDetectorRef.detectChanges();
    }
  }

  // delete customer
  updateCustomer(event: any): void {
    if (event.event.target.closest(".edit-icon")) {
      const customerId = event.event.target.closest(".edit-icon").getAttribute("data-id");
      this.isSideDrawerOpen = true;
      this.customerId = Number(customerId);
    }
    if (event.event.target.closest(".delete-icon")) {
      const customerId = event.event.target.closest(".delete-icon").getAttribute("data-id");
      this.openDeleteModal(Number(customerId));
    }
  }

  openDeleteModal(customerId: number): void {
    const dialogRef = this.dialog.open(DeleteModalComponent, {
      width: "400px",
      height: "175px",
      disableClose: true,
      data: "Customer",
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result == true) {
        console.log("Delete confirmed");
        this.deleteRow(customerId);
      } else {
        console.log("Delete action canceled");
      }
    });
  }

  deleteRow(id: number) {
    this._customerService.deleteCustomerById(id).subscribe({
      next: (response: any) => {
        this.showSuccessMessage(response.message);
        this.getUserList();
      },
      error: (err) => {
        this.handleError(err);
        console.error("Error deleting row:", err);
      },
    });
  }
  // delate Customer end


  // pagenation..
  onPaginationChanged(params: any) {
    const currentPage = params.api.paginationGetCurrentPage();
    const pageSize = params.api.paginationGetPageSize();
    this.currentPageNumber = currentPage + 1;
    this.currentPageSize = pageSize;
  }

  
  // for Manage Columns
  allColumns = [...this.columnDefs];
  displayedColumns = [...this.columnDefs];

  toggleColumn(column: any) {
    const columnIndex = this.displayedColumns.findIndex(
      (col) => col.field === column.field,
    );
    if (columnIndex >= 0) {
      this.displayedColumns.splice(columnIndex, 1);
    } else {
      const colToAdd = this.allColumns.find(
        (col) => col.field === column.field,
      );
      if (colToAdd) {
        this.displayedColumns.push(colToAdd);
      }
    }
    this.columnDefs = [...this.displayedColumns];
  }

  isColumnDisplayed(column: any): boolean {
    return this.displayedColumns.some((col) => col.field === column.field);
  }

  // show message in table if api is false.. start
    gridOptions = {
      noRowsOverlayComponentParams: {
        noRowsMessageFunc: () => "Data is not found",
      },
    };
  
    onGridReady(params: GridReadyEvent<any>) {
      this.gridApi = params.api;
      this.gridApi.hideOverlay();
      this.getUserList();
    }
  
    showErrorOverlay(message: string) {
      if (this.gridApi) {
        this.gridApi.showNoRowsOverlay();
        setTimeout(() => {
          const overlay = document.querySelector(".ag-overlay-no-rows-center");
          if (overlay) {
            overlay.innerHTML = `<span style="color: #2e3b64; font-weight: bold;">${message}</span>`;
          }
          this._changeDetectorRef.detectChanges();
        }, 100);
      }
    }
  // show message in table if api is false.. end

  renderActionIcons(params: any): string {
    return `
      <div class="action-icons d-flex align-items-center justify-content-around">
        <span class="icon-container text-primary edit-icon" data-id="${params.data.id}" style="display: block; width: 20px; height: 20px;">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
          </svg>
        </span>
        
    `;
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

  ngOnDestroy(): void {
    this._unsubscribeAll$.next(this._customerService);
    this._unsubscribeAll$.complete();
  }
}
