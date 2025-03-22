import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  Optional,
  ViewEncapsulation,
} from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { EmployeesService } from "../../../../features/employees/employees.service";
import { MatFormFieldModule } from "@angular/material/form-field";
import {
  MatNativeDateModule,
  provideNativeDateAdapter,
} from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatInputModule } from "@angular/material/input";
import { DatePipe } from "@angular/common";
import { MatSelectModule } from "@angular/material/select";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SuccessModalComponent } from "../success-modal/success-modal.component";
import { Subject } from "rxjs";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MultiSelectDropdownComponent } from "../multi-select-dropdown/multi-select-dropdown.component";

@Component({
  selector: "app-download-attendance",
  providers: [provideNativeDateAdapter(), DatePipe],
  imports: [
    ReactiveFormsModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatDatepickerModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatAutocompleteModule,
    MultiSelectDropdownComponent
  ],
  templateUrl: "./download-attendance.component.html",
  styleUrl: "./download-attendance.component.scss",
  encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DownloadAttendanceComponent implements OnInit {
  public attendanceForm!: FormGroup;
  public range!: FormGroup;
  public attandancePdf: any;
  public responseFile!: any[];
  comment: string = "";
  employeeId: string = "";
  startDate: string = "";
  endDate: string = "";
  submitted: boolean = false;
  allProjects: any[] = []
  dropdownHeading:string="Project"
  private unsubscribe$ = new Subject<void>();
  constructor(
    private dialogRef: MatDialogRef<DownloadAttendanceComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private _changeDetectorRef: ChangeDetectorRef,
    private datePipe: DatePipe,
    private _employeesService: EmployeesService,
    private _formBuilder: FormBuilder,
    private _successMessage: MatSnackBar,
  ) { }

  ngOnInit() {
    this.employeeId = this.data.employeeId;
    // Get today's date and format it as MM-DD-YYYY
    const today = new Date();
    const formattedDate = this.formatDate(today);
    this.attendanceForm = new FormGroup({
      startDate: new FormControl("", { validators: [Validators.required] }),
      endDate: new FormControl(today, { validators: [Validators.required] }),
      format: new FormControl("pdf", { validators: [Validators.required] }),
      comment: new FormControl(""),
      projectName: new FormControl("1"),
      istimesheetavailable: new FormControl(false),
    });
  }

  // dropdown selected Output
selectedOutput(event:any){
  const selectedProject = event;
  console.log(selectedProject,"III");
  this.attendanceForm.patchValue({
    projectName:selectedProject
  })
    
}
// dropdown selected Output
  

  // close dialog box...
  closeDialog(): void {
    this.dialogRef.close();
  }

  getAttendanceFormData() {
    if (!this.attendanceForm.valid) {
      this.attendanceForm.markAllAsTouched();
      return;
    }
    if (this.attendanceForm.valid) {
      this.startDate = this.formatDate(
        this.attendanceForm.get("startDate")?.value,
      ).toString();
      this.endDate = this.formatDate(
        this.attendanceForm.get("endDate")?.value,
      ).toString();
      this.comment = this.attendanceForm.get("comment")?.value;
      this.getAttendanceById();
    }
  }

  // attendeance download....
  getAttendanceById() {
    if (this.data.employeeId && this.startDate && this.endDate) {
      console.log(
        this.data.employeeId,
        this.startDate,
        this.endDate,
        "id Modal",
      );
      if (this.attendanceForm.get("format")?.value == "excel") {
        this._employeesService
          .getAttendanceExcelByID(
            this.employeeId,
            this.startDate,
            this.endDate,
            this.comment,
            this.attendanceForm.get("istimesheetavailable")?.value,
            this.attendanceForm.get('projectName')?.value==''? '0': this.attendanceForm.get('projectName')?.value
          )
          .subscribe(
            (result: any) => {
              this.downloadAttendance(result, "xlsx");
            },
            (err) => {
              console.log("ERR", err);
              this.handleError(err.message);
            },
          );
      } else {
        this._employeesService
          .getAttendancePdfByID(
            this.employeeId,
            this.startDate,
            this.endDate,
            this.comment,
            this.attendanceForm.get("istimesheetavailable")?.value,
            this.attendanceForm.get('projectName')?.value==''? '0': this.attendanceForm.get('projectName')?.value
          )
          .subscribe(
            (result: any) => {
              this.downloadAttendance(result, "pdf");
            },
            (err) => {
              console.log("ERR", err);
              this.handleError(err.message);
            },
          );
      }
    }
  }

  downloadAttendance(result: any, filetype: string) {
    var newBlob = new Blob([result], { type: `application/${filetype}` });
    const data = window.URL.createObjectURL(newBlob);

    var link = document.createElement("a");
    link.href = data;
    link.download = `Employee_${this.employeeId}_Attendance_${this.startDate}_${this.endDate}.${filetype}`;

    link.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
      }),
    );

    setTimeout(function () {
      window.URL.revokeObjectURL(data);
      link.remove();
    }, 100);
    this.closeDialog();
    this.showSuccessMessage(
      `Employee_${this.employeeId}_Attendance_${this.startDate}_${this.endDate}.${filetype} Download Successfully`,
    );
  }

  GetDistinctProjects(event: any) {
    console.log("Timesheet Required Changed:", event.value);
    if (event.value && this.attendanceForm.get('startDate')?.value && this.attendanceForm.get('endDate')?.value) {
      console.log(this.attendanceForm.get('startDate')?.value, this.attendanceForm.get('endDate')?.value, event.value, "down");
      console.log(this.formatDate(this.attendanceForm.get('startDate')?.value), this.formatDate(this.attendanceForm.get('endDate')?.value), event.value, "down");
      this._employeesService.GetDistinctProjects(this.employeeId, this.formatDate(this.attendanceForm.get('startDate')?.value),
        this.formatDate(this.attendanceForm.get('endDate')?.value)).subscribe(
          {
            next: ((response) => {
              if (response.success) {
                this.allProjects = response?.projects
                this._changeDetectorRef.detectChanges();
              } else {
                this.showSuccessMessage(response.message)
                console.log(response.message);
              }
            }), error: ((error) => {
              // this.handleError()
              console.log(error);
            })
          }

        )
    }
    this._changeDetectorRef.detectChanges()
  }


  // format date to MM-DD-YYYY
  formatDate(date: Date | null): string {
    return date ? this.datePipe.transform(date, "MM-dd-yyyy")! : "";
  }

  // Custom Validator
  dateValidator(control: FormControl) {
    if (!control.value || isNaN(new Date(control.value).getTime())) {
      return { invalidDate: true };
    }
    return null;
  }


  onDateChange(field: "startDate" | "endDate", event: any) {
    const selectedDate = event.value;
    console.log(`${field} Date Selected:`, selectedDate);

    // If Start Date is selected after End Date, reset End Date
    if (field === "startDate") {
      const endDate = this.attendanceForm.get("end")?.value;
      if (endDate && selectedDate > endDate) {
        this.attendanceForm.get("end")?.setValue(null);
        console.log("Resetting End Date because Start Date is later.");
      }
    }

    // If End Date is selected before Start Date, reset it
    if (field === "endDate") {
      const startDate = this.attendanceForm.get("start")?.value;
      if (startDate && selectedDate < startDate) {
        this.attendanceForm.get("start")?.setValue(null);
        console.log("Resetting Start Date because End Date is earlier.");
      }
    }
    this.GetDistinctProjects(this.attendanceForm.get('istimesheetavailable'))
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
  private handleError(err: any) {
    console.error("Error Status:", err.status);
    console.error("Error Message:", err.error);
    this._successMessage.open(
      "Failed to save attendance. Please try again.",
      "Close",
      {
        duration: 4000,
        panelClass: ["error-toast"],
        verticalPosition: "top",
        horizontalPosition: "right",
      },
    );
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
