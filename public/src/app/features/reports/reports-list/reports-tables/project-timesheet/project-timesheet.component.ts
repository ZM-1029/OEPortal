import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, input, OnChanges, Output, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { ReportsService } from '../../../reports.service';
import { CommonModule, NgClass } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AgGridAngular } from 'ag-grid-angular';
import { ModuleRegistry, AllCommunityModule, GridApi, GridReadyEvent } from 'ag-grid-community';
import { projectTimesheetI } from 'src/app/shared/types/reports.type';
import { MultiSelectDropdownComponent } from 'src/app/shared/components/UI/multi-select-dropdown/multi-select-dropdown.component';
import { MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
ModuleRegistry.registerModules([AllCommunityModule]);
@Component({
  selector: 'app-project-timesheet',
  imports: [AgGridAngular, MultiSelectDropdownComponent, NgClass, MatDatepickerModule,
    MatFormFieldModule, MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    CommonModule,
    FormsModule,],
  templateUrl: './project-timesheet.component.html',
  styleUrl: './project-timesheet.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectTimesheetComponent implements OnChanges {
  startDate: string = "";
  endDate: string = "";
  @Input() activeTable!: string;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['activeTable'].currentValue == 'project-timesheet') {
      this.GetAllProjectsForDropdown();
      this.setDefaultDates()
    }
  }
  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;
  rowData: projectTimesheetI[] = [];
  public currentPageNumber: number = 1;
  public currentPageSize: number = 15;
  public paginationPageSize = this.currentPageSize;
  public paginationPageSizeSelector: number[] = [15, 25, 50, 100];
  getDateForm!: FormGroup;
  private gridApi!: GridApi<any>;
  selectedValueMonth: any;
  allProjects: any[] = [];
  selectedProjects: any = 1;
  columnDefs: any = [
    {
      headerName: "S. No",
      valueGetter: "node.rowIndex + 1",
      sortable: false,
      filter: false,
      pinned: "left",
      lockPinned: true,
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
      filter: true,
      minWidth: 100,
    },
    {
      field: "employeeName",
      headerName: "Employee Name",
      sortable: true,
      filter: true,
      minWidth: 100,
    },
    {
      field: "employeeMailId",
      headerName: "Email",
      sortable: true,
      filter: true,
      minWidth: 100,
    },
    {
      field: "description",
      headerName: "Description",
      sortable: true,
      filter: true,
      minWidth: 170,
    },
    {
      field: "dbWorkDate",
      headerName: "Date",
      sortable: true,
      filter: true,
      valueFormatter: this.dateFormatter,
      minWidth: 170,
    },
    {
      field: "hours",
      headerName: "Hours",
      sortable: true,
      filter: true,
      minWidth: 170,
    },
    {
      field: "jobName",
      headerName: "Job Name",
      sortable: true,
      filter: true,
      minWidth: 170,
    },
    {
      field: "projectName",
      headerName: "project Name",
      sortable: true,
      filter: true,
      minWidth: 170,
    }
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



  ngAfterViewInit() {
    this._changeDetectorRef.detectChanges();
  }

  selectedProject(event: any) {
    if (event == 0) {
      this.selectedProjects = 1;
      this.GetTimesheetByDurationAndProject();
    } else {
      console.log(event, "event");
      this.selectedProjects = event;
      this.GetTimesheetByDurationAndProject();
    }
  }
  // dropdown selected Output


  GetAllProjectsForDropdown() {
    this.reportsService.getAllProjects().subscribe(
      {
        next: ((response: any) => {
          if (response.success) {
            this.allProjects = response?.data;
            this._changeDetectorRef.detectChanges();
          } else {
            // this.showSuccessMessage(response.message)
            console.error(response.message);
          }
        }), error: ((error) => {
          // this.handleError()
          console.error(error);
        })
      }
    );
  }

  GetTimesheetByDurationAndProject() {
    this.reportsService.getTimesheetByDurationAndProject(this.startDate, this.endDate, this.selectedProjects).subscribe(
      {
        next: ((response) => {
          if (response.success) {
            this.rowData = response.data;
            this._changeDetectorRef.detectChanges();
          } else {
            this.rowData = [];
            this.showErrorOverlay("Data is not found")
            this.handleError(response.message)
          }
        }),
        error: ((err) => {
          this.rowData = [];
          this.showErrorOverlay("Data is not found")
          this.handleError(err.error.message)
        })
      }
    )
  }


  downloadExcel() {
    this.reportsService.downloadTimesheetByDurationAndProject(this.startDate, this.endDate, this.selectedProjects)
      .subscribe({
        next: (blob: Blob) => {
          const fileName = `Timesheet_${new Date().toISOString().slice(0, 10)}.xlsx`;
          const downloadURL = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = downloadURL;
          link.download = fileName;
          link.click();
          window.URL.revokeObjectURL(downloadURL);
          this._changeDetectorRef.detectChanges();
        },
        error: (err) => {
          this.rowData = [];
          this.showErrorOverlay("Data is not found");
          this.handleError(err.error?.message || "Download failed");
        }
      });
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
    // this.getEfficiencyReportsCustomer();
    // this.GetTimesheetByDurationAndProject();
    if (this.rowData.length == 0) {
      setTimeout(() => {
        if (this.gridApi) {
          this.showErrorOverlay("Data is not found");
        }
      });
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

  // Toggle column selection
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

  dateFormatter(params: any) {
    if (params.value) {
      const date = new Date(params.value);
      const day = date.getDate().toString().padStart(2, '0');
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    }
    return '';
  }

  // Check if column is displayed
  isColumnDisplayed(column: any): boolean {
    return this.displayedColumns.some((col) => col.field === column.field);
  }

  // Prevent dropdown from closing while allowing checkbox toggle
  preventClose(event: MouseEvent) {
    event.stopPropagation();
  }
  // for Manage Columns end

  // date piker start
  setDefaultDates() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    this.startDate = this.formatDate(firstDay);
    this.endDate = this.formatDate(lastDay);
  }

  getStartDate(event: MatDatepickerInputEvent<Date> | any) {
    if (event.value) {
      this.startDate = this.formatDate(event.value);
      this.checkAndFetchAttendance();
    }
  }

  checkAndFetchAttendance() {
    if (this.startDate && this.endDate) {
      this.GetTimesheetByDurationAndProject();
    }
  }

  formatDate(date: Date): string {
    return date.getFullYear() + "-" + (date.getMonth() + 1).toString().padStart(2, "0") + "-" + date.getDate().toString().padStart(2, "0");
  }

  dateFilter = (d: Date | null): boolean => {
    if (!this.startDate) return true;
    return d! >= new Date(this.startDate);
  };

  startDateFilter = (d: Date | null): boolean => {
    if (!d) return false;
    // Disable future dates (optional)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (d > today) return false;
    // If endDate is selected, disable dates after it
    if (this.endDate) {
      const endDate = new Date(this.endDate);
      endDate.setHours(0, 0, 0, 0);
      return d <= endDate;
    }

    return true;
  };

  getEndDate(event: MatDatepickerInputEvent<Date> | any) {
    if (event.value) {
      const selectedEndDate = event.value;
      if (selectedEndDate < new Date(this.startDate)) {
        return;
      }
      this.endDate = this.formatDate(selectedEndDate);
      this.checkAndFetchAttendance();
    }
  }

  // date piker end

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
