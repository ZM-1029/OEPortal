import { AfterViewInit, ChangeDetectorRef, Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AgGridModule, AgGridAngular } from 'ag-grid-angular';
import { ModuleRegistry, AllCommunityModule, GridApi, GridReadyEvent } from 'ag-grid-community';
import { ncTypeCountsI, nonComplianceI } from 'src/app/shared/types/nonCompliance.type';
// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);
@Component({
  selector: 'app-timesheet-non-compliance',
  imports: [AgGridModule],
  templateUrl: './timesheet-non-compliance.component.html',
  styleUrl: './timesheet-non-compliance.component.scss'
})
export class TimesheetNonComplianceComponent implements OnInit,OnChanges,AfterViewInit {
  @Input() timesheetRowData: nonComplianceI[] = [];
  @Input() ncTypeCounts!:ncTypeCountsI ;
  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;
  rowData:nonComplianceI[]=[];
  public currentPageNumber: number = 1;
  public currentPageSize: number = 15;
  public paginationPageSize = this.currentPageSize;
  public paginationPageSizeSelector: number[] = [15, 25, 50, 100];
  getDateForm!: FormGroup;
  timesheetNcTypeCounts:ncTypeCountsI|any;
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
    },  {
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
      headerName: "Date",
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

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
  ) { }

 ngOnInit(): void {
  this.timesheetNcTypeCounts = this.ncTypeCounts && typeof (this.ncTypeCounts) === 'object' ? this.ncTypeCounts : {};
  this._changeDetectorRef.detectChanges();
}

  ngOnChanges() {
    if (this.agGrid && this.timesheetRowData.length!==0) {
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

  getTimesheetNonCompliance() {
    if (this.timesheetRowData.length!=0) {
      this.rowData = this.timesheetRowData;
      this._changeDetectorRef.detectChanges();
    }else{
      this.rowData=[];
      this.showErrorOverlay("Data is not found");
    }
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

}
