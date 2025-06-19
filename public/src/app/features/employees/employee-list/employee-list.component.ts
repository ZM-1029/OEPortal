import {
  ChangeDetectorRef,
  Component,
  OnChanges,
  OnInit,
  SimpleChanges,
} from "@angular/core";
import { AgGridAngular } from "ag-grid-angular";
import { AllCommunityModule, GridApi, GridReadyEvent, ModuleRegistry } from "ag-grid-community";
import {
  employeeType,
  employeeListI,
} from "../../../shared/types/employees.type";
import { CommonModule } from "@angular/common";
import { PageHeaderComponent } from "../../../shared/components/UI/page-header/page-header.component";
import { SideDrawerComponent } from "../../../shared/components/UI/side-drawer/side-drawer.component";
import { FormsModule } from "@angular/forms";
import { EmployeesService } from "../employees.service";
import { LoaderComponent } from "../../../shared/components/UI/loader/loader.component";
import { EmployeeSideDrawerComponent } from "../employee-side-drawer/employee-side-drawer.component";
import { ActivatedRoute, Router } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SuccessModalComponent } from "src/app/shared/components/UI/success-modal/success-modal.component";
import { rolePermissionListI } from "src/app/shared/types/roles.type";
import { RolePermissionService } from "../../role-permissions/role-permission.service";
import { ManageColumnStateService } from "src/app/shared/services/manage-column-state.service";
import { DeleteModalComponent } from "src/app/shared/components/UI/delete-modal/delete-modal.component";
import { MatDialog } from "@angular/material/dialog";


ModuleRegistry.registerModules([AllCommunityModule]);
@Component({
  selector: "app-employee-list",
  imports: [
    AgGridAngular,
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    SideDrawerComponent,
    LoaderComponent,
    EmployeeSideDrawerComponent,
    MatButtonModule,
  ],
  templateUrl: "./employee-list.component.html",
  styleUrl: "./employee-list.component.scss",
})
export class EmployeeListComponent implements OnInit, OnChanges {
  public totalCount: number = 0;
  public activeEmployees: number = 0;
  public terminatedEmployees: number = 0;
  public resignedEmployees: number = 0;
  public abscondedEmployees: number = 0;
  public employeeId: string = "";
  public currentPageNumber: number = 1;
  public isSideDrawerOpen: boolean = false;
  public currentPageSize: number = 15;
  public paginationPageSize = this.currentPageSize;
  public paginationPageSizeSelector: number[] = [15, 25, 50, 100];
  private gridApi!: GridApi<any>;
  rowData: employeeType[] = [];
  HeadingName: string = "employees";

  employeeAccess: rolePermissionListI = {
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
      maxWidth: 100,
      minWidth: 100,
      pinned: "left",
      lockPinned: true,
    },
    {
      headerName: "Actions",
      field: "actions",
      cellRenderer: (params: any) => this.renderActionIcons(params),
      minWidth: 100,
      maxWidth: 100,
      cellClass: "hover-effect-cell",
      pinned: "right",
      lockPinned: true,
      sortable: false,
      filter: false,
      cellStyle: () => {
        return { border: "none", cursor: "pointer" };
      },
    },
    {
      field: "employeeID",
      headerName: "Employee Id",
      sortable: true,
      filter: true,
      minWidth: 120,
      pinned: "left",
      lockPinned: true,
    },
    {
      field: "firstName",
      headerName: "Employee",
      cellRenderer: (params: any) => this.combineName(params),
      sortable: true,
      filter: true,
      minWidth: 170,
      pinned: "left",
      lockPinned: true,
      cellStyle: () => {
        return { border: "none" };
      },
    },
    {
      field: "emailID",
      headerName: "Email",
      sortable: true,
      filter: true,
      minWidth: 240,
    },
    {
      field: "department",
      headerName: "Department",
      sortable: true,
      filter: true,
      minWidth: 190,
    },
    {
      field: "age",
      headerName: "Age",
      sortable: true,
      filter: true,
      minWidth: 100,
    },
    {
      field: "gender",
      headerName: "Gender",
      sortable: true,
      filter: true,
      minWidth: 120,
    },
    {
      field: "mobile",
      headerName: "Mobile",
      sortable: true,
      filter: true,
      minWidth: 150,
    },
    {
      field: "employeestatus",
      headerName: "Employee Status",
      cellStyle: (params: { value: string }) => {
        return params.value == "Active" ? { color: "green" } : { color: "red" };
      },
      sortable: true,
      filter: true,
      minWidth: 200,
    },
    {
      field: "dateofjoining",
      headerName: "Date of Joining",
      sortable: true,
      filter: true,
      minWidth: 150,
    },
    {
      field: "dateOfBirth",
      headerName: "Date of Birth",
      sortable: true,
      filter: true,
      minWidth: 150,
    },
  ];


  defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
  };



  constructor(
    private _employeeService: EmployeesService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _successMessage: MatSnackBar,
    private dialog: MatDialog,
    private rolePermissionService: RolePermissionService,
    private manageColumnStateService: ManageColumnStateService
  ) { }

  // Manage Column start
  allColumns: any[] = [];
  displayedColumns: any[] = [];

  ngOnInit(): void {
    this.pageHeader_employee(this.HeadingName);
    this.initializeColumns();
  }

  private initializeColumns() {
    this.allColumns = [...this.columnDefs];
    if (this.manageColumnStateService.getAllColumns().length === 0) {
      this.manageColumnStateService.setAllColumns(this.allColumns);
      this.manageColumnStateService.setDisplayedColumns(this.allColumns);
    }
    this.displayedColumns = this.manageColumnStateService.getDisplayedColumns();
    this.columnDefs = [...this.displayedColumns];
  }

  isColumnDisplayed(column: any): boolean {
    return this.manageColumnStateService.isColumnDisplayed(column);
  }

  toggleColumn(column: any): void {
    this.manageColumnStateService.toggleColumn(column);
    this.displayedColumns = this.manageColumnStateService.getDisplayedColumns();
    this.columnDefs = [...this.displayedColumns];
  }

  // Manage Column end

  ngOnChanges(changes: SimpleChanges): void {
    this.sideDrawer();
  }

  pageHeader_employee(employeeHeadingName: string) {
    this.HeadingName = employeeHeadingName;
  }

  getPermissionToAccessPage(roleId: any) {
    this.rolePermissionService.getPermissionsByRoleId(roleId).subscribe({
      next: (response) => {
        if (response.success) {
          for (const employeeAccess of response.data) {
            if (employeeAccess.form === "Employees") {
              this.employeeAccess = employeeAccess;
              if (this.employeeAccess.view) {
                this.getEmployeesList();
              } else {
                this.rowData = [];
                this.showErrorOverlay("You have not permission");

              }
              // Hide "Actions" column if `edit` is false
              if (this.gridApi) {
                this.gridApi.setColumnsVisible(["actions"], this.employeeAccess.edit);
              }

              this._changeDetectorRef.detectChanges();
            }
          }
        } else {
          this.handleError("please try again later");
          console.error("error", response.message);
        }
      },
      error: (err) => {
        this.handleError("please try again later");
        console.error("error", err);
      },
    });
  }


  getEmployeesList() {
    this._employeeService
      .getEmployeesList(this.currentPageNumber, this.currentPageSize)
      .subscribe(
        {
          next: (
            (result: employeeListI) => {
              if (result.success) {
                this.rowData = result.employees;
                this.terminatedEmployees = result.statusCount.terminated;
                this.activeEmployees = result.statusCount.active;
                this.resignedEmployees = result.statusCount.resigned;
                this.abscondedEmployees = result.statusCount.absconded;
                this.totalCount = result.totalCount;
                this.currentPageNumber = result.pageNumber;
                this.currentPageSize = result.pageSize;
                this.paginationPageSizeSelector = [15, 50, 100];
                this._changeDetectorRef.detectChanges();
              } else {
                this.showErrorOverlay(result.message);
                console.error("error", result.message);
              }
            }
          ),
          error: (err) => {
            let errorMessage = "An error occurred while fetching data.";
            if (err.status === 404 && err.error.message) {
              errorMessage = err.error.message;
              this.showErrorOverlay(errorMessage);
            }
            this.handleError(err.error.message);
            console.error("error", err);
          },
        }
      );
  }

  // it show message when api is false .... start

  gridOptions = {
    noRowsOverlayComponentParams: {
      noRowsMessageFunc: () => "Data is not found",
    },
  };

  onGridReady(params: GridReadyEvent<any>) {
    this.gridApi = params.api;
    this.gridApi.hideOverlay();
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
          overlay.innerHTML = `<span style="color:  #2e3b64; font-weight: bold;">${message}</span>`;
        }
        this._changeDetectorRef.detectChanges();
      }, 100);
    }
  }

  // it show message when api is false .... end

  onPaginationChanged(params: any) {
    const currentPage = params.api.paginationGetCurrentPage();
    const pageSize = params.api.paginationGetPageSize();
    this.currentPageNumber = currentPage + 1;
    this.currentPageSize = pageSize;
  }


  onRowClick(event: any) {
    const target = event.event?.target as HTMLElement;
    if (target.closest('.edit-icon') || target.closest('.delete-icon')) {
      return;
    }
    this.employeeId = event.data.employeeID;
    this._employeeService.sendRowData(event.data);
    this.isSideDrawerOpen = true;
  }


  // side Drawer close
  sideDrawer() {
    if (this.isSideDrawerOpen) {
      this.isSideDrawerOpen = false;
    }
  }

  navigateToDetails(empId: string) {
    if (empId) {
      this._router.navigate([empId], { relativeTo: this._activatedRoute });
    }
  }

  employeeAdd() {
    this._router.navigate(['add'], { relativeTo: this._activatedRoute });
  }

  // navigateToDetails(empId: string) {
  //   if (empId !== null) {
  //     this._router.navigateByUrl("/admin/employee/" + empId);
  //   }
  // }

  // employeeAdd() {
  //   this._router.navigateByUrl("/admin/employee/add");
  // }

  combineName(params: any): string {
    const firstName = params.data.firstName;
    const lastName = params.data.lastName;
    return `
      <div style="display: flex; align-items: center;">
        <span class='me-1'>${firstName}</span>
        <span>${lastName}</span>
      </div>
    `;
  }

  
  preventClose(event: MouseEvent) {
    event.stopPropagation();
  }
  // for Manage Columns end

  //  Function to handle API errors
  private handleError(err: string) {
    this._successMessage.open(err, "Close", {
      duration: 4000,
      panelClass: ["error-toast"],
      verticalPosition: "top",
      horizontalPosition: "right",
    });
  }

  // delete customer
  updateCustomer(event: any): void {
    if (event.event.target.closest(".edit-icon")) {
      const selectedEmpId = event.event.target.closest(".edit-icon").getAttribute("data-id");
      this._router.navigate(['edit', selectedEmpId], { relativeTo: this._activatedRoute });
    }
    if (event.event.target.closest(".delete-icon")) {
      const selectedEmpId = event.event.target.closest(".delete-icon").getAttribute("data-id");

      this.openDeleteModal(selectedEmpId);
    }
  }


  openDeleteModal(empId: string): void {
    const dialogRef = this.dialog.open(DeleteModalComponent, {
      width: "400px",
      height: "175px",
      disableClose: false,
      data: "Employee",
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result == true) {
        console.log("Delete confirmed");
        this.deleteRow(empId);
      } else {
        console.log("Delete action canceled");
      }
    });
  }

  deleteRow(empId: string) {
    this._employeeService.deleteEmployeeById(empId).subscribe({
      next: (response: any) => {
        this.handleError(response.message);
        this.getEmployeesList();
      },
      error: (err) => {
        this.handleError(err.error.message || "Error deleting Employe:");
        console.error("Error deleting row:", err);
      },
    });
  }
  // // delate Customer end


  renderActionIcons(params: any): string {
    return `
      <div class="action-icons d-flex align-items-center justify-content-around">
        <span class="icon-container text-primary edit-icon" data-id="${params.data.employeeID}" style="display: block; width: 20px; height: 20px;">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
          </svg>
        </span>
        <span class="icon-container text-danger delete-icon" data-id="${params.data.employeeID}" style="display: block; width: 20px; height: 20px;">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
        </span>
      </div>
    `;
  }

}
