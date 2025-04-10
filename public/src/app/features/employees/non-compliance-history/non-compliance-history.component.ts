import { DatePipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
} from "@angular/core";
import {
  FormGroup,
  ReactiveFormsModule,
} from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { EmployeesService } from "../employees.service";
import {
  AllCommunityModule,
  GridApi,
  ModuleRegistry,
} from "ag-grid-community";
import { MatFormFieldModule } from "@angular/material/form-field";
import {
  MatDatepickerInputEvent,
  MatDatepickerModule,
} from "@angular/material/datepicker";
import { provideNativeDateAdapter } from "@angular/material/core";
import {
  nonComplianceHistoryI,

} from "src/app/shared/types/nonCompliance.type";
import { NonComplianceAttendanceComponent } from "./non-compliance-attendance/non-compliance-attendance.component";
import { NonComplianceTimesheetComponent } from "./non-compliance-timesheet/non-compliance-timesheet.component";
import { MatInputModule } from "@angular/material/input";

ModuleRegistry.registerModules([AllCommunityModule]);
@Component({
  selector: "app-non-compliance-history",
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    NonComplianceAttendanceComponent,
    NonComplianceTimesheetComponent
  ],
  templateUrl: "./non-compliance-history.component.html",
  styleUrl: "./non-compliance-history.component.scss",
  providers: [provideNativeDateAdapter(), DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NonComplianceHistoryComponent implements OnInit {
  @Input() employeeId!: string;
  public currentPageNumber: number = 1;
  public currentPageSize: number = 15;
  public paginationPageSize = this.currentPageSize;
  public paginationPageSizeSelector: number[] = [15, 25, 50, 100];
  getDateForm!: FormGroup;
  attendanceRowData: any = [];
  timesheetRowData: any = [];
  startDate: string = "";
  endDate: string = "";
  ncTypeCounts: any
  activeTable: string = 'attendance'
  private gridApi!: GridApi<any>;
  today = new Date();
  constructor(
    private _employeeService: EmployeesService,
    private _successMessage: MatSnackBar,
    private datePipe: DatePipe,
    private _changeDetectorRef: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.activeTable = 'attendance'
    this.setDefaultDates();
    this.checkActiveTable();
  }

  ngAfterViewInit() {
    this._changeDetectorRef.detectChanges();
  }

  checkActiveTable() {
    if (this.activeTable == 'attendance') {
      this.activeTable = 'timesheet'
    } else {
      this.activeTable = 'attendance'
    }
  }

  // date piker start
  setDefaultDates() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    this.startDate = this.formatDate(firstDay);
    this.endDate = this.formatDate(lastDay);
    this.GetNCHistoryLogs();
  }

  getStartDate(event: MatDatepickerInputEvent<Date> | any) {
    if (event.value) {
      this.startDate = this.formatDate(event.value);
      this.checkAndFetchAttendance();
    }
  }

  checkAndFetchAttendance() {
    if (this.startDate && this.endDate) {
      this.GetNCHistoryLogs();
    }
  }

  formatDate(date: Date): string {
    return date.getFullYear() + "-" + (date.getMonth() + 1).toString().padStart(2, "0") + "-" + date.getDate().toString().padStart(2, "0");
  }

  dateFilter = (d: Date | null): boolean => {
    if (!this.startDate) return true;
    return d! >= new Date(this.startDate);
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

  GetNCHistoryLogs() {
    this._employeeService
      .GetNCHistoryLogs(this.employeeId, this.startDate, this.endDate)
      .subscribe({
        next: (response: nonComplianceHistoryI) => {
          if (response.success) {
            this.timesheetRowData = response.data.filter((value: any) => value.ncTypeId == 1005 || value.ncTypeId == 1006);
            this.attendanceRowData = response.data.filter((value: any) => value.ncTypeId != 1005 && value.ncTypeId != 1006);
            this.ncTypeCounts = response.ncTypeCounts ? response.ncTypeCounts : {}
            this._changeDetectorRef.detectChanges();
          } else {
            this.handleError(response.message);
            this.attendanceRowData = [];
            this.timesheetRowData = [];
            this.ncTypeCounts = response.ncTypeCounts ? response.ncTypeCounts : {};
            this._changeDetectorRef.detectChanges();
          }
        },
        error: (err) => {
          console.error("Error Status:", err.status);
          console.error("Error Message:", err.error);
          let errorMessage = "An error occurred while fetching data.";
          if (err.status === 404 && err.error.message) {
            errorMessage = err.error.message;
            this.attendanceRowData = [];
            this.timesheetRowData = [];
            this.handleError(err.error.message);
          }
          this._changeDetectorRef.detectChanges();
        },
      });
  }


  //  Function to handle API errors
  private handleError(err: string) {
    this._successMessage.open(err, "Close", {
      duration: 4000,
      panelClass: ["error-toast"],
      verticalPosition: "top",
      horizontalPosition: "right",
    });
  }
}
