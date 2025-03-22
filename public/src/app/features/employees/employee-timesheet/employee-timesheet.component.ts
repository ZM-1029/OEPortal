import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewEncapsulation,
} from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AgGridModule } from "ag-grid-angular";
import {
  GridApi,
  ModuleRegistry,
  AllCommunityModule,
  GridReadyEvent,
} from "ag-grid-community";
import { EmployeesService } from "../employees.service";
import {
  employeeTimesheetI,
  employeeTimesheetsI,
} from "src/app/shared/types/employees.type";
import { LoaderComponent } from "src/app/shared/components/UI/loader/loader.component";
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
} from "@angular/forms";
import { SuccessModalComponent } from "src/app/shared/components/UI/success-modal/success-modal.component";
import { CommonModule, DatePipe} from "@angular/common";
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
import {
  MatDatepicker,
  MatDatepickerModule,
} from "@angular/material/datepicker";
import moment, { Moment } from "moment";
import { MY_FORMATS } from "../employee-attendance/employee-attendance.component";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
import { MatSelectModule } from "@angular/material/select";
import { MultiSelectDropdownComponent } from "src/app/shared/components/UI/multi-select-dropdown/multi-select-dropdown.component";

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: "app-employee-timesheet",
  standalone: true,
  imports: [
    AgGridModule,
    LoaderComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatInputModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatAutocompleteModule,
    MultiSelectDropdownComponent
  ],
  templateUrl: "./employee-timesheet.component.html",
  styleUrl: "./employee-timesheet.component.scss",
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
export class EmployeeTimesheetComponent implements OnInit, AfterViewInit {
  @Input() employeeDataForTimesheet: any;
  gridApi!: GridApi;
  rowData: employeeTimesheetI[] = [];
  currentPageNumber: number = 1;
  currentPageSize: number = 15;
  paginationPageSizeSelector: number[] = [15, 25, 50, 100];
  selectedMonth: any;
  selectedYear: any;
  allProjects: any = [];
  selectedProject: any = 1;
  toppings = new FormControl();
  dropdownHeading: string = "Project"
  selected: any;
  startOfMonth: any;
  endOfMonth: any;
  columnDefs: any[] = [
    {
      field: "workDate",
      headerName: "Work Date",
      sortable: true,
      filter: true,
      minWidth: 170,
      rowSpan: (params: any) => params.data.rowSpan || 1,
      cellClassRules: {
        "cell-span": (params: any) => params.value !== "",
      },
      cellStyle: { border: "0.1px solid #cccccc40" },
    },
    {
      field: "projectName",
      headerName: "Project Name",
      sortable: true,
      filter: true,
      minWidth: 200,
    },
    {
      field: "description",
      headerName: "Description",
      sortable: true,
      filter: true,
      minWidth: 600,
    },
    {
      field: "hours",
      headerName: "Hours",
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
    private _successMessage: MatSnackBar,
    private _changeDetectorRef: ChangeDetectorRef,
  ) { }



  gridOptions = {
    noRowsOverlayComponentParams: {
      noRowsMessageFunc: () => "No data found for this employee.",
    },
  };

  ngOnInit(): void {
  }
  ngAfterViewInit() {
    this._changeDetectorRef.detectChanges();
  }

  date = new FormControl(moment());


  // dropdown selected Output
  selectedOutput(event: any) {
    this.selectedProject = event;
    // if (selectedProject.length == 0) {
    //   this.selectedProject = 1
    // } else {
    //   for (const project of selectedProject) {
    //     if (typeof (project) == 'number') {
    //       this.selectedProject = 1;
    //     } else {
    //       console.log(project, typeof (project), "type");
    //       this.selectedProject = selectedProject;
    //     }
    //   }
    // }
    this.getTimesheetByEmail();
  }
  // dropdown selected Output

  chosenYearHandler(normalizedYear: Moment) {
    const ctrlValue = this.date.value;
    ctrlValue?.year(normalizedYear.year());
    this.date.setValue(ctrlValue);
  }

  chosenMonthHandler(
    normalizedMonth: Moment,
    datepicker: MatDatepicker<Moment>
  ) {
    const ctrlValue = this.date.value;
    ctrlValue?.month(normalizedMonth.month());
    this.date.setValue(ctrlValue);
    datepicker.close();
    this.startOfMonth = this.date.value?.clone().startOf('month').format("MM-DD-YYYY");
    this.endOfMonth = this.date.value?.clone().endOf('month').format("MM-DD-YYYY");

    this.GetDistinctProjects(this.startOfMonth, this.endOfMonth);
    this.getTimesheetByEmail();
    this._changeDetectorRef.detectChanges()
  }


  GetDistinctProjects(startData: any, endDate: any) {
    this._employeeService.GetDistinctProjects(this.employeeDataForTimesheet.employeeId, startData, endDate).subscribe(
      {
        next: ((response) => {
          if (response.success) {
            this.allProjects = [...response.projects]
            this._changeDetectorRef.detectChanges();
          }
        }), error: ((err) => {
          console.log(err);
        })
      }
    )
  }

  // onProjectSelect(event: MatAutocompleteSelectedEvent) {
  //   const selectedProject = event.option.value;
  //   console.log("Selected Project:", selectedProject);
  //   this.selectedProject = selectedProject;
  //   this.getTimesheetByEmail();
  // }

  getTimesheetByEmail() {
    this.selectedMonth = this.date.value?.format("MM");
    this.selectedYear = this.date.value?.format("YYYY");
    if (this.selectedMonth && this.selectedYear && this.employeeDataForTimesheet?.employeeOfficalEmail) {
      this._employeeService
        .getTimesheetByEmail(
          this.employeeDataForTimesheet?.employeeOfficalEmail,
          this.selectedMonth,
          this.selectedYear,
          this.selectedProject
        )
        .subscribe({
          next: (response: employeeTimesheetsI) => {
            if (response.success) {
              this.rowData = this.processRowDataForRowSpan(response.data);
              this._changeDetectorRef.detectChanges();
            } else {
              this.rowData = [];
              this.showSuccessMessage(response.message);
            }
          },
          error: (err) => {
            this.handleError(err);
            console.error("Error Status:", err.status);
            console.error("Error Message:", err.error);
            let errorMessage = "An error occurred while fetching data.";
            if (err.status === 404 && err.error.message) {
              this.rowData = [];
              errorMessage = err.error.message;
              this.showErrorOverlay('Data is not found');
            }
            this.handleError(err.error.message);
          },
        });
    }
  }

  processRowDataForRowSpan(data: any[]): any[] {
    let countMap: { [key: string]: number } = {};
    let serialCounter = 1; // Unique counter for S. No

    // Count occurrences of each date
    data.forEach((row) => {
      countMap[row.workDate] = (countMap[row.workDate] || 0) + 1;
    });

    let lastDate: string | null = null;
    return data.map((row) => {
      let rowSpan = countMap[row.workDate] || 1;

      let updatedRow = {
        ...row,
        serialNumber: serialCounter++,
        rowSpan: rowSpan,
      };

      if (row.workDate === lastDate) {
        updatedRow.rowSpan = 1;
      } else {
        lastDate = row.workDate;
      }

      return updatedRow;
    });
  }

  onGridReady(params: GridReadyEvent<any>) {
    this.gridApi = params.api;
    this.startOfMonth = this.date.value?.clone().startOf('month').format("MM-DD-YYYY");
    this.endOfMonth = this.date.value?.clone().endOf('month').format("MM-DD-YYYY");
    this.GetDistinctProjects(this.startOfMonth, this.endOfMonth);
    this.getTimesheetByEmail();
    this._changeDetectorRef.detectChanges();
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

  // pagination start
  onPaginationChanged(params: any) {
    this.currentPageNumber = params.api.paginationGetCurrentPage() + 1;
    this.currentPageSize = params.api.paginationGetPageSize();
  }

  onPageSizeChange(event: any) {
    this.currentPageSize = +event.target.value;
    this.currentPageNumber = 1;
    this.getTimesheetByEmail();
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
    this._successMessage.open(err.error.message, "Close", {
      duration: 4000,
      panelClass: ["error-toast"],
      verticalPosition: "top",
      horizontalPosition: "right",
    });
  }
}
