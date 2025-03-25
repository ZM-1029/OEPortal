import {
  AfterContentChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { RouterLink } from "@angular/router";
import { DeleteModalComponent } from "../../../shared/components/UI/delete-modal/delete-modal.component";
import { AgGridAngular } from "ag-grid-angular";
import { CommonModule } from "@angular/common";
import { PageHeaderComponent } from "../../../shared/components/UI/page-header/page-header.component";
import { SideDrawerComponent } from "../../../shared/components/UI/side-drawer/side-drawer.component";
import { SalaryService } from "../salary.service";
import {
  salaryListI,
} from "../../../shared/types/salary.type";
import { ModuleRegistry, AllCommunityModule, GridReadyEvent, GridApi } from "ag-grid-community";
import { SalaryCreateComponent } from "../salary-create/salary-create.component";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SuccessModalComponent } from "src/app/shared/components/UI/success-modal/success-modal.component";
import { LoaderComponent } from "src/app/shared/components/UI/loader/loader.component";
import { rolePermissionListI } from "src/app/shared/types/roles.type";
import { RolePermissionService } from "../../role-permissions/role-permission.service";

ModuleRegistry.registerModules([AllCommunityModule]);
@Component({
  selector: "app-salary-list",
  imports: [
    AgGridAngular,
    CommonModule,
    PageHeaderComponent,
    RouterLink,
    SideDrawerComponent,
    SalaryCreateComponent,
    LoaderComponent
  ],
  templateUrl: "./salary-list.component.html",
  styleUrl: "./salary-list.component.scss",
})
export class SalaryListComponent implements OnInit, AfterViewInit {
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
  HeadingName: string = "Salary";
  rowData: any[] = [];
  salaryAccess: rolePermissionListI = {
    id: 0,
    formId: 0,
    form: '',
    view: false,
    add: false,
    edit: false
  };

  private gridApi!: GridApi<any>;

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
      field: "employeeName",
      headerName: "Employee Name",
      sortable: true,
      filter: true,
      minWidth: 170,
    },
    {
      field: "employeeid",
      headerName: "Employee Id",
      sortable: true,
      filter: true,
      minWidth: 170,
    },
    {
      field: "month",
      headerName: "Month",
      sortable: true,
      filter: true,
      minWidth: 100,
    },
    {
      field: "year",
      headerName: "Year",
      sortable: true,
      filter: true,
      minWidth: 100,
    },
    {
      field: "customerName",
      headerName: "Customer Name",
      sortable: true,
      filter: true,
      minWidth: 100,
    },
    {
      field: "currencyCode",
      headerName: "Currency Code",
      sortable: true,
      filter: true,
      minWidth: 100,
    },
    {
      field: "amount",
      headerName: "Amount",
      sortable: true,
      filter: true,
      minWidth: 140,
    },
  ];

  defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
  };



  constructor(
    private _salaryService: SalaryService,
    private _changeDetectorRef: ChangeDetectorRef,
    private dialog: MatDialog,
    private _successMessage: MatSnackBar,
    private rolePermissionService:RolePermissionService
  ) { }

  ngOnInit(): void {
    this.pageHeader_customer(this.HeadingName);
  }

  ngAfterViewInit(): void {
    this._changeDetectorRef.detectChanges();
  }



  getPermissionToAccessPage(roleId: any) {
    this.rolePermissionService.getPermissionsByRoleId(roleId).subscribe({
      next: (response) => {
        if (response.success) {
          for (const salaryAccess of response.data) {
            if (salaryAccess.form === "Salary") {
              this.salaryAccess = salaryAccess;
              if (this.salaryAccess.view) {
                this.getSalaryList();
              } else {
                this.rowData = [];
                this.showErrorOverlay("You have not permission");
              }
              // Hide "Actions" column if `edit` is false
              if (this.gridApi) {
                this.gridApi.setColumnsVisible(["actions"], this.salaryAccess.edit);
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

  getSalaryList() {
    this._salaryService.getSalaryList().subscribe(
      {
        next: (result: salaryListI) => {
          if (result.success) {
            this.rowData = result.data;
            this._changeDetectorRef.detectChanges();
          } else {
            console.log("No salar data returned from API.");
            this.showErrorOverlay('Data is not Found');
            this.rowData = [];
          }
        }, error: (err) => {
          this.showErrorOverlay('Data is not Found');
          this.rowData = [];
          console.error("Error Status:", err.status);
          console.error("Error Message:", err.error);
          let errorMessage = "An error occurred while fetching data.";
          if (err.status === 404 && err.error.message) {
            errorMessage = err.error.message;

          }
          // this.handleError(err.error.message);
        },
      }
    );
  }

  gridOptions = {
    noRowsOverlayComponentParams: {
      noRowsMessageFunc: () => "No salary data found for this employee.",
    },
  };

  onGridReady(params: GridReadyEvent<any>) {
    this.gridApi = params.api;
    this.gridApi.hideOverlay();
    this.getPermissionToAccessPage(Number(localStorage.getItem('role')));
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

  addSalary() {
    this.formHeading = "Create";
    this.isSideDrawerOpen = true;
    this.salaryRowId = 0;
  }

  pageHeader_customer(customerHeadingName: string) {
    this.HeadingName = customerHeadingName;
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
      this.getSalaryList();
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

  updateSalary(event: any): void {
    if (event.event.target.closest(".edit-icon")) {
      const salaryRowId = event.event.target.closest(".edit-icon").getAttribute("data-id");
      this.isSideDrawerOpen = true;
      this.formHeading = "Update";
      this.salaryRowId = Number(salaryRowId);
    }

    if (event.event.target.closest(".delete-icon")) {
      const salaryRowId = event.event.target.closest(".delete-icon").getAttribute("data-id");
      this.openDeleteModal(Number(salaryRowId));
    }
  }

  openDeleteModal(salaryId: number): void {
    const dialogRef = this.dialog.open(DeleteModalComponent, {
      width: "400px",
      height: "175px",
      disableClose: true,
      data: "Salary",
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result == true) {
        this.deleteRow(salaryId);
      } else {
      }
    });
  }

  deleteRow(salaryId: number): void {
    if (!salaryId) return;
    // Call API to delete salary
    this._salaryService.deleteSalaryById(salaryId).subscribe({
      next: (response: any) => {
        this._successMessage.openFromComponent(SuccessModalComponent, {
          data: { message: response.message },
          duration: 4000, // 4 seconds
          panelClass: ["custom-toast"],
          verticalPosition: "top",
          horizontalPosition: "right",
        });
        this.getSalaryList();
      },
      error: (err) => {
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
}
