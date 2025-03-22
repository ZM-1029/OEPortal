import { AfterViewInit, ChangeDetectorRef, Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import { AllCommunityModule, GridApi, GridReadyEvent, ModuleRegistry } from 'ag-grid-community';
import { nonComplianceI, ncTypeCountsI } from 'src/app/shared/types/nonCompliance.type';
import { ReportsService } from '../../../reports.service';
import { getEmployeeProfitDetailListI } from 'src/app/shared/types/reports.type';
import { MatSnackBar } from '@angular/material/snack-bar';

ModuleRegistry.registerModules([AllCommunityModule]);
@Component({
  selector: 'app-efficiency-reports',
  imports: [AgGridAngular],
  templateUrl: './efficiency-reports.component.html',
  styleUrl: './efficiency-reports.component.scss'
})
export class EfficiencyReportsComponent implements OnInit,OnChanges,AfterViewInit{
  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;
  rowData: getEmployeeProfitDetailListI[] = [];
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
      field: "employeeID",
      headerName: "Salary",
      sortable: true,
      filter: true,
      minWidth: 100,
    },
    {
      field: "salary",
      headerName: "Salary",
      sortable: true,
      filter: true,
      minWidth: 100,
    },
    {
      field: "billedAmount",
      headerName: "Billed Amount",
      sortable: true,
      filter: true,
      minWidth: 170,
    },
    {
      field: "profitFactor",
      headerName: "Profit Factor",
      sortable: true,
      filter: true,
      minWidth: 170,
    },
    {
      field: "month",
      headerName: "Month",
      sortable: true,
      filter: true,
      minWidth: 120,
    },
    {
      field: "year",
      headerName: "Year",
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
    private reportsService:ReportsService,
    private _successMessage: MatSnackBar
  ) { }

  ngOnInit(): void {
    // console.log("ncTypeCounts received:", this.ncTypeCounts);
    // this.attendanceNcTypeCounts = this.ncTypeCounts && typeof (this.ncTypeCounts) === 'object' ? this.ncTypeCounts : {};
    this._changeDetectorRef.detectChanges();
  }

  ngOnChanges() {
    
  }

  ngAfterViewInit() {
    this._changeDetectorRef.detectChanges();
  }

   
  getEmployeeProfitDetails() {
    this.reportsService.getEmployeeProfitDetail().subscribe(
      {
        next:((response)=>{
          if(response.success){
            this.rowData=response.data
          }else{
            this.handleError(response.message)
          }
        }),
        error:((err)=>{
          this.handleError(err.error.message)
        })
      }
    )
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
    this.getEmployeeProfitDetails();
    if(this.rowData.length==0){
      this.showErrorOverlay("Data is not found")
    }
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
