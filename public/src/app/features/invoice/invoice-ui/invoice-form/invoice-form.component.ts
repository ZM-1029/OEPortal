import { DatePipe, NgClass } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule, provideNativeDateAdapter, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatepickerModule, MatDatepicker } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import moment from 'moment';
import { CustomersService } from 'src/app/features/customers/customers.service';
import { MY_FORMATS } from 'src/app/features/employees/employee-attendance/employee-attendance.component';
import { SuccessModalComponent } from 'src/app/shared/components/UI/success-modal/success-modal.component';
import { customerI } from 'src/app/shared/types/customer.type';
import { allpo, invoiceCreateTableI, PoSummaryI } from 'src/app/shared/types/invoice.type';
import { InvoiceService } from '../../invoice.service';
import { PurchaseOrderComponent } from '../purchase-order/purchase-order.component';
import { PurchaseOrderSummeryI } from 'src/app/shared/types/purchaseOrder.type';

@Component({
  selector: 'app-invoice-form',
  imports: [MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    FormsModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatCheckboxModule, PurchaseOrderComponent,NgClass],
  templateUrl: './invoice-form.component.html',
  styleUrl: './invoice-form.component.scss',
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
export class InvoiceFormComponent implements OnInit, OnChanges, AfterViewInit {
  @ViewChild("input") input!: ElementRef<HTMLInputElement>;
  options: string[] = [];
  @Input() editedInvoicedata: any;
  @Input() isFormValidate: boolean = false;
  @Output() InvoiceformData: EventEmitter<any> = new EventEmitter<any>();
  @Output() purchaseOrderData: EventEmitter<any> = new EventEmitter<any>();
  @Output() invoiceValidFormData: EventEmitter<any> = new EventEmitter<any>();
  allCustomers: customerI[] = [];
  filteredCustomers: customerI[] = [];
  allPO: allpo[] = []
  selectedCustomerId: number | string = '';
  selectedPurchaseOrderId: number | string = '';
  invoiceNumber: string = '';
  invoiceTable: boolean = false;
  invoiceTableData: invoiceCreateTableI[] = [];
  invoiceForm!: FormGroup;
  purchaseOrderForm!: FormGroup;
  purchaseOrderFormData: any={};
  isVisibalPurchaseOrder: boolean = false;
  isDesableAllInput: boolean = false;
  isDesableViewBtn:boolean=true;
  constructor(private customerService: CustomersService, private _successMessage: MatSnackBar, private dialog: MatDialog,
    private invoiceService: InvoiceService, private _changeDetectorRef: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.invoiceForm = new FormGroup({
      invoiceNumber: new FormControl('', Validators.required),
      date: new FormControl(moment(), Validators.required),
      customerName: new FormControl('', Validators.required),
      customerId: new FormControl('')
    });
    this.purchaseOrderForm = new FormGroup({
      id: new FormControl(''),
      po: new FormControl(false),
      poId: new FormControl(''),
    })
    this.getCustomer();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isFormValidate'] && changes['isFormValidate'].currentValue) {
      const validData = {
        status: true,
        invoiceformData: this.getInvoiceFormValue()
      }
      if (!this.invoiceForm.valid) {
        this.invoiceForm.markAllAsTouched();
        this.invoiceValidFormData.emit(validData);
      } else {
        this.invoiceValidFormData.emit(validData);
      }
      this._changeDetectorRef.detectChanges();
    }
    if (this.editedInvoicedata != undefined) {
      if (this.editedInvoicedata) {
        if (changes['editedInvoicedata']) {
          this.invoiceForm.patchValue({
            invoiceNumber: this.editedInvoicedata.invoiceNumber,
            date: this.editedInvoicedata.filterDate,
            customerName: this.editedInvoicedata.customerName,
            customerId: this.editedInvoicedata.customerId
          });
          if (this.editedInvoicedata.poTransactionHistory.length != 0) {
            for (const data of this.editedInvoicedata.poTransactionHistory) {
              this.purchaseOrderForm.patchValue({
                id: data.poId,
                po: true,
                poId: data.po.poid
              })
              // this.getPurchaseOrderList();
              this.getPoSummary(this.purchaseOrderForm.get('poId')?.value);
            }
          }
          // Disable all form controls
          Object.keys(this.invoiceForm.controls).forEach(key => {
            this.invoiceForm.controls[key].disable();
          });
        }
      }
    }
  }

  // dropdown start
  ngAfterViewInit(): void {
    this._changeDetectorRef.detectChanges();
  }


  private getCustomer(): void {
    this.customerService.getCustomerList().subscribe((response) => {
      if (response.success) {
        this.allCustomers = response.customers;
        this.filteredCustomers = [...this.allCustomers];
      } else {
        console.log();

      }
    });
  }

  filter(): void {
    const filterValue = this.input.nativeElement.value.toLowerCase();
    this.filteredCustomers = this.allCustomers.filter((customer) =>
      customer.customerName.toLowerCase().includes(filterValue)
    );
  }

  onSelectCustomer(event: any): void {
    this.isVisibalPurchaseOrder = false;
    this.isDesableViewBtn=true;
    this.purchaseOrderForm.reset();
    this.purchaseOrderData.emit();
    const selectedCustomer = this.allCustomers.find(
      (customer) => customer.customerName === event.option.viewValue
    );
    if (selectedCustomer) {
      this.selectedCustomerId = selectedCustomer.id;
      this.invoiceForm.patchValue({ customerId: this.selectedCustomerId })
    }
    this.InvoiceformData.emit(this.getInvoiceFormValue());
  }

  getInvoiceFormValue() {
    const invoiceData = {
      invoiceNumber: this.invoiceForm.get('invoiceNumber')?.value,
      customerId: this.invoiceForm.get('customerId')?.value,
      month: String(moment(this.invoiceForm.get('date')?.value).format('MM') ?? ""),
      year: String(moment(this.invoiceForm.get('date')?.value).format('YYYY') ?? ""),
    };
    return invoiceData
  }

  onSelectPo(event: any): void {
    const selectedPo = this.allPO.find(
      (po) => po.poid === event.option.viewValue
    );
    if (selectedPo) {
      this.selectedPurchaseOrderId = selectedPo.id
      this.purchaseOrderForm.patchValue({ id: this.selectedPurchaseOrderId });
      this.getPoSummary(this.purchaseOrderForm.get('poId')?.value);
      // this.getPurchaseOrderForm();
    } else {
      // this.getPurchaseOrderForm();
    }
    this._changeDetectorRef.detectChanges();
  }

  getPurchaseOrderForm() {
    if (this.purchaseOrderForm.get("po")?.value && this.purchaseOrderForm.get("poId")?.value) {
      const purchaseOrderData = {
        poStatus: this.purchaseOrderForm.get('po')?.value,
        poNumber: this.purchaseOrderForm.get('id')?.value,
        date: String(moment(this.invoiceForm.get('date')?.value).toISOString() ?? ""),
        purchaseOrderFormData: this.purchaseOrderFormData
      };
      this.purchaseOrderData.emit(purchaseOrderData);
    }
    this._changeDetectorRef.detectChanges();
  }

  // viewPurchaseOrder start
  viewPurchaseOrder() {
    if (this.isVisibalPurchaseOrder == true) {
      this.isVisibalPurchaseOrder = false;
    } else {
      this.isVisibalPurchaseOrder = true;
    }
    this._changeDetectorRef.detectChanges();
  }
  // viewPurchaseOrder end

  getPurchaseOrderList() {
    const isPoChecked = this.purchaseOrderForm.get('po')?.value;
    const customerId = this.invoiceForm.get('customerId')?.value;
    this.purchaseOrderData.emit();
    if (isPoChecked && customerId) {
      this.purchaseOrderFormData={};
      this.invoiceService.getPosByCustomerid(customerId).subscribe({
        next: (response) => {
          if (response.success) {
            this.allPO = response.data;
          } else {
            this.allPO = [];
            this.handleError(response.message);
          }
          this._changeDetectorRef.detectChanges(); 
        },
        error: (error) => {
          console.error("API Error:", error);
        }
      });
    } else {
      // Reset values if checkbox is unchecked or no customer is selected
      this.isVisibalPurchaseOrder = false;
      this.allPO = []; // Clear PO list
      this.purchaseOrderForm.reset(); // Reset PO ID
      this._changeDetectorRef.detectChanges();
    }
  }
  


  // datepiker start
  chosenYearHandler(normalizedYear: moment.Moment) {
    let ctrlValue = this.invoiceForm.get('date')?.value || moment();
    ctrlValue = moment(ctrlValue).year(normalizedYear.year());
    this.invoiceForm.get('date')?.setValue(ctrlValue);
    this.InvoiceformData.emit(this.getInvoiceFormValue())
  }

  chosenMonthHandler(normalizedMonth: moment.Moment, datepicker: MatDatepicker<moment.Moment>) {
    let ctrlValue = this.invoiceForm.get('date')?.value || moment();
    ctrlValue = moment(ctrlValue).month(normalizedMonth.month());
    this.invoiceForm.get('date')?.setValue(ctrlValue);
    this.InvoiceformData.emit(this.getInvoiceFormValue())
    datepicker.close();
  }
  // date piker end


  // purchaseOrder summery from purchase order ..start
  // open summery of PO tranction start
  getPoSummary(poId: string) {
    if (poId !== '' && this.purchaseOrderForm.get('po')?.value) {
      this.invoiceService.getPOSummaryByPoId(poId).subscribe(
        {
          next: ((response: PurchaseOrderSummeryI) => {
            if (response.success) {
              const purchaseOrderFormData = {
                poNumber: this.purchaseOrderForm.get('poId')?.value,
                purchaseOrderMonth: String(moment(this.invoiceForm.get('date')?.value).format('MM') ?? ""),
                purchaseOrderYear: String(moment(this.invoiceForm.get('date')?.value).format('YYYY') ?? ""),
                purchaseOrderAmount: response.data.amount,
                purchaseOrderRemainingAmount: response.data.remainingAmount,
                transactions: response.data.transactions
              }
              this.purchaseOrderFormData = { ...purchaseOrderFormData };
              this.getPurchaseOrderForm();
              this.isDesableViewBtn=false;
              this._changeDetectorRef.detectChanges();
            }else{
              this.isDesableViewBtn=true;
              this.getPurchaseOrderForm();
            }
          }),
          error: ((err) => {
            this.getPurchaseOrderForm();
            this.isDesableViewBtn=true;
            console.log(`getPOSummaryByPoId ${err}`);
          })
        }
      )
    }
  }


  getPurchaseOrderDataLength(): number {
    return Object.keys(this.purchaseOrderFormData || {}).length;
  }
  
  // purchaseOrder summery from purchase order... end

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
