import { DatePipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
} from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SuccessModalComponent } from "src/app/shared/components/UI/success-modal/success-modal.component";
import { EmployeesService } from "../employees.service";
import { LoaderComponent } from "src/app/shared/components/UI/loader/loader.component";
import { AgGridAngular } from "ag-grid-angular";
import {
  AllCommunityModule,
  GridApi,
  GridReadyEvent,
  ModuleRegistry,
} from "ag-grid-community";
import { MatFormFieldModule } from "@angular/material/form-field";
import {
  MatDatepickerInputEvent,
  MatDatepickerModule,
} from "@angular/material/datepicker";
import { provideNativeDateAdapter } from "@angular/material/core";
import {
  ncTypeCountsI,
  nonComplianceHistoryI,
  nonComplianceI,
} from "src/app/shared/types/nonCompliance.type";
import { NonComplianceAttendanceComponent } from "./non-compliance-attendance/non-compliance-attendance.component";
import { NonComplianceTimesheetComponent } from "./non-compliance-timesheet/non-compliance-timesheet.component";

ModuleRegistry.registerModules([AllCommunityModule]);
@Component({
  selector: "app-non-compliance-history",
  imports: [
    MatFormFieldModule,
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
  ncTypeCounts:any
  activeTable:string='attendance'
  private gridApi!: GridApi<any>;
   today = new Date();
  constructor(
    private _employeeService: EmployeesService,
    private _successMessage: MatSnackBar,
    private datePipe: DatePipe,
    private _changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.activeTable='attendance'
    this.setDefaultDates();
    this.checkActiveTable();
  }

  ngAfterViewInit() {
    this._changeDetectorRef.detectChanges();
  }

  checkActiveTable(){
    if(this.activeTable=='attendance'){
      this.activeTable='timesheet'
    }else{
      this.activeTable='attendance'
    }
  }

  formatDate(date: Date): string {
    return date.toISOString().split("T")[0];
  }

  setDefaultDates() { 
    const firstDay = new Date(this.today.getFullYear(), this.today.getMonth(), 2);
    this.startDate = this.formatDate(firstDay);
    this.endDate = this.formatDate(this.today);
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
      console.log(this.endDate, 'enddate');
      console.log(this.startDate, 'state datyet');
      this.checkAndFetchAttendance();
    }
  }

  checkAndFetchAttendance() {
    if (this.startDate && this.endDate) {
      this.GetNCHistoryLogs();
    }
  }

  disableFutureDates = (date: Date | null): boolean => {
    if (!date) return false;
    return date <= this.today; 
  };


  GetNCHistoryLogs() {
    this._employeeService
      .GetNCHistoryLogs(this.employeeId, this.startDate, this.endDate)
      .subscribe({
        next: (response: nonComplianceHistoryI) => {
          if (response.success) {
            this.timesheetRowData = response.data.filter((value: any) => value.ncTypeId == 1005 || value.ncTypeId == 1006);
            this.attendanceRowData = response.data.filter((value: any) => value.ncTypeId != 1005 && value.ncTypeId != 1006);
            this.ncTypeCounts=response.ncTypeCounts?response.ncTypeCounts:{}
            this._changeDetectorRef.detectChanges();
          } else {
            this.handleError(response.message);
            this.attendanceRowData=[];
            this.timesheetRowData =[];
            this.ncTypeCounts=response.ncTypeCounts?response.ncTypeCounts:{};
            this._changeDetectorRef.detectChanges();
          }
        },
        error: (err) => {
          console.error("Error Status:", err.status);
          console.error("Error Message:", err.error);
          let errorMessage = "An error occurred while fetching data.";
          if (err.status === 404 && err.error.message) {
            errorMessage = err.error.message;
            this.attendanceRowData=[];
            this.timesheetRowData =[];
            this.handleError(err.error.message);
          }
          this._changeDetectorRef.detectChanges();
        },
      });
  }

  

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
  private handleError(err: string) {
    this._successMessage.open(err, "Close", {
      duration: 4000,
      panelClass: ["error-toast"],
      verticalPosition: "top",
      horizontalPosition: "right",
    });
  }
}
