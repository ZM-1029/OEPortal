import { NgClass, NgFor } from "@angular/common";
import { AfterViewInit, ChangeDetectorRef, Component, Input, OnChanges, OnInit, ViewChild } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AgGridAngular } from "ag-grid-angular";
import { ModuleRegistry, AllCommunityModule, GridApi, GridReadyEvent } from "ag-grid-community";
import { SuccessModalComponent } from "src/app/shared/components/UI/success-modal/success-modal.component";
import { ncTypeCountsI, nonComplianceI } from "src/app/shared/types/nonCompliance.type";

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);
@Component({
  selector: "app-non-compliance-attendance",
  imports: [AgGridAngular],
  templateUrl: "./non-compliance-attendance.component.html",
  styleUrl: "./non-compliance-attendance.component.scss",
})
export class NonComplianceAttendanceComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() attendanceRowData: nonComplianceI[] = [];
  @Input() ncTypeCounts: any;
  attendanceNcTypeCounts: any;
  rowData: any
  public currentPageNumber: number = 1;
  public currentPageSize: number = 15;
  public paginationPageSize = this.currentPageSize;
  public paginationPageSizeSelector: number[] = [15, 25, 50, 100];
  getDateForm!: FormGroup;
  private gridApi!: GridApi<any>;

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
      field: "shiftDateFormatted",
      headerName: "Shift Date",
      sortable: true,
      filter: true,
      pinned: "left",
      minWidth: 220,
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
  ) { }

  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;

  ngOnInit(): void {
    console.log("ncTypeCounts received:", this.ncTypeCounts);
    this.attendanceNcTypeCounts = this.ncTypeCounts && typeof (this.ncTypeCounts) === 'object' ? this.ncTypeCounts : {};
    this._changeDetectorRef.detectChanges();
  }

  ngOnChanges() {
    if (this.agGrid && this.attendanceRowData.length!==0) {
      this.attendanceNcTypeCounts = this.ncTypeCounts && typeof this.ncTypeCounts === 'object' ? this.ncTypeCounts : {};
      this.rowData=this.attendanceRowData;
      this._changeDetectorRef.detectChanges();
    } else {
      this.rowData=[];
      this.attendanceNcTypeCounts = {};
      this.showErrorOverlay("Data is not found");
     
    }
  }

  ngAfterViewInit() {
    this._changeDetectorRef.detectChanges();
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
    return labels[type] ;
  }

 
  getAttendanceNonCompliance() {
    if (this.attendanceRowData.length !== 0) {
      this.rowData = this.attendanceRowData;
      this._changeDetectorRef.detectChanges();
    } else {
      this.attendanceNcTypeCounts = this.ncTypeCounts && typeof this.ncTypeCounts === 'object' ? this.ncTypeCounts : {};
      this.rowData=[];
      this.showErrorOverlay("Data is not found")
    }
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
    this.getAttendanceNonCompliance()
  }

  // Pagination start
  onPaginationChanged(params: any) {
    const currentPage = params.api.paginationGetCurrentPage();
    const pageSize = params.api.paginationGetPageSize();
    this.currentPageNumber = currentPage + 1;
    this.currentPageSize = pageSize;
  }


}
