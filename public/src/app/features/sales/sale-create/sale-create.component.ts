import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, Output, ViewChild, inject, Injector, afterNextRender } from "@angular/core";
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatRadioModule } from "@angular/material/radio";
import { MatSelectModule } from "@angular/material/select";
import { Subject, takeUntil } from "rxjs";
import { SuccessModalComponent } from "../../../shared/components/UI/success-modal/success-modal.component";
import { MatSnackBar } from "@angular/material/snack-bar";
import { CdkTextareaAutosize } from "@angular/cdk/text-field";
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { SalesService } from "../sales.service";
import { AddressData, Branch, Company, Country, Customer, PaymentTerm, PaymentTermsI, Product, QuotationResponse, selectedProduct, Tax } from "src/app/shared/types/sales.type";
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sale-create',
  imports: [ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    CommonModule,
  ],

  templateUrl: './sale-create.component.html',
  styleUrl: './sale-create.component.scss'
})
export class SaleCreateComponent {
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
  public productForm!: FormGroup;
  public submitted = false;
  Customers: Customer[] = [];
  QuotationNo: string = '';
  PaymentTerms: PaymentTerm[] = [];
  Countries: Country[] = [];
  Companies: Company[] = [];
  Branches: Branch[] = [];
  Products: Product[] = [];
  Taxes: Tax[] = [];
  countryCurrency: string = ''
  selectedProduct: selectedProduct[] = [];
  Address: AddressData | null = null;
  public customerEmail: string = '';
  public formHeading: string = "Create";
  public customerId: string = '';
  private _unsubscribeAll$: Subject<any> = new Subject<any>();
  @ViewChild('fileInput') fileInput!: ElementRef<any>;
  @Input() Id: number = 0;
  @Output() formClose: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() isSideDrawerOpen!: boolean;
  constructor(
    private fb: FormBuilder,
    private _salesService: SalesService,
    private _changeDetetction: ChangeDetectorRef,
    private _successMessage: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.productForm = this.fb.group({
      quotationNumber: ['', Validators.required],
      customerId: ['', Validators.required],
      companyId: ['', Validators.required],
      companyBranchId: ['', Validators.required],
      countryId: ['', Validators.required],
      salesOrderDate: [new Date()],
      expectedShipmentDate: [''],
      paymentTermId: ['', Validators.required],
      deliveryMethod: [''],
      salesPerson: [''],
      items: this.fb.array([]),
      shippingCharges: ['', [Validators.pattern(/^\d*\.?\d*$/)]],
      adjustment: ['', [Validators.pattern(/^\d*\.?\d*$/)]]
    });
    this.clearForm();
  }
  noPastDates = (date: Date | null): boolean => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };
  ngOnChanges(): void {
    this.loadDropdownData();
  }
  createItem(): FormGroup {
    return this.fb.group({
      productId: [0, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      rate: [0, [Validators.required, Validators.min(0)]],
      discount: [0],
      discountType: ['rupee'],
      taxId: [0, Validators.required],
      isFixedDiscount: [true],
      subTotal: [0]
    });
  }
  addRow() {
    this.items.push(this.createItem());
  }
  deleteRow(index: number) {
    this.items.removeAt(index);
    this.onTaxChange();
  }
  get items(): FormArray {
    return this.productForm.get('items') as FormArray;
  }
  clearForm() {
    if (this.isSideDrawerOpen) {
      if (this.Id < 1) {
        this.formHeading = "Create";
        this.addRow();
      } else {
        this.formHeading = "Update";
        this.getQuotationDetails(this.Id);
        this._changeDetetction.detectChanges();
      }
    }
  }
  
  getQuotationDetails(id: number) {
    if (id !== 0) {
      this.Id = id;
      this._salesService
        .getQuotationById(id)
        .pipe(takeUntil(this._unsubscribeAll$))
        .subscribe((response: QuotationResponse) => {
          const quotationDetails = response.data;
          this.productForm.patchValue({
            customerId: quotationDetails.customerId,
            companyId: quotationDetails.companyId,
            companyBranchId: quotationDetails.companyBranchId,
            countryId: quotationDetails.countryId,
            quotationNumber: quotationDetails.quotationNumber,
            name: quotationDetails.salesPerson,
            salesOrderDate: new Date(quotationDetails.salesOrderDate),
            expectedShipmentDate: new Date(quotationDetails.expectedShippingDate),
            paymentTermId: quotationDetails.paymentTermId,
            deliveryMethod: quotationDetails.deliveryMethod,
            salesPerson: quotationDetails.salesPerson,
            shippingCharges: quotationDetails.shippingCharges,
            adjustment: quotationDetails.adjustment
          });
          this._changeDetetction.detectChanges();
          this.calculationDetails.subTotal = quotationDetails.subTotal;
          this.calculationDetails.total = quotationDetails.total;
          this.selectedCountryId = quotationDetails.countryId;
          this.selectedCustomerId = quotationDetails.customerId;
          this._salesService.getBranchDetailByCompanyId(quotationDetails.companyId)
            .subscribe((res) => {
              if (res.success) {
                this.Branches = res.data;
                this._changeDetetction.detectChanges();
              }
            });
          this._salesService.getTaxByCountry(this.selectedCountryId).subscribe((res) => {
            if (res.success) this.Taxes = res.data;
            this._changeDetetction.detectChanges();
          });
          this._salesService.getCustomerAddressByCoustomerId(this.selectedCustomerId).subscribe((res) => {
            if (res.success) this.Address = res.data;
            this._changeDetetction.detectChanges();
          });
          const itemsFormArray = this.productForm.get('items') as FormArray;
          quotationDetails.items.forEach(item => {
            itemsFormArray.push(this.fb.group({
              id: [item.id],
              productId: [item.productId, Validators.required],
              quantity: [item.quantity, Validators.required],
              rate: [item.rate, Validators.required],
              discount: [item.discount],
              discountType: ['rupee'],
              taxId: [item.taxId, Validators.required],
              subTotal: [item.subTotal]
            }));

            this.onTaxChange(null, itemsFormArray.length - 1);
            this._changeDetetction.detectChanges();
          });
        });
    }
  }
  createUpdate() {
    this.submitted = true;
    if (!this.productForm.valid) {
      this.productForm.markAllAsTouched();
      return;
    }
    const formValues = this.productForm.value;
    const payload = {
      id: this.Id || 0,
      customerId: formValues.customerId || 0,
      countryId: formValues.countryId || 0,
      companyId: formValues.companyId || 0,
      companyBranchId: formValues.companyBranchId || 0,
      quotationNumber: formValues.quotationNumber || "",
      salesOrderDate: formValues.salesOrderDate ? formValues.salesOrderDate.toISOString() : new Date().toISOString(),
      expectedShippingDate: formValues.expectedShipmentDate ? formValues.expectedShipmentDate.toISOString() : new Date().toISOString(),
      salesPerson: formValues.salesPerson || "",
      deliveryMethod: formValues.deliveryMethod || "",
      shippingCharges: formValues.shippingCharges || 0,
      paymentTermId: formValues.paymentTermId || 0,
      adjustment: formValues.adjustment || 0,
      subTotal: this.calculationDetails.subTotal || 0,
      total: this.calculationDetails.total || 0,
      items: formValues.items.map((item: any) => ({
        id: item.id || 0,
        productId: item.productId || 0,
        quantity: item.quantity || 0,
        rate: item.rate || 0,
        discount: item.discount || 0,
        taxId: item.taxId || 0,
        subTotal: item.subTotal || 0,
      })),
    };
    if (this.Id < 1) {
      this._salesService.createQuatation(payload).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.showSuccessMessage(response.message);
            this.resetForm();
            this.formClose.emit(true);
          } else {
            this.showSuccessMessage(response.message);
          }
        },
        error: (err) => {
          this.handleError(err);
        },
      });
    } else {
      this._salesService.updateQuatation(payload).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.showSuccessMessage(response.message);
            this.resetForm();
            this.formClose.emit(true);
          } else {
            this.showSuccessMessage(response.message);
          }
        },
        error: (err) => {
          this.handleError(err);
        },
      });
    }
  }

  resetForm() {
    this.submitted = false;
    this.productForm.reset();
    this.productForm.markAsPristine();
    this.productForm.markAsUntouched();
  }
  private showSuccessMessage(message: string) {
    this._successMessage.openFromComponent(SuccessModalComponent, {
      data: { message },
      duration: 4000,
      panelClass: ["custom-toast"],
      verticalPosition: "top",
      horizontalPosition: "right",
    });
  }
  private handleError(err: any) {
    this._successMessage.open(err.error.message, "Close", {
      duration: 4000,
      panelClass: ["error-toast"],
      verticalPosition: "top",
      horizontalPosition: "right",
    });
  }
  private showMessage(err: any) {
    this._successMessage.open(err, "Close", {
      duration: 4000,
      panelClass: ["error-toast"],
      verticalPosition: "top",
      horizontalPosition: "right",
    });
  }
  private loadDropdownData(): void {
    this._salesService.CustomerList().subscribe((response) => {
      if (response.success) this.Customers = response.data;
    });
    this._salesService.getQuotationNumber().subscribe((res) => {
      if (res.success) this.QuotationNo = res.data;
      this.productForm.controls['quotationNumber'].setValue(this.QuotationNo);
    });
    this._salesService.getPaymentTerms().subscribe((res) => {
      if (res.success) this.PaymentTerms = res.data;
    });
    this._salesService.getCountry().subscribe((res) => {
      if (res.success) this.Countries = res.data;
    });
    this._salesService.getProduct().subscribe((res) => {
      if (res.success) this.Products = res.data;
    });
  }
  selectedCustomerId: number = 0;
  onCustomerSelect(event: any) {
    this.selectedCustomerId = event.value;
    this._salesService.getCustomerAddressByCoustomerId(this.selectedCustomerId).subscribe((res) => {
      if (res.success) this.Address = res.data;
      this._changeDetetction.detectChanges();
    });
  }
  selectedCompanyId: number = 0;
  onCompanySelect(event: any) {
    this.selectedCompanyId = event.value;
    this._salesService.getBranchDetailByCompanyId(this.selectedCompanyId).subscribe((res) => {
      if (res.success) this.Branches = res.data;
    });
  }
  selectedCountryId: number = 0;
  noCompaniesMessage: string = '';
  onCountrySelect(event: any) {
    this.selectedCountryId = event.value;
    this._salesService.getTaxByCountry(this.selectedCountryId).subscribe((res) => {
      if (res.success) this.Taxes = res.data;
    });
    this._salesService.getCountryCurrency(this.selectedCountryId).subscribe((res) => {
      if (res.success) this.countryCurrency = res.data;
    });
    this._salesService.getCompany(this.selectedCountryId).subscribe((res) => {
      if (res.success) {
        this.Companies = res.data;
        if( this.Companies.length==0){
          this.noCompaniesMessage =res.message;
          this.showMessage(this.noCompaniesMessage );
        }
       
      } else {
        this.noCompaniesMessage = res.message; 
      }
    });
  }
  selectedProductId: number = 0;
  onProductSelect(event: any, index: number) {
    this.selectedProductId = event.value;
    this.currentRowIndex = index;
    this._salesService.getProductById(this.selectedProductId).subscribe((res) => {
      if (res.success && res.data.length > 0) {
        const selectedProduct = res.data[0];
        this.items.at(index).patchValue({
          rate: selectedProduct.salesPrice
        });
        this.items.at(index).get('rate')?.valueChanges.subscribe(() => {
          this.amountCalculate();
        });
        this.amountCalculate();
      }
    });
  }
  currentRowIndex: number = -1;
  amountCalculate() {
    if (this.currentRowIndex === -1) {
      console.warn('No row selected for calculation.');
      return;
    }
    const currentItem = this.items.at(this.currentRowIndex);
    if (!currentItem) {
      console.error('Invalid row selected:', this.currentRowIndex);
      return;
    }
    const payload = {
      productId: this.selectedProductId || 0,
      quantity: currentItem.get('quantity')?.value || 1,
      salesPrice: currentItem.get('rate')?.value || 0,
      isFixedDiscount: currentItem.get('isFixedDiscount')?.value || true,
      discount: currentItem.get('discount')?.value || 0,
    };
    this._salesService.calculateItemsAmount(payload).subscribe({
      next: (response: any) => {
        if (response.success) {
          currentItem.patchValue({
            subTotal: response.data
          });
          this._changeDetetction.detectChanges();
          this.onTaxChange()
        }
      },
      error: (err) => {
        this.handleError(err);
      },
    });
  }
  setCurrentRowIndex(index: number) {
    this.currentRowIndex = index;
  }
  onDiscountTypeChange(event: any, index: number) {
    const selectedType = event.target.value;
    const isFixedDiscount = selectedType === 'rupee';
    this.items.at(index).patchValue({ isFixedDiscount });
  }
  selectedTaxId: number = 0;
  subTotal: number = 0;
  calculationDetails: any = {};
  onTaxChange(event?: any, index?: number) {
    const items = this.productForm.get('items') as FormArray;
    if (event && index !== undefined) {
      this.selectedTaxId = event?.value;
    }
    const productTaxes = items.controls.map((item, idx) => {
      const productId = item.get('productId')?.value;
      const subTotal = item.get('subTotal')?.value;
      const countryId = this.selectedCountryId;
      const taxId = item.get('taxId')?.value;
      if (productId) {
        return {
          productId: productId,
          pSubTotal: subTotal,
          countryId: countryId,
          taxId: taxId
        };
      }
      return null;
    }).filter(item => item !== null);
    const payload = {
      productTaxes: productTaxes,
      shippingCharges: this.productForm.value.shippingCharges || 0,
      adjustment: this.productForm.value.adjustment || 0
    };
    this._salesService.calculateFinalAmount(payload).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.calculationDetails = {
            subTotal: response.data.subTotal,
            shippingCharge: response.data.shippingCharge,
            adjustment: response.data.adjustment,
            total: response.data.total,
            taxes: response.data.taxes
          };
          this._changeDetetction.detectChanges();
        }
      },
      error: (err) => {
        this.handleError(err);
      },
    });
  }
  invalidShippingChargesInput: boolean = false;
  onShippingChargesChange(event: any): void {
    const value = event.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      this.productForm.patchValue({ shippingCharges: value }, { emitEvent: false });
      this.invalidShippingChargesInput = false; 
      this.onTaxChange(event, -1);
    } else {
      this.invalidShippingChargesInput = true; 
      this.productForm.patchValue({ shippingCharges: value.slice(0, -1) }, { emitEvent: false });
    }
  }
  invalidAdjustmentInput: boolean = false; 
  onAdjustmentChange(event: any) {
    const value = event.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      this.productForm.patchValue({ adjustment: value }, { emitEvent: false });
      this.invalidAdjustmentInput = false;
      this.onTaxChange(event, -1);
    } else {
      this.invalidAdjustmentInput = true; 
      this.productForm.patchValue({ adjustment: value.slice(0, -1) }, { emitEvent: false });
    }
  }
  ngOnDestroy(): void {
    this.resetForm();
    this._unsubscribeAll$.next(
      this._salesService.getProductByProductId(this.Id),
    );
    this._unsubscribeAll$.complete();
  }
}
