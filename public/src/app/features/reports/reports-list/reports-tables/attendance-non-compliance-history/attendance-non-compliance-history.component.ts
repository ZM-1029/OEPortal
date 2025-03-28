import { NgClass } from "@angular/common";
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { FormGroup } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AgGridAngular } from "ag-grid-angular";
import { ModuleRegistry, AllCommunityModule, GridReadyEvent, GridApi } from "ag-grid-community";
import { RolePermissionService } from "src/app/features/role-permissions/role-permission.service";
import { RolePermissionComponent } from "src/app/features/role-permissions/role-permission/role-permission.component";
import { SuccessModalComponent } from "src/app/shared/components/UI/success-modal/success-modal.component";
import { ncTypeCountsI, nonComplianceI } from "src/app/shared/types/nonCompliance.type";
import { rolePermissionListI } from "src/app/shared/types/roles.type";

ModuleRegistry.registerModules([AllCommunityModule]);
@Component({
  selector: "app-attendance-non-compliance-history",
  imports: [
    AgGridAngular,
    NgClass
  ],
  templateUrl: "./attendance-non-compliance-history.component.html",
  styleUrl: "./attendance-non-compliance-history.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttendanceNonComplianceHistoryComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() attendanceRowData: nonComplianceI[] = [];
  @Input() ncTypeCounts: ncTypeCountsI | any;
  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;
  @Output() isActiveReportsDropDownShow = new EventEmitter<boolean>();
  attendanceNcTypeCounts: ncTypeCountsI | any;
  rowData: nonComplianceI[] = [];
  public currentPageNumber: number = 1;
  public currentPageSize: number = 15;
  public paginationPageSize = this.currentPageSize;
  public paginationPageSizeSelector: number[] = [15, 25, 50, 100];
  getDateForm!: FormGroup;
  private gridApi!: GridApi<any>;

  reportAccess: rolePermissionListI = {
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
      pinned: "left",
      minWidth: 100,
      maxWidth: 100,
      cellStyle: () => {
        return { border: "none" };
      },
    },
    {
      field: "empId",
      headerName: "Employee Id",
      sortable: true,
      pinned: "left",
      filter: true,
      minWidth: 100,
    },
    {
      field: "employeeName",
      headerName: "Employee Name",
      sortable: true,
      pinned: "left",
      filter: true,
      minWidth: 170,
    },
    {
      field: "shiftDateFormatted",
      headerName: " Date",
      sortable: true,
      filter: true,
      pinned: "left",
      minWidth: 120,
      cellStyle: () => {
        return { border: "none" };
      },
    },
    {
      field: "ncTypeName",
      headerName: "Type of Non Compliance",
      sortable: true,
      filter: true,
      pinned: "left",
      minWidth: 240,
      cellStyle: () => {
        return { border: "none" };
      },
    },

    {
      field: "shiftStartTime",
      headerName: "Shift Start Time",
      sortable: true,
      filter: true,
      minWidth: 170,
    },
    {
      field: "shiftEndTime",
      headerName: "Shift End Time",
      sortable: true,
      filter: true,
      minWidth: 170,
    },
    {
      field: "firstIn",
      headerName: "First In",
      sortable: true,
      filter: true,
      minWidth: 190,
    },
    {
      field: "lastOut",
      headerName: "Last Out",
      sortable: true,
      filter: true,
      minWidth: 190,
    },
    {
      field: "totalHours",
      headerName: "Total Hours",
      sortable: true,
      filter: true,
      minWidth: 200,
    },
    {
      field: "status",
      headerName: "Status",
      sortable: true,
      filter: true,
      minWidth: 170,
      cellStyle: (params: { value: string }) => {
        return params.value == "Present"
          ? { color: "green" }
          : { color: "red" };
      },
    },

    {
      field: "actualFirstCheckin",
      headerName: "Actual First Checkin",
      sortable: true,
      filter: true,
      minWidth: 240,
      cellStyle: () => {
        return { backgroundColor: "rgba(201, 201, 201, 0.28)" };
      },
    },
    {
      field: "actualFirstCheckout",
      headerName: "Actual First Checkout",
      sortable: true,
      filter: true,
      minWidth: 240,
      cellStyle: () => {
        return { backgroundColor: "rgba(201, 201, 201, 0.28)" };
      },
    },
    {
      field: "actualTotalHours",
      headerName: "Actual Total Hours",
      sortable: true,
      filter: true,
      minWidth: 240,
      cellStyle: () => {
        return { backgroundColor: "rgba(201, 201, 201, 0.28)" };
      },
    },
    {
      field: "actualStatus",
      headerName: "Actual Status",
      sortable: true,
      filter: true,
      minWidth: 170,
      cellStyle: (params: { value: string }) => {
        if (params.value === "Present") {
          return {
            color: "green",
            backgroundColor: "rgba(201, 201, 201, 0.28)",
          };
        } else {
          return { color: "red", backgroundColor: "rgba(201, 201, 201, 0.28)" };
        }
        return null;
      },
    },
    {
      field: "regularisationStatus",
      headerName: "Regularisation Status",
      sortable: true,
      filter: true,
      minWidth: 240,
      cellStyle: (params: { value: string }) => {
        if (params.value === "Regularised") {
          return { color: "green" };
        }
        return null;
      },
    },
  ];

  defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
  };

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _successMessage: MatSnackBar,
    private rolePermissionService: RolePermissionService
  ) { }

  ngOnInit(): void {
    console.log("ncTypeCounts received:", this.ncTypeCounts);
    this.attendanceNcTypeCounts = this.ncTypeCounts && typeof (this.ncTypeCounts) === 'object' ? this.ncTypeCounts : {};
    this._changeDetectorRef.detectChanges();
  }

  ngOnChanges() {
    if (this.agGrid && this.attendanceRowData.length !== 0) {
      this.getPermissionToAccessPage(Number(localStorage.getItem('role')));
    } else {
      this.rowData = [];
      this.attendanceNcTypeCounts = {};
      this.showErrorOverlay("Data is not found");
    }
  }

  ngAfterViewInit() {
    this._changeDetectorRef.detectChanges();
  }

  getPermissionToAccessPage(roleId: any) {
    this.rolePermissionService.getPermissionsByRoleId(roleId).subscribe({
      next: (response) => {
        if (response.success) {
          for (const reportAccess of response.data) {
            if (reportAccess.form === "Reports") {
              this.reportAccess = reportAccess;
              if (this.reportAccess.view) {
                // this.getAttendanceNonCompliance();
                this.attendanceNcTypeCounts = this.ncTypeCounts && typeof this.ncTypeCounts === 'object' ? this.ncTypeCounts : {};
                this.rowData = this.attendanceRowData;
                this._changeDetectorRef.detectChanges();
                this.isActiveReportsDropDownShow.emit(true);
              } else {
                this.isActiveReportsDropDownShow.emit(false);
                this.rowData = [];
                this.showErrorOverlay("You have not permission");
              }
              // Hide "Actions" column if `edit` is false
              if (this.gridApi) {
                this.gridApi.setColumnsVisible(["actions"], this.reportAccess.edit);
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


  getAttendanceNonCompliance() {
    if (this.attendanceRowData.length !== 0) {
      this.rowData = this.attendanceRowData;
      this._changeDetectorRef.detectChanges();
    } else {
      this.attendanceNcTypeCounts = this.ncTypeCounts && typeof this.ncTypeCounts === 'object' ? this.ncTypeCounts : {};
      this.rowData = [];
      this.showErrorOverlay("Data is not found")
    }
  }

  objectKeys(obj: any): string[] {
    if (!obj || typeof obj !== 'object') return [];
    return Object.keys(obj);
  }

  getLabel(type: string): string {
    const labels: { [key: string]: string } = {
      "1": "Short Login Hour",
      "2": "Late Checkin",
      "3": "Early Checkout",
      "4": "Forget Checkin",
      "5": "Forget Checkout",
      "1004": "Absent"
    };
    return labels[type];
  }


  gridOptions = {
    noRowsOverlayComponentParams: {
      noRowsMessageFunc: () => "No data found for this employee.",
    },
  };

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

  //  run table..
  onGridReady(params: GridReadyEvent<any>) {
    this.gridApi = params.api;
    this.gridApi.hideOverlay();
    this.getPermissionToAccessPage(Number(localStorage.getItem('role')));
  }

  // Pagination start
  onPaginationChanged(params: any) {
    const currentPage = params.api.paginationGetCurrentPage();
    const pageSize = params.api.paginationGetPageSize();
    this.currentPageNumber = currentPage + 1;
    this.currentPageSize = pageSize;
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
