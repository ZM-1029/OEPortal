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
import { Router } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SuccessModalComponent } from "src/app/shared/components/UI/success-modal/success-modal.component";
import { rolePermissionListI } from "src/app/shared/types/roles.type";
import { RolePermissionService } from "../../role-permissions/role-permission.service";

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
  public employeeId: string = "";
  public currentPageNumber: number = 1;
  public isSideDrawerOpen: boolean = false;
  public currentPageSize: number = 15;
  public paginationPageSize = this.currentPageSize;
  public paginationPageSizeSelector: number[] = [15, 25, 50, 100];
  private gridApi!: GridApi<any>;
  rowData: employeeType[] | undefined;
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
      sortable: true,
      filter: true,
      maxWidth: 100,
      pinned: "left",
    },
    {
      field: "employeeID",
      headerName: "Employee Id",
      sortable: true,
      filter: true,
      minWidth: 120,
      pinned: "left",
    },
    {
      field: "firstName",
      headerName: "Employee",
      cellRenderer: (params: any) => this.combineName(params),
      sortable: true,
      filter: true,
      minWidth: 170,
      pinned: "left",
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
      minWidth: 180,
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
    private _successMessage: MatSnackBar,
    private rolePermissionService:RolePermissionService
  ) { }

  
  ngOnInit(): void {
    this.pageHeader_employee(this.HeadingName);
    // this.getEmployeesList();
  }

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
          this.handleError("please try again leter");
        }
      },
      error: (err) => {
        this.handleError("please try again leter");
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
              if(result.success){
                this.rowData = result.employees;
              for (let i of this.rowData) {
                i.employeestatus == "Active"
                  ? this.activeEmployees++
                  : i.employeestatus == "Terminated"
                    ? this.terminatedEmployees++
                    : this.resignedEmployees++;
              }
              this.totalCount = result.totalCount;
              this.currentPageNumber = result.pageNumber;
              this.currentPageSize = result.pageSize;
              this.paginationPageSizeSelector = [15, 50, 100];
              this._changeDetectorRef.detectChanges();
              }else{
                this.showErrorOverlay(result.message);
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
    this.getPermissionToAccessPage(Number(localStorage.getItem('role')))
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


  export(event: Event) {
    alert("export");
  }

  onRowClick(row: any) {
    this.employeeId = row.data.employeeID;
    this._employeeService.sendRowData(row.data);
    this.isSideDrawerOpen = true;
  }

  
  // side Drawer close
  sideDrawer() {
    if (this.isSideDrawerOpen) {
      this.isSideDrawerOpen = false;
    }
  }

  // for Manage Columns start
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

  // for Manage Columns end

  navigateToDetails(empId: string) {
    if (empId !== null) {
      this._router.navigateByUrl("/admin/employee/" + empId);
    }
  }

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
