import { NgClass } from "@angular/common";
import { AfterViewInit, ChangeDetectorRef, Component, Input, OnChanges, OnInit, ViewChild } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AgGridAngular, AgGridModule } from "ag-grid-angular";
import { ModuleRegistry, AllCommunityModule, GridApi, GridReadyEvent } from "ag-grid-community";
import { SuccessModalComponent } from "src/app/shared/components/UI/success-modal/success-modal.component";
import { nonComplianceI, nonComplianceHistoryI, ncTypeCountsI } from "src/app/shared/types/nonCompliance.type";

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);
@Component({
  selector: "app-non-compliance-timesheet",
  imports: [AgGridModule],
  templateUrl: "./non-compliance-timesheet.component.html",
  styleUrl: "./non-compliance-timesheet.component.scss",
})
export class NonComplianceTimesheetComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() timesheetRowData: nonComplianceI[] = [];
  @Input() ncTypeCounts:any ;
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
      field: "description",
      headerName: "Description",
      sortable: true,
      filter: true,
      minWidth: 300,
    },
    {
      field: "jobName",
      headerName: "Job Name",
      sortable: true,
      filter: true,
      minWidth: 240,
    },
    {
      field: "timesheetHours",
      headerName: "Time Sheet Hours",
      sortable: true,
      filter: true,
      minWidth: 240,
    },
    {
      field: "actualStatus",
      headerName: "Actual Status",
      sortable: true,
      filter: true,
      minWidth: 240,
      cellStyle: (params: { value: string }) => {
        if (params.value === "Present"||params.value === "Weekend, Present") {
          return { color: "green" };
        }
        return null;
      },
    },
    {
      field: "actualTotalHours",
      headerName: "Actual Total Hours",
      sortable: true,
      filter: true,
      minWidth: 240,
    },
    {
      field: "approvalStatus",
      headerName: "Approval Status",
      sortable: true,
      filter: true,
      minWidth: 240,
    },
  ];

  defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
  };

  rowData:any
  public currentPageNumber: number = 1;
  public currentPageSize: number = 15;
  public paginationPageSize = this.currentPageSize;
  public paginationPageSizeSelector: number[] = [15, 25, 50, 100];
  getDateForm!: FormGroup;
  timesheetNcTypeCounts:any
  private gridApi!: GridApi<any>;
  
  @ViewChild(AgGridAngular) agGrid2!: AgGridAngular;
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
  ) { }

 ngOnInit(): void {
  this.timesheetNcTypeCounts = this.ncTypeCounts && typeof (this.ncTypeCounts) === 'object' ? this.ncTypeCounts : {};
  this._changeDetectorRef.detectChanges();
}


  ngOnChanges() {
    if (this.agGrid2 && this.timesheetRowData.length!==0) {
      this.timesheetNcTypeCounts = this.ncTypeCounts && typeof this.ncTypeCounts === 'object' ? this.ncTypeCounts : {};
      this.rowData=this.timesheetRowData;
      this._changeDetectorRef.detectChanges();
    } else {
      this.rowData=[];
      this.timesheetNcTypeCounts = {};
      this.showErrorOverlay("Data is not found");
      this._changeDetectorRef.detectChanges();
      
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
      "1005": "Short Timesheet Hours:",
      "1006": "Blank Timesheet Hours:",
    };
    return labels[type] ;
  }

  getTimesheetNonCompliance() {
    if (this.timesheetRowData.length!=0) {
      this.rowData = this.timesheetRowData;
      this._changeDetectorRef.detectChanges();
    }else{
      this.rowData=[]
      this.showErrorOverlay("Data is not found");
    }
  }

  gridOptions = {
    noRowsOverlayComponentParams: {
      noRowsMessageFunc: () => "Data is not found",
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
      }, 100);
      this._changeDetectorRef.detectChanges();
    }
  }

  //  run table..
  onGridReady(params: GridReadyEvent<any>) {
    this.gridApi = params.api;
    this.gridApi.hideOverlay();
    this.getTimesheetNonCompliance();
  }

  // Pagination start
  onPaginationChanged(params: any) {
    const currentPage = params.api.paginationGetCurrentPage();
    const pageSize = params.api.paginationGetPageSize();
    this.currentPageNumber = currentPage + 1;
    this.currentPageSize = pageSize;
  }

  
}
