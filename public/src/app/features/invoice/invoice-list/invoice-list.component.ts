import { CommonModule } from "@angular/common";
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  OnInit,
} from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { AgGridAngular } from "ag-grid-angular";
import { PageHeaderComponent } from "src/app/shared/components/UI/page-header/page-header.component";
import { SuccessModalComponent } from "src/app/shared/components/UI/success-modal/success-modal.component";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DeleteModalComponent } from "src/app/shared/components/UI/delete-modal/delete-modal.component";
import { LoaderComponent } from "src/app/shared/components/UI/loader/loader.component";
import { AllCommunityModule, GridApi, GridReadyEvent, ModuleRegistry } from "ag-grid-community";
import { invoiceListI } from "src/app/shared/types/invoice.type";
import { InvoiceService } from "../invoice.service";
import { rolePermissionListI } from "src/app/shared/types/roles.type";
import { RolePermissionService } from "../../role-permissions/role-permission.service";



ModuleRegistry.registerModules([AllCommunityModule]);
@Component({
  selector: "app-invoice-list",
  imports: [
    AgGridAngular,
    CommonModule,
    PageHeaderComponent,
    LoaderComponent,
    RouterLink,
  ],
  templateUrl: "./invoice-list.component.html",
  styleUrl: "./invoice-list.component.scss",
})
export class InvoiceListComponent implements OnInit, AfterViewInit {
  private gridApi!: GridApi<any>;
  public totalCount: number = 0;
  public activeCustomer: number = 0;
  public terminatedCustomer: number = 0;
  public resignedCustomer: number = 0;
  public currentPageNumber: number = 1;
  public currentPageSize: number = 15;
  public isSideDrawerOpen: boolean = false;
  public paginationPageSize = this.currentPageSize;
  public paginationPageSizeSelector: number[] = [15, 25, 50, 100];
  formHeading: string = "";
  salaryRowId!: number;
  HeadingName: string = "Invoice";
  rowData: invoiceListI[] = [];
  InvoiceAccess: rolePermissionListI = {
    id: 0,
    formId: 0,
    form: '',
    view: false,
    add: false,
    edit: false
  };


  columnDefs: any = [
    {
      headerName: "S. No",
      valueGetter: "node.rowIndex + 1",
      sortable: false,
      filter: false,
      pinned: "left",
      minWidth: 100,
      maxWidth: 100,
      cellStyle: () => {
        return { border: "none" };
      },
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
      field: "invoiceNumber",
      headerName: "Invoice Number",
      sortable: true,
      filter: true,
      minWidth: 170,
    },
    {
      field: "month",
      headerName: "Month",
      sortable: true,
      filter: true,
      minWidth: 170,
    },
    {
      field: "year",
      headerName: "Year",
      sortable: true,
      filter: true,
      minWidth: 170,
    },
    {
      field: "customerName",
      headerName: "Customer Name",
      sortable: true,
      filter: true,
      minWidth: 100,
    },
  ];

  defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
  };

  constructor(
    private invoiceService: InvoiceService,
    private _changeDetectorRef: ChangeDetectorRef,
    private dialog: MatDialog,
    private _successMessage: MatSnackBar,
    private _router: Router,
    private rolePermissionService:RolePermissionService
  ) { }


  ngOnInit(): void {
    this.pageHeader_customer(this.HeadingName);

  }

  ngAfterViewInit(): void {
    this._changeDetectorRef.detectChanges();
  }

  pageHeader_customer(customerHeadingName: string) {
    this.HeadingName = customerHeadingName;
  }

  getPermissionToAccessPage(roleId: any) {
    this.rolePermissionService.getPermissionsByRoleId(roleId).subscribe({
      next: (response) => {
        if (response.success) {
          for (const InvoiceAccess of response.data) {
            if (InvoiceAccess.form === "Invoice") {
              this.InvoiceAccess = InvoiceAccess;
              if (this.InvoiceAccess.view) {
                this.getInvoiceList();
              } else {
                this.rowData = [];
                this.showErrorOverlay("You have not permission");
              }
              // Hide "Actions" column if `edit` is false
              if (this.gridApi) {
                this.gridApi.setColumnsVisible(["actions"], this.InvoiceAccess.edit);
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
  


  getInvoiceList() {
    this.invoiceService.getInvoiceList().subscribe(
      {
        next: ((response) => {
          if (response.success) {
            this.rowData = response.data;
            this._changeDetectorRef.detectChanges();
          } else {
            this.showErrorOverlay("Data is not found");
            this.rowData = [];
          }
        }),
        error: ((error) => {
          console.log(error);
          this.showErrorOverlay("Data is not found");
          this.rowData = [];
        })
      }
    )
  }

  // pagnations....
  onPaginationChanged(params: any) {
    const currentPage = params.api.paginationGetCurrentPage();
    const pageSize = params.api.paginationGetPageSize();
    this.currentPageNumber = currentPage + 1;
    this.currentPageSize = pageSize;
  }


  // Form Close
  close(event: boolean) {
    if (event) {
      this.salaryRowId = 0;
      this.getInvoiceList();
      this.handleSideDrawer();
      this._changeDetectorRef.detectChanges();
    } else {
      console.log(event);
    }
  }

  // side Drawer close
  handleSideDrawer(event?: boolean) {
    if (event === false) {
      this.isSideDrawerOpen = event;
    }
    if (this.isSideDrawerOpen) {
      this.isSideDrawerOpen = false;
    }
  }

  getRowId(event: any): void {
    console.log(event.colDef.field, "Clicked column field");
    console.log(event.data.invoiceId, "Full row data");
    if (event.event.target.closest(".edit-icon")) {
      this._router.navigateByUrl("/admin/invoice/" + event.data.invoiceId);
    }
    if (event.event.target.closest(".delete-icon")) {
      this.openDeleteModal(event.data.invoiceId);
    }
  }

  openDeleteModal(invoiceId: number): void {
    const dialogRef = this.dialog.open(DeleteModalComponent, {
      width: "400px",
      height: "175px",
      disableClose: true,
      data: "Invoice",
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result == true) {
        console.log("Delete confirmed");
        this.deleteRow(invoiceId);
      } else {
        console.log("Delete action canceled");
      }
    });
  }

  deleteRow(id: number) {
    this.invoiceService.deleteInvoiceById(id).subscribe({
      next: (response: any) => {
        this.showSuccessMessage(response.message);
        this.getInvoiceList();
        if (this.rowData.length == 0) {
          setTimeout(() => {
            if (this.gridApi) {
              this.showErrorOverlay("Data is not found");
            }
          });
        }
        this._changeDetectorRef.detectChanges();
      },
      error: (err) => {
        this.handleError(err);
        console.error("Error deleting row:", err);
      },
    });
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
    this.getPermissionToAccessPage(Number(localStorage.getItem('role')));
    if (this.rowData.length == 0) {
      setTimeout(() => {
        if (this.gridApi) {
          this.showErrorOverlay("Data is not found");
        }
      });
    }
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
    console.error("Error Status:", err.status);
    console.error("Error Message:", err.error);
    this._successMessage.open(err.error.message, "Close", {
      duration: 4000,
      panelClass: ["error-toast"],
      verticalPosition: "top",
      horizontalPosition: "right",
    });
  }
}
