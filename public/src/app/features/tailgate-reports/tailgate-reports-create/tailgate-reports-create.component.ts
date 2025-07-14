import { afterNextRender, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, inject, Injector, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { CdkTextareaAutosize, TextFieldModule } from "@angular/cdk/text-field";

import {
  provideNativeDateAdapter,
} from "@angular/material/core";
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";

import * as _moment from "moment";

import { default as _rollupMoment, Moment } from "moment";
import { MatAutocompleteModule, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from "@angular/material/autocomplete";
import { MatIconModule } from "@angular/material/icon";
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule, MatDatepicker } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SuccessModalComponent } from 'src/app/shared/components/UI/success-modal/success-modal.component';
import { customerI } from 'src/app/shared/types/customer.type';
import { purchaseOrdersResponseI, createPOI } from 'src/app/shared/types/purchaseOrder.type';
import { currency, createSalaryI } from 'src/app/shared/types/salary.type';
import { CustomersService } from '../../customers/customers.service';
import { PurchaseOrdersService } from '../../purchaseOrders/purchase-orders.service';
import { SalaryService } from '../../salary/salary.service';
import { EmployeesService } from '../../employees/employees.service';
import { ReportsService } from '../../reports/reports.service';
import { employeesDropdownI, EmployeesForDropdownI } from 'src/app/shared/types/reports.type';
import { map, Observable, startWith } from 'rxjs';
import { TailgateReportsService } from '../tailgate-reports.service';
import { employeeDetailsI, employeeType } from 'src/app/shared/types/employees.type';

@Component({
  selector: 'app-tailgate-reports-create',
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatFormFieldModule,
    CommonModule, FormsModule,
    MatAutocompleteModule,
    MatIconModule,
    NgFor, NgIf,
  ],
  templateUrl: './tailgate-reports-create.component.html',
  styleUrl: './tailgate-reports-create.component.scss',
  providers: [provideNativeDateAdapter(), DatePipe],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TailgateReportsCreateComponent implements OnInit, OnChanges {
  @Input() formHeading: string = "";
  @Input() PurchaseOrderRowId!: number;
  @Input() isSideDrawerOpen!: boolean;
  @Output() formClose = new EventEmitter<boolean>();
  @ViewChild('input', { read: ElementRef }) input!: ElementRef<HTMLInputElement>;
  @ViewChild(MatAutocompleteTrigger) autoTrigger!: MatAutocompleteTrigger;
  isDesableAllInput: boolean = false;
  tailgateReportForm!: FormGroup;
  allCustomers: customerI[] = [];
  filteredCustomers: customerI[] = [];
  ncDate = new FormControl(); // or just: new FormControl(null);
  startDate: string = "";
  filteredEmployees!: Observable<employeesDropdownI[]>;
  searchText: string = '';
  allCurrencies: currency[] = [];
  updateSalary!: createSalaryI;
  allEmployees: any[] = [];
  managerId: string = "";
  reportingTo: string = "";
  reportingToUrl!: string;
  imgUrl: any;
  employeeDetails!: employeeType;
  reportingId!: string;
  originalString: string = "";
  maskedString = "";
  isMasked = true;
  employeeDataForTimesheet: any;
  activeTab: string = "profile";
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private customerService: CustomersService,
    private _employeeService: EmployeesService,
    private _changeDetectorRef: ChangeDetectorRef,
    private tailgateReportsService: TailgateReportsService,
    private _eref: ElementRef,
    private reportsService: ReportsService
  ) { }
  // textarea resize.
  private _injector = inject(Injector);
  @ViewChild("autosize") autosize: CdkTextareaAutosize | undefined;

  triggerResize() {
    afterNextRender(
      () => {
        this.autosize?.resizeToFitContent(true);
      },
      {
        injector: this._injector,
      },
    );
  }

  ngOnInit(): void {
    this.GetEmployeesForDropdown();
    this.initializeForm();
    this.setupEmployeeFilter();
  }

  filter(): void {
    const filterValue = this.input.nativeElement.value.toLowerCase();
    this.filteredCustomers = this.allCustomers.filter((customer) =>
      customer.customerName.toLowerCase().includes(filterValue)
    );
  }


  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event): void {
    if (!this._eref.nativeElement.contains(event.target)) {
      if (this.autoTrigger.panelOpen) {
        this.autoTrigger.closePanel();
        this._changeDetectorRef.detectChanges();
      }
    }
  }


  toggleAutocomplete(): void {
    const employeeControl = this.tailgateReportForm.get('employeeId');
    if (employeeControl && !employeeControl.value) {
      employeeControl.setValue('');
    }
    // Force open panel
    if (this.autoTrigger.panelOpen) {
      this.autoTrigger.closePanel();
    } else {
      this.autoTrigger.openPanel();
    }
    this._changeDetectorRef.detectChanges();
  }

  onCurrencyChange(event: any) {
    const selectedCurrencyId = event.value;
    this.tailgateReportForm.patchValue({ currencyId: selectedCurrencyId })
  }

  date = new FormControl();

  chosenYearHandler(normalizedYear: Moment) {
    const ctrlValue = this.date.value;
    ctrlValue?.year(normalizedYear.year());
    this.date.setValue(ctrlValue);
  }

  chosenMonthHandler(
    normalizedMonth: Moment,
    datepicker: MatDatepicker<Moment>,
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
      } else {
        this.resetForm();
      }
    }
  }


  private initializeForm(): void {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);

    this.tailgateReportForm = this.fb.group({
      employeeId: ['', Validators.required],
      ncDate: [now, Validators.required],
      ncTime: [currentTime, Validators.required],
      description: ['', [Validators.maxLength(500)]],
    });
  }


  public resetForm(): void {
    this.tailgateReportForm.reset();
    this.tailgateReportForm.markAsPristine();
    this.tailgateReportForm.markAsUntouched();
  }

  createUpdate(): void {
    if (this.tailgateReportForm.invalid) {
      this.tailgateReportForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    const formValue = this.tailgateReportForm.value;

    const datePart = new Date(formValue.ncDate);
    const [hourStr, minuteStr] = formValue.ncTime.split(':');
    const hours = parseInt(hourStr, 10);
    const minutes = parseInt(minuteStr, 10);

    const localDateTime = new Date(
      datePart.getFullYear(),
      datePart.getMonth(),
      datePart.getDate(),
      hours,
      minutes,
      0,
      0
    );

    const localISOString = `${localDateTime.getFullYear()}-${(localDateTime.getMonth() + 1).toString().padStart(2, '0')}-${localDateTime.getDate().toString().padStart(2, '0')}T${localDateTime.getHours().toString().padStart(2, '0')}:${localDateTime.getMinutes().toString().padStart(2, '0')}:00`;

    const payload = {
      id: 0,
      employeeId: formValue.employeeId?.employeeID || formValue.employeeId,
      description: formValue.description || '',
      ncDate: localISOString
    };

    console.log("Payload ", payload);
    this.tailgateReportsService.CreateTailgatingNc(payload).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.showSuccessMessage(response.message);
          this.formClose.emit(true);
          this.isSubmitting = false;
        } else {
          this.handleError(response.message);
          this.isSubmitting = false;
        }
      },
      error: (err) => {
        this.handleError(err.error.message);
        this.isSubmitting = false;
      }
    });
  }


  employeeGetById(employeeId: string) {
    this._employeeService
      .employeeGetById(employeeId)
      .subscribe((result: employeeDetailsI) => {
        if (result.success) {
          this.employeeDetails = result.data;
          const employeeDataForTimesheet = {
            employeeOfficalEmail: result.data.emailID,
            employeeId: employeeId,
          }
          this.employeeDataForTimesheet = employeeDataForTimesheet;
          this.reportingTo = this.employeeDetails?.reportingTo;
          this.managerId = this.employeeDetails.employeeID;
          console.log(this.employeeDetails, "employeeDetails");

          this._changeDetectorRef.detectChanges();
          if (!this.employeeDetails.ismanual) {
            this._employeeService
              .getImgById(this.managerId)
              .subscribe((img: any) => {
                if (img.imageUrl) {
                  this.imgUrl = img.imageUrl;
                }
                this._changeDetectorRef.detectChanges();
              });
          } else {
            this.imgUrl = this.employeeDetails.photo
          }
        } else {
          console.log("No employee data returned from API.");
        }
      });
  }

  onEmployeeSelected(event: MatAutocompleteSelectedEvent): void {
    const selectedEmployee = event.option.value;
    console.log('Employee selected:', selectedEmployee);
    this.employeeGetById(selectedEmployee.employeeID);
  }



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

  // Employee Dropdown start
  private setupEmployeeFilter(): void {
    const employeeControl = this.tailgateReportForm.get('employeeId');
    if (employeeControl) {
      this.filteredEmployees = employeeControl.valueChanges.pipe(
        startWith(''),
        map((value: string | employeesDropdownI) => this._filter(value))
      );
    }
  }
  private _filter(value: string | employeesDropdownI): employeesDropdownI[] {
    const filterValue = typeof value === 'string'
      ? value.toLowerCase()
      : value?.firstName.toLowerCase();

    return this.allEmployees.filter(option =>
      option.firstName.toLowerCase().includes(filterValue) ||
      option.lastName.toLowerCase().includes(filterValue) ||
      option.employeeID.toLowerCase().includes(filterValue)
    );
  }


  GetEmployeesForDropdown() {
    this.tailgateReportsService.GetActiveEmployeesForDropdown().subscribe({
      next: (response: any) => {
        this.allEmployees = response.data.map((obj: any) => ({
          id: obj.id,
          employeeID: obj.employeeID,
          firstName: obj.firstName,
          lastName: obj.lastName,
        }));
        this._changeDetectorRef.detectChanges();
      },
      error: (err) => {
        console.error("Error fetching employees:", err);
      }
    });
  }

  displayEmployee(employee: employeesDropdownI): string {
    return employee ? `${employee.firstName} ${employee.lastName} (${employee.employeeID})` : '';
  }

  // Employee Dropdown end
}
