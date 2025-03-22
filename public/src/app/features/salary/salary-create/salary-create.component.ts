import { CommonModule, DatePipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { CustomersService } from "../../customers/customers.service";
import { SalaryService } from "../salary.service";
import { customerI } from "src/app/shared/types/customer.type";
import {
  createSalaryI,
  currency,
  salaryListI,
} from "src/app/shared/types/salary.type";
import { SuccessModalComponent } from "src/app/shared/components/UI/success-modal/success-modal.component";
import { MatCheckboxModule } from "@angular/material/checkbox";
import {
  MatDatepicker,
  MatDatepickerModule,
} from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatRadioModule } from "@angular/material/radio";
import { MatSelectModule } from "@angular/material/select";
import { provideNativeDateAdapter } from "@angular/material/core";
import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from "@angular/material-moment-adapter";
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from "@angular/material/core";
import { FormControl } from "@angular/forms";
import * as _moment from "moment";
import { default as _rollupMoment, Moment } from "moment";
import { MatAutocompleteModule, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from "@angular/material/autocomplete";

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

@Component({
  selector: "app-salary-create",
  templateUrl: "./salary-create.component.html",
  styleUrl: "./salary-create.component.scss",
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatFormFieldModule,
    CommonModule, FormsModule,
    MatAutocompleteModule
  ],
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
export class SalaryCreateComponent implements OnInit, OnChanges {
  @Input() formHeading: string = "";
  @Input() salaryRowId!: number;
  @Input() isSideDrawerOpen!: boolean;
  @Output() formClose = new EventEmitter<boolean>();
  @ViewChild("input") input!: ElementRef<any>;
  @ViewChild('autoTrigger') autoTrigger!: MatAutocompleteTrigger;
  salaryForm!: FormGroup;
  allCustomers: customerI[] = [];
  filteredCustomers: customerI[] = [];
  allCurrencies: currency[] = [];
  updateSalary!: createSalaryI;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private customerService: CustomersService,
    private salaryService: SalaryService,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    
  }


  date = new FormControl(moment());

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
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["isSideDrawerOpen"]) {
      if (changes["isSideDrawerOpen"].currentValue) {
        this.initializeForm();
        this.resetForm();
        this.loadDropdownData();
        if (this.salaryRowId) this.setSalaryValues();
      } else {
        this.resetForm();
      }
    }
  }



  private initializeForm(): void {
    this.salaryForm = this.fb.group({
      customerId: ["", ],
      customerName: ["", [Validators.required]],
      employeeID: ["", Validators.required],
      dateOfPayment: [this.date.value?.format("YYYY-MM-DD")],
      currencyId: ["", Validators.required],
      amount: ["", [Validators.required, Validators.pattern("^[0-9]*$")]],
    });
  }

  private loadDropdownData(): void {
    this.customerService.getCustomerList().subscribe((response) => {
      if (response.success) this.allCustomers = response.customers;
    });
    this.salaryService.getAllCurrencies().subscribe((response) => {
      if (response.success) this.allCurrencies = response.data;
    });
  }

// dropdown auto select start
@HostListener('document:click', ['$event'])
onClickOutside(event: Event) {
  if (this.input && this.input.nativeElement !== event.target && !this.input.nativeElement.contains(event.target)) {
    if (this.autoTrigger && this.autoTrigger.panelOpen) {
      this.autoTrigger.closePanel();
      this._changeDetectorRef.detectChanges(); // Ensure UI updates
    }
  }
}

// Ensure dropdown opens when input is focused or user types
filter(): void {
  const filterValue = this.input.nativeElement.value.toLowerCase();
  this.filteredCustomers = this.allCustomers.filter((customer) =>
    customer.customerName.toLowerCase().includes(filterValue)
  );

  // Open the dropdown manually if there are filtered results
  if (this.filteredCustomers.length > 0 && !this.autoTrigger.panelOpen) {
    this.autoTrigger.openPanel();
  }
}



onSelectCustomer(event: MatAutocompleteSelectedEvent): void {
  const selectedCustomer = this.allCustomers.find(
    (customer) => customer.customerName === event.option.viewValue
  );
  if (selectedCustomer) {
    // this.selectedCustomerId = selectedCustomer.id;
    this.salaryForm.patchValue({ customerId: selectedCustomer.id })
  }

}

// dropdown auto select end

  public resetForm(): void {
    this.salaryForm.reset();
    this.salaryForm.markAsPristine();
    this.salaryForm.markAsUntouched();
  }

  private setSalaryValues(): void {
    this.salaryService.getSalaryById(this.salaryRowId).subscribe({
      next: (response: salaryListI) => {
        if (response.success) {
          const salaryData: any = response.data;
          this.salaryForm.patchValue({
            customerId: salaryData.customerId,
            customerName:salaryData.customerName,
            employeeID: salaryData.employeeid,
            currencyId: salaryData.currencyId,
            amount: salaryData.amount,
          });
          this.date.patchValue(moment(salaryData.dateOfPayment));
          console.log(salaryData);
          this.updateSalary = this.salaryForm.value;
          this._changeDetectorRef.detectChanges()
        }
      },
      error: (err) => this.handleError(err),
    });
  }

  createUpdate(): void {
    console.log(this.salaryForm.value,this.salaryForm.valid);
    
    for (let key in this.salaryForm.value) {
      if (key == "dateOfPayment") {
        this.salaryForm.value[key] = this.date.value?.format("YYYY-MM-DD");
      }
    }
    if (this.salaryForm.invalid) {
      this.salaryForm.markAllAsTouched();
      return;
    }

    const salaryData: createSalaryI = {
      id: this.salaryRowId || 0,
      ...this.salaryForm.value,
      dateOfPayment: this.date.value?.format("YYYY-MM-DD"),
    };

    console.log(salaryData);

    const apiCall = this.salaryRowId
      ? this.salaryService.updateSalaryById(this.salaryRowId, salaryData)
      : this.salaryService.createSalary(salaryData);

    apiCall.subscribe({
      next: (response) => {
        if (response.success) {
          this.showSuccessMessage(response.message);
          this.formClose.emit(true);
          this.resetForm();
        } else {
          this.showSuccessMessage(response.message);
        }
      },
      error: (err) => this.handleError(err),
    });
  }

  // customer dropdown start
  // customer dropdown end

  private showSuccessMessage(message: string): void {
    this.snackBar.openFromComponent(SuccessModalComponent, {
      data: { message },
      duration: 4000,
      panelClass: ["custom-toast"],
      verticalPosition: "top",
      horizontalPosition: "right",
    });
  }

  private handleError(err: any): void {
    console.error("API Error:", err);
    this.snackBar.open(err.error.message, "Close", {
      duration: 4000,
      panelClass: ["error-toast"],
      verticalPosition: "top",
      horizontalPosition: "right",
    });
  }
}
