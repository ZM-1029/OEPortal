import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewEncapsulation,
} from "@angular/core";
import { EmployeesService } from "../employees.service";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  attendanceListI,
  attendanceTypeI,
} from "../../../shared/types/employees.type";
import { DatePipe } from "@angular/common";
import { MatDialog } from "@angular/material/dialog";
import { DownloadAttendanceComponent } from "../../../shared/components/UI/download-attendance/download-attendance.component";
import { MatSnackBar } from "@angular/material/snack-bar";
import {
  AllCommunityModule,
  GridApi,
  GridReadyEvent,
  ModuleRegistry,
} from "ag-grid-community";
import { AgGridAngular } from "ag-grid-angular";
import { LoaderComponent } from "src/app/shared/components/UI/loader/loader.component";
import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from "@angular/material-moment-adapter";
import {
  provideNativeDateAdapter,
  DateAdapter,
  MAT_DATE_LOCALE,
  MAT_DATE_FORMATS,
} from "@angular/material/core";

import * as _moment from "moment";

import { default as _rollupMoment, Moment } from "moment";
import {
  MatDatepicker,
  MatDatepickerModule,
} from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";

const moment = _rollupMoment || _moment;

export const MY_FORMATS = {
  parse: {
    dateInput: "MM/YYYY",
  },
  display: {
    dateInput: "MM/YYYY",
    monthYearLabel: "MMM YYYY",
    dateA11yLabel: "LL",
    monthYearA11yLabel: "MMMM YYYY",
  },
};

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);
@Component({
  selector: "app-employee-attendance",
  imports: [
    FormsModule,
    AgGridAngular,
    LoaderComponent,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  templateUrl: "./employee-attendance.component.html",
  styleUrl: "./employee-attendance.component.scss",
  providers: [
    provideNativeDateAdapter(),
    DatePipe,
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeAttendanceComponent implements OnInit {
  @Input() employeeId!: string;
  totalWorkingHours: string[] = [];
  selectedMonth: any;
  selectedYear: any;
  years: number[] = [];
  rowData: attendanceTypeI[]=[] ;
  private gridApi!: GridApi<any>;
  public currentPageNumber: number = 1;
  public currentPageSize: number = 50;
  public paginationPageSize = this.currentPageSize;
  public paginationPageSizeSelector: number[] = [50, 100];

  columnDefs: any = [
    {
      field: "shiftDate",
      headerName: "Date",
      sortable: true,
      filter: true,
      cellRenderer: (params: any) => this.getDate(params.value),
      minWidth: 150,
    },
    {
      field: "firstIn",
      cellRenderer: (params: any) => this.getTime(params.value),
      headerName: "Check In",
      sortable: true,
      filter: true,
      minWidth: 150,
      maxWidth: 150,
    },
    {
      field: "lastOut",
      cellRenderer: (params: any) => this.getTime(params.value),
      headerName: "Check Out",
      sortable: true,
      filter: true,
      minWidth: 100,
    },
    {
      field: "status",
      headerName: "Status",
      sortable: true,
      filter: true,
      minWidth: 200,
      cellStyle: (params: { value: string }) => {
        return params.value == "Present"
          ? { color: "green" }
          : params.value == "Absent"
            ? { color: "red" }
            : { color: "rgb(252, 198, 51)" };
      },
    },
    {
      field: "totalHours",
      headerName: "Total Working hours",
      sortable: true,
      filter: true,
      minWidth: 170,
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
    private _attendanceModal: MatDialog,
    private _successMessage: MatSnackBar,
    private datePipe: DatePipe,
  ) {}

  ngOnInit(): void {
    console.log("EmployeeAttendanceComponent");
  }

  ngAfterViewInit() {
    this._changeDetectorRef.detectChanges();
  }

  date = new FormControl(moment());

  chosenYearHandler(normalizedYear: Moment) {
    const ctrlValue = this.date.value;
    ctrlValue?.year(normalizedYear.year());
    this.date.setValue(ctrlValue);
    this.getEmployeeAttendence();
  }

  chosenMonthHandler(
    normalizedMonth: Moment,
    datepicker: MatDatepicker<Moment>,
  ) {
    const ctrlValue = this.date.value;
    ctrlValue?.month(normalizedMonth.month());
    this.date.setValue(ctrlValue);
    datepicker.close();
    this.getEmployeeAttendence();
  }

  getEmployeeAttendence() {
    this.selectedMonth = this.date.value?.format("MM");
    this.selectedYear = this.date.value?.format("YYYY");
    if (this.selectedMonth && this.selectedYear) {
      this._employeeService
        .getAttendanceByID(
          this.employeeId,
          this.selectedMonth,
          this.selectedYear,
        )
        .subscribe({
          next: (response: attendanceListI) => {
            if (response.success && response.data.length > 0) {
              this.rowData = response.data;
              this.gridApi.hideOverlay();
              this._changeDetectorRef.detectChanges();
            } else {
              this.rowData = [];
              this.showErrorOverlay('Data is not found');
            }
          },
          error: (err) => {
            console.error("Error Status:", err.status);
            console.error("Error Message:", err.error);
            let errorMessage = "An error occurred while fetching data.";
            if (err.status === 404 && err.error.message) {
              errorMessage = err.error.message;
              this.showErrorOverlay('Data is not found');
            }
            this.handleError(err.error.message);
          },
        });
    }
  }

  generateYears() {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 5; i <= currentYear; i++) {
      this.years.push(i);
    }
  }

  getDate(formatDate: any, format: string = "dd-MMM-YYYY"): string | null {
    return this.datePipe.transform(formatDate, format);
  }

  getTime(time: string) {
    let Colen = time.indexOf(":");
    return time.slice(Colen - 2, time.length);
  }

  // export
  export() {
    this._attendanceModal.open(DownloadAttendanceComponent, {
      width: "550px",
      height: "650px",
      data: {
        employeeId: this.employeeId,
      },
      disableClose: true,
    });
  }

  // show message when api is fail
  gridOptions = {
    noRowsOverlayComponentParams: {
      noRowsMessageFunc: () => "No attendance data found for this employee.",
    },
  };

  onGridReady(params: GridReadyEvent<any>) {
    this.gridApi = params.api;
    this.gridApi.hideOverlay();
    this.getEmployeeAttendence();
  }

  onPaginationChanged(params: any) {
    const currentPage = params.api.paginationGetCurrentPage();
    const pageSize = params.api.paginationGetPageSize();
    this.currentPageNumber = currentPage + 1;
    this.currentPageSize = pageSize;
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
