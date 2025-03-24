import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AgGridAngular } from 'ag-grid-angular';
import { Select2, Select2Data } from "ng-select2-component";
import { ModuleRegistry, AllCommunityModule, GridApi, GridReadyEvent } from 'ag-grid-community';
import { MultiSelectDropdownComponent } from 'src/app/shared/components/UI/multi-select-dropdown/multi-select-dropdown.component';
import { employeesDropdownI, efficiencyReportsEmployeeDetailI } from 'src/app/shared/types/reports.type';
import { ReportsService } from '../../../reports.service';
import { SingleSelectDropdownComponent } from 'src/app/shared/components/UI/single-select-dropdown/single-select-dropdown.component';
import { MultiSelcetObjectDropdownComponent } from 'src/app/shared/components/UI/multi-selcet-object-dropdown/multi-selcet-object-dropdown.component';

ModuleRegistry.registerModules([AllCommunityModule]);
@Component({
  selector: 'app-efficiency-report-employees',
  imports: [AgGridAngular, MultiSelectDropdownComponent,SingleSelectDropdownComponent,MultiSelcetObjectDropdownComponent],
  templateUrl: './efficiency-report-employees.component.html',
  styleUrl: './efficiency-report-employees.component.scss'
})
export class EfficiencyReportEmployeesComponent {
  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;
  rowData: efficiencyReportsEmployeeDetailI[] = [];
  public currentPageNumber: number = 1;
  public currentPageSize: number = 15;
  public paginationPageSize = this.currentPageSize;
  public paginationPageSizeSelector: number[] = [15, 25, 50, 100];
  getDateForm!: FormGroup;
  private gridApi!: GridApi<any>;
  employeeId: any = '1';
  selectedValueMonth: any;
  selectedValueYear: any = '2025';
  dropdownHeading: string = "Month";
  yearDropdown: any[] = [];
  reportsEmployeesummary: any[] = [];
  Year: { value: string; label: string }[] = [];
  allEmployees: { id: string; name: string }[] = [];
  Month: { id: string; name: string }[] = [
    { id: '1', name: 'January' },
    { id: '2', name: 'February' },
    { id: '3', name: 'March' },
    { id: '4', name: 'April' },
    { id: '5', name: 'May' },
    { id: '6', name: 'June' },
    { id: '7', name: 'July' },
    { id: '8', name: 'August' },
    { id: '9', name: 'September' },
    { id: '10', name: 'October' },
    { id: '11', name: 'November' },
    { id: '12', name: 'December' }
  ]
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
      field: "profitratio",
      headerName: "Profit Ratio",
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
    private reportsService: ReportsService,
    private _successMessage: MatSnackBar
  ) { }

  ngOnInit(): void {
    this._changeDetectorRef.detectChanges();
    this.selectedValueMonth = new Date().getMonth()+1;
    const currentYear = new Date().getFullYear();
    this.generateYears(2021, currentYear);
    this._changeDetectorRef.detectChanges();
    this.GetEmployeesForDropdown();
  }

  ngOnChanges() {

  }

  ngAfterViewInit() {
    this._changeDetectorRef.detectChanges();
  }

  generateYears(startYear: number, endYear: number) {
    for (let year = startYear; year <= endYear; year++) {
      this.yearDropdown.push({ value: year.toString(), label: year.toString() });
    }
    this.yearDropdown.reverse();
    console.log("Generated Years:", this.yearDropdown);
    this._changeDetectorRef.detectChanges();
  }

  // dropdown selected Output

  selectedYear(event: any) {
    console.log(event);
    this.selectedValueYear = event
    this.getEfficiencyReportsEmployee();
  }
  selectedEmployee(event: any) {
    this.employeeId = event
    this.getEfficiencyReportsEmployee();
  }
  selectedMonth(event: any) {
    this.selectedValueMonth = event;
    this.getEfficiencyReportsEmployee();
  }
  // dropdown selected Output

  GetEmployeesForDropdown() {
    this.reportsService.GetEmployeesForDropdown().subscribe({
      next: (response) => {
        this.allEmployees = response.data.map((obj: employeesDropdownI) => ({
          id: obj.employeeID,
          name: `(${obj.employeeID}) - ${obj.firstName} ${obj.lastName}`,
        }));

        this._changeDetectorRef.detectChanges();
      },
      error: (err) => {
        console.error("Error fetching employees:", err);
      }
    });
  }


  getEfficiencyReportsEmployee() {
    this.reportsService.getEfficiencyReportsEmployee(this.employeeId, this.selectedValueMonth, this.selectedValueYear).subscribe(
      {
        next: ((response) => {
          if (response.success) {
            this.reportsEmployeesummary = Object.entries(response.summary).map(([key, value]) => ({
              key, value
            }));
            this.rowData = response.details;
            this._changeDetectorRef.detectChanges();
          } else {
            this.handleError(response.message)
          }
        }),
        error: ((err) => {
          this.handleError(err.error.message)
        })
      }
    )
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
    this.getEfficiencyReportsEmployee();
    if (this.rowData.length == 0) {
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
