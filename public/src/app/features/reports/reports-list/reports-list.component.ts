import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { AttendanceNonComplianceHistoryComponent } from "./reports-tables/attendance-non-compliance-history/attendance-non-compliance-history.component";
import { CommonModule, DatePipe, NgClass } from "@angular/common";
import { ncTypeCountsI, nonComplianceHistoryI, nonComplianceI } from "src/app/shared/types/nonCompliance.type";
import { FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatDatepickerInputEvent, MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { PageHeaderComponent } from "src/app/shared/components/UI/page-header/page-header.component";
import { provideNativeDateAdapter } from "@angular/material/core";
import { EmployeesService } from "../../employees/employees.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { TimesheetNonComplianceComponent } from "./reports-tables/timesheet-non-compliance/timesheet-non-compliance.component";
import { ReportsService } from "../reports.service";
import { EfficiencyReportEmployeesComponent } from "./reports-tables/efficiency-report-employees/efficiency-report-employees.component";
import { EfficiencyReportCustomersComponent } from "./reports-tables/efficiency-report-customers/efficiency-report-customers.component";
import { SingleSelectDropdownComponent } from "src/app/shared/components/UI/single-select-dropdown/single-select-dropdown.component";
import { MultiSelectDropdownComponent } from "src/app/shared/components/UI/multi-select-dropdown/multi-select-dropdown.component";
import { employeesDropdownI } from "src/app/shared/types/reports.type";

@Component({
  selector: "app-reports-list",
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    MatButtonModule,
    MatFormFieldModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    TimesheetNonComplianceComponent,
    AttendanceNonComplianceHistoryComponent,
    EfficiencyReportEmployeesComponent,
    EfficiencyReportCustomersComponent,
     NgClass, MultiSelectDropdownComponent,SingleSelectDropdownComponent
  ],
  templateUrl: "./reports-list.component.html",
  styleUrl: "./reports-list.component.scss",
  providers: [provideNativeDateAdapter(), DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsListComponent implements OnInit {
  activeTable = 'attendance';
  getDateForm!: FormGroup;
  startDate: string = "";
  endDate: string = "";
  HeadingName: string = "Reports";
  attendanceRowData: nonComplianceI[] = [];
  timesheetRowData: nonComplianceI[] = [];
  ncTypeCounts: ncTypeCountsI | any;
  employeeId: any = '0'
  allEmployees: any[] = [];
 
  dropdownHeading: string = "Select Project"
  activeReport = [
    { value: 'attendance', label: 'Attendance' },
    { value: 'timesheet', label: 'Timesheet' },
    { value: 'efficiency-report-employees', label: 'Efficiency Reports Employees' },
    { value: 'efficiency-report-customers', label: 'Efficiency Reports Customers' },
  ];

  constructor(private _employeeService: EmployeesService, private _successMessage: MatSnackBar,
    private _changeDetectorRef: ChangeDetectorRef, private reportsService: ReportsService
  ) { }
  ngOnInit(): void {
    this.setDefaultDates();
    this.pageHeader_employee(this.HeadingName);
    this.GetEmployeesForDropdown();
  }

  GetEmployeesForDropdown() {
    this.reportsService.GetEmployeesForDropdown().subscribe({
      next: (response) => {
        this.allEmployees = response.data.map((obj: employeesDropdownI) => ({
          id: obj.employeeID,  
          name: `(${obj.employeeID}) - ${obj.firstName} ${obj.lastName}`, 
        }));

        this._changeDetectorRef.detectChanges();
        console.log("Employees Loaded:", this.allEmployees);
      },
      error: (err) => {
        console.error("Error fetching employees:", err);
      }
    });
  }


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


  pageHeader_employee(employeeHeadingName: string) {
    this.HeadingName = employeeHeadingName;
  }

  // date piker start
  setDefaultDates() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 2);
    this.startDate = this.formatDate(firstDay);
    this.endDate = this.formatDate(today);
    this.GetNCHistoryLogs();
  }

  getStartDate(event: MatDatepickerInputEvent<Date> | any) {
    if (event.value) {
      this.startDate = this.formatDate(event.value);
      this.checkAndFetchAttendance();
    }
  }

  getEndDate(event: MatDatepickerInputEvent<Date> | any) {
    if (event.value) {
      this.endDate = this.formatDate(event.value);
      this.checkAndFetchAttendance();
    }
  }

  checkAndFetchAttendance() {
    if (this.startDate && this.endDate) {
      this.GetNCHistoryLogs();
    }
  }

  formatDate(date: Date): string {
    return date.toISOString().split("T")[0]; 
  }
  // date piker end

 
  
 displayReports(event: string) {
  if (event) {
    this.activeTable = event; 
    console.log('Selected Report:', this.activeTable);
    this._changeDetectorRef.detectChanges();
  }
}

//  multi-select-dropdown start
getReporsByEmployeeId(event: any) {
  if (event == 1) {
    console.log(event,"dahad if");
    this.employeeId = '0';
    this.GetNCHistoryLogs();
  } else {
    console.log(event,"dahad else");
    this.employeeId = event
    this.GetNCHistoryLogs();
  }
}
//  multi-select-dropdown end

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
