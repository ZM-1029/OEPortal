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
import {
  customerDetailsI,
  customerListI,
  customerI,
} from "../../../shared/types/customer.type";
import { CommonModule, NgIf } from "@angular/common";
import { PageHeaderComponent } from "../../../shared/components/UI/page-header/page-header.component";
import { CustomersService } from "../customers.service";
import { LoaderComponent } from "../../../shared/components/UI/loader/loader.component";
import { provideIcons } from "@ng-icons/core";
import { heroUsers } from "@ng-icons/heroicons/outline";
import { SideDrawerComponent } from "../../../shared/components/UI/side-drawer/side-drawer.component";
import { CustomerCreateComponent } from "../customer-create/customer-create.component";
import { MatDialog } from "@angular/material/dialog";
import { DeleteModalComponent } from "../../../shared/components/UI/delete-modal/delete-modal.component";
import { Subject } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SuccessModalComponent } from "src/app/shared/components/UI/success-modal/success-modal.component";
import { RolePermissionService } from "../../role-permissions/role-permission.service";
import { rolePermissionListI } from "src/app/shared/types/roles.type";

ModuleRegistry.registerModules([AllCommunityModule]);
@Component({
  selector: "app-customers-list",
  imports: [
    AgGridAngular,
    CommonModule,
    LoaderComponent,
    PageHeaderComponent,
    SideDrawerComponent,
    CustomerCreateComponent,
  ],
  providers: [provideIcons({ heroUsers })],
  templateUrl: "./customers-list.component.html",
  styleUrl: "./customers-list.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomersListComponent implements OnInit, OnDestroy {
  
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
  HeadingName: string = "customers";
  rowData: customerI[]=[];
  customerAccess: rolePermissionListI = {
    id: 0,
    formId: 0,
    form: '',
    view: false,
    add: false,
    edit: false
  }; 
  
 private gridApi!: GridApi<any>;

private _unsubscribeAll$: Subject<any> = new Subject<any>();

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
      field: "customerName",
      headerName: "Customer Name",
      sortable: true,
      pinned: "left",
      filter: true,
      minWidth: 180,
      cellStyle: () => {
        return { border: "none" };
      },
    },
    {
      field: "id",
      headerName: "Customer Id",
      sortable: true,
      filter: true,
      minWidth: 170,
    },
    {
      field: "phoneNumber",
      headerName: "Phone Number",
      sortable: true,
      filter: true,
      minWidth: 200,
    },
    {
      field: "primaryContact",
      headerName: "Primary Contact",
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
    {
      field: "businessType",
      headerName: "Business Type",
      cellRenderer: (params: any) => {
        return params.value == "1"
          ? (params.value = "Business")
          : (params.value = "Individual");
      },
      sortable: true,
      filter: true,
      minWidth: 170,
    },
   
  ];

  defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
  };

  constructor(
    private _customerService: CustomersService,
    private _changeDetectorRef: ChangeDetectorRef,
    private dialog: MatDialog,
    private _successMessage: MatSnackBar,
    private rolePermissionService:RolePermissionService
  ) {}

  ngOnInit(): void {
    this.pageHeader_customer(this.HeadingName);
    
  }


  getPermissionToAccessPage(roleId: any) {
    this.rolePermissionService.getPermissionsByRoleId(roleId).subscribe({
      next: (response) => {
        if (response.success) {
          for (const customerAccess of response.data) {
            if (customerAccess.form === "Customers") {
              this.customerAccess = customerAccess;
              if (this.customerAccess.view) {
                this.getCustomerList();
              } else {
                this.rowData = [];
                this.showErrorOverlay("You have not permission");
              }
              // Hide "Actions" column if `edit` is false
              if (this.gridApi) {
                this.gridApi.setColumnsVisible(["actions"], this.customerAccess.edit);
              }
  
              this._changeDetectorRef.detectChanges();
            }
          }
        } else {
          this.handleError("please try again leter");
        }
      },
      error: (err) => {
        this.handleError("please try again leter");
      },
    });
  }
  


  addCustomer(event: Event) {
    this.customerId = 0;
    this.isSideDrawerOpen = true;
  }

  pageHeader_customer(customerHeadingName: string) {
    this.HeadingName = customerHeadingName;
  }

  getCustomerList() {
    this._customerService
      .getCustomerList()
      .subscribe((result: customerListI) => {
        if (result.success) {
          this.totalCount = result.totalCount;
          this.rowData = result.customers;
          this._changeDetectorRef.detectChanges();
        } else {
          this.rowData=[];
          this.showErrorOverlay('Data is not found')
          console.log("No customer data returned from API.");
        }
      });
  }


  export(event: Event) {
    alert("export");
  }

  // Form Close
  formClose(event: any) {
    this.sideDrawer();
    if (event) {
      this.getCustomerList();
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
        this.getCustomerList();
      },
      error: (err) => {
        this.handleError("Error deleting Customer:");
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
      this.getPermissionToAccessPage(Number(localStorage.getItem('role')))
      this.gridApi = params.api;
      this.gridApi.hideOverlay();
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
        <span class="icon-container text-danger delete-icon" data-id="${params.data.id}" style="display: block; width: 20px; height: 20px;">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
        </span>
      </div>
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
