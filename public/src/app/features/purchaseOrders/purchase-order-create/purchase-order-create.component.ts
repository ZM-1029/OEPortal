import { CommonModule, DatePipe } from "@angular/common";
import {
  afterNextRender,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Injector,
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
import { MatCheckboxModule } from "@angular/material/checkbox";
import {
  MatDatepicker,
  MatDatepickerModule,
} from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatRadioModule } from "@angular/material/radio";
import { MatSelectModule } from "@angular/material/select";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SuccessModalComponent } from "src/app/shared/components/UI/success-modal/success-modal.component";
import { customerI } from "src/app/shared/types/customer.type";
import { currency, createSalaryI } from "src/app/shared/types/salary.type";
import { CustomersService } from "../../customers/customers.service";
import { SalaryService } from "../../salary/salary.service";
import { provideNativeDateAdapter } from "@angular/material/core";
import { PurchaseOrdersService } from "../purchase-orders.service";
import {
  createPOI,
  purchaseOrdersResponseI,
} from "src/app/shared/types/purchaseOrder.type";
import { CdkTextareaAutosize, TextFieldModule } from "@angular/cdk/text-field";

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
import { MatIconModule } from "@angular/material/icon";

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
  selector: "app-purchase-order-create",
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
  ],
  templateUrl: "./purchase-order-create.component.html",
  styleUrl: "./purchase-order-create.component.scss",
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
export class PurchaseOrderCreateComponent implements OnInit, OnChanges {
  @Input() formHeading: string = "";
  @Input() PurchaseOrderRowId!: number;
  @Input() isSideDrawerOpen!: boolean;
  @Output() formClose = new EventEmitter<boolean>();
  @ViewChild('input', { read: ElementRef }) input!: ElementRef<HTMLInputElement>;
  @ViewChild(MatAutocompleteTrigger) autoTrigger!: MatAutocompleteTrigger;
  isDesableAllInput: boolean = false;
  purchaseOrderForm!: FormGroup;
  allCustomers: customerI[] = [];
  filteredCustomers: customerI[] = [];
  searchText: string = '';
  allCurrencies: currency[] = [];
  updateSalary!: createSalaryI;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private customerService: CustomersService,
    private salaryService: SalaryService,
    private _changeDetectorRef: ChangeDetectorRef,
    private purchaseOrdersService: PurchaseOrdersService,
    private _eref: ElementRef
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

  onSelectCustomer(event: MatAutocompleteSelectedEvent): void {
    const selectedCustomer = this.allCustomers.find(
      (customer) => customer.customerName === event.option.viewValue
    );
    if (selectedCustomer) {
      this.purchaseOrderForm.patchValue({
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.customerName,
      });
    }
  }

  toggleAutocomplete(): void {
    if (this.autoTrigger.panelOpen) {
      this.autoTrigger.closePanel();
    } else {
      this.filteredCustomers = [...this.allCustomers];
      this.input.nativeElement.focus();
      this.autoTrigger.openPanel();
    }
    this._changeDetectorRef.detectChanges();
  }

  onCurrencyChange(event: any) {
    const selectedCurrencyId = event.value;
    this.purchaseOrderForm.patchValue({ currencyId: selectedCurrencyId })
  }

  date = new FormControl(moment());

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
        this.loadDropdownData();
        if (this.PurchaseOrderRowId) this.setSalaryValues();
      } else {
        this.resetForm();
      }
    }
  }

  private initializeForm(): void {
    this.purchaseOrderForm = this.fb.group({
      customerId: [],
      customerName: ["", [Validators.required,]],
      poid: ["", [Validators.required]],
      poDate: [this.date.value?.format("YYYY-MM-DD")],
      currencyId: ["", [Validators.required]],
      amount: ["", [Validators.required, Validators.pattern(/^\d+$/)]],
      description: [""],
    });
  }

  private loadDropdownData(): void {
    // this.customerService.getCustomerList().subscribe((response) => {
    //   if (response.success) this.allCustomers = response.customers;
    // });
    this.customerService.getCustomerList().subscribe((response) => {
      if (response.success) {
        this.allCustomers = response.customers;
        this.filteredCustomers = [...this.allCustomers];
      }
    });


    this.salaryService.getAllCurrencies().subscribe((response) => {
      if (response.success) this.allCurrencies = response.data;
    });
  }

  public resetForm(): void {
    this.purchaseOrderForm.reset();
    this.purchaseOrderForm.markAsPristine();
    this.purchaseOrderForm.markAsUntouched();
  }

  private setSalaryValues(): void {
    this.purchaseOrdersService
      .getPurchaseOrderById(this.PurchaseOrderRowId)
      .subscribe({
        next: (response: purchaseOrdersResponseI) => {
          if (response.success) {
            const purchaseOrderData: any = response.data;

            if (this.autoTrigger.panelOpen) {
              this.autoTrigger.closePanel();
            }

            if (!this.purchaseOrderForm) {
              console.error("Form is not initialized yet!");
              return;
            }

            setTimeout(() => {
              // Convert amount to a formatted string with commas
              const formattedAmount = purchaseOrderData.amount
                ? Number(purchaseOrderData.amount).toLocaleString()
                : '';

              this.purchaseOrderForm.patchValue({
                customerId: purchaseOrderData.customerId,
                customerName: purchaseOrderData.customerName,
                poid: purchaseOrderData.poid,
                currencyId: purchaseOrderData.currencyId,
                amount: purchaseOrderData.amount,
                description: purchaseOrderData.description,
              }, { emitEvent: false });

              // Set the formatted display value (for UI)
              this.formattedAmount = formattedAmount;

              // Patch the date field if available
              if (purchaseOrderData.poDate) {
                this.date.patchValue(moment(purchaseOrderData.poDate));
              } else {
                console.warn("poDate is missing or invalid:", purchaseOrderData);
              }

              this._changeDetectorRef.detectChanges();
            }, 0);
          }
        },
        error: ((err) => {
          this.handleError(err)
          console.error("Error", err);
        })
      });
  }


  createUpdate(): void {
    for (let key in this.purchaseOrderForm.value) {
      if (key == "poDate") {
        this.purchaseOrderForm.value[key] =
          this.date.value?.format("YYYY-MM-DD");
      }
    }
    if (this.purchaseOrderForm.invalid) {
      this.purchaseOrderForm.markAllAsTouched();
      return;
    }

    const purchaseOrderData: createPOI = {
      id: this.PurchaseOrderRowId || 0,
      ...this.purchaseOrderForm.value,
      poDate: this.date.value?.format("YYYY-MM-DD"),
    };

    const apiCall = this.PurchaseOrderRowId
      ? this.purchaseOrdersService.updatePOById(
        this.PurchaseOrderRowId,
        purchaseOrderData,
      )
      : this.purchaseOrdersService.createPO(purchaseOrderData);

    apiCall.subscribe({
      next: (response) => {
        if (response.success) {
          this.showSuccessMessage(response.message);
          this.formClose.emit(true);
          this.resetForm();
        }
      },
      error: (err) => this.handleError(err),
    });
  }

  // amount value in comma separator start
  formattedAmount = '';

  onAmountChange(event: any) {
    let inputValue = event.target.value.replace(/,/g, '');
    if (!/^\d*$/.test(inputValue)) return;

    this.formattedAmount = Number(inputValue).toLocaleString();
    this.purchaseOrderForm.controls['amount'].setValue(inputValue);
  }

  // amount value in comma separator end

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
