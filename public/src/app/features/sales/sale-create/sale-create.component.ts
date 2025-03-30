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
import { productDetailsI, Service, Unit } from "src/app/shared/types/items.type";
import { CdkTextareaAutosize } from "@angular/cdk/text-field";
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { SalesService } from "../sales.service";
import { Branch, Company, Country, Customer, PaymentTerm, PaymentTermsI, Product, selectedProduct, selectedProductI, Tax } from "src/app/shared/types/sales.type";

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core'; // For native date adapter
import { MatIconModule } from '@angular/material/icon'; // For calendar icon
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
    CommonModule],

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
  countryCurrency:string=''
  selectedProduct: selectedProduct[] = [];
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
      name: [''],
      quotationNumber: ['', Validators.required],
      customerId: ['', Validators.required],
      companyId:['', Validators.required],
      companyBranchId:['', Validators.required],
      countryId:['', Validators.required],
      salesOrderDate: [new Date()],
      expectedShipmentDate: [''],
      paymentTermId: ['', Validators.required],
      deliveryMethod: [''],
      salesPerson: [''],
      items: this.fb.array([this.createItem()]),
      shippingCharges: [0], 
      adjustment: [0] 
    });
    
    this.clearForm();
  }

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
      subTotal: [{ value: 0, disabled: true }]
    });
  }

  addRow() {
    this.items.push(this.createItem());
  }


  // deleteRow(index: number) {
  //   this.items.removeAt(index);
  //   console.log(this.items,'this.items')
  // }

  deleteRow(index: number) {
    // Step 1: Remove the item from the form array
    this.items.removeAt(index);
    console.log(this.items, 'Updated items after deletion');
  
    // Step 2: Recalculate totals
    this.onTaxChange();
  }

  get items(): FormArray {
    return this.productForm.get('items') as FormArray;
  }

  clearForm() {
    if (this.isSideDrawerOpen) {
      if (this.Id < 1) {
        this.formHeading = "Create";
      } else {
        this.formHeading = "Update";
        this.getProductDetails(this.Id);
        this._changeDetetction.detectChanges();
      }
    }
  }
  getProductDetails(id: number) {
    if (id !== 0) {
      this.Id = id;
      this._salesService
        .getProductByProductId(id)
        .pipe(takeUntil(this._unsubscribeAll$))
        .subscribe((response: productDetailsI) => {
          if (response.success) {
            if (response.data && response.data.length > 0) {
              const product = response.data[0];
              this.productForm.patchValue({
                name: product.name,
                sku: product.sku,
                hsnCode: product.hsnCode,
                description: product.description,
                salesPrice: product.salesPrice,
                costPrice: product.costPrice,
                unitId: product.unitId,
                serviceId: product.serviceId,
                isService: product.isService,
                isActive: product.isActive
              });
              this._changeDetetction.detectChanges();
            } else {
              console.log('No products found');
            }
          } else {
            console.log('Failed to fetch product details');
          }
        });
    }
  }
  // createUpdate() {
  //   this.submitted = true;
  //   if (!this.productForm.valid) {
  //     this.productForm.markAllAsTouched();
  //     return;
  //   }
  //   const payload = {
  //     ...this.productForm.value,
  //     Id: this.Id || 0,
  //   };
  //   if (this.Id < 1) {
  //     this._salesService.addProduct(payload).subscribe({
  //       next: (response: any) => {
  //         if (response.success) {
  //           this.showSuccessMessage(response.message);
  //           this.resetForm();
  //           this.formClose.emit(true);
  //         } else {
  //           this.showSuccessMessage(response.message);
  //         }
  //       },
  //       error: (err) => {
  //         this.handleError(err);
  //         console.error("Error Status:", err.status);
  //         console.error("Error Message:", err.error);
  //       },
  //     });
  //   } else {
  //     this._salesService.updateProduct(payload).subscribe({
  //       next: (response: any) => {
  //         if (response.success) {
  //           this.showSuccessMessage(response.message);
  //           this.resetForm();
  //           this.formClose.emit(true);
  //         } else {
  //           this.showSuccessMessage(response.message);
  //         }
  //       },
  //       error: (err) => {
  //         this.handleError(err);
  //         console.error("Error Status:", err.status);
  //         console.error("Error Message:", err.error);
  //       },
  //     });
  //   }
  // }

  createUpdate() {
    this.submitted = true;
    if (!this.productForm.valid) {
      this.productForm.markAllAsTouched();
      return;
    }
  
    const formValues = this.productForm.value;
  
    // Construct the payload
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
          console.error("Error Status:", err.status);
          console.error("Error Message:", err.error);
        },
      });
    } else {
      this._salesService.updateProduct(payload).subscribe({
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
          console.error("Error Status:", err.status);
          console.error("Error Message:", err.error);
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
    console.error("Error Status:", err.status);
    console.error("Error Message:", err.error);
    this._successMessage.open(err.error.message, "Close", {
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
    this._salesService.getCompany().subscribe((res) => {
      if (res.success) this.Companies = res.data;
    });

    this._salesService.getProduct().subscribe((res) => {
      if (res.success) this.Products = res.data;
    });
  }
  selectedCompanyId: number = 0;
  onCompanySelect(event: any) {
    this.selectedCompanyId = event.value;
    console.log(this.selectedCompanyId,'this.selectedCompanyId')
    this._salesService.getBranchDetailByCompanyId(this.selectedCompanyId).subscribe((res) => {
      if (res.success) this.Branches = res.data;
    });
  }
  selectedCountryId: number = 0;
  onCountrySelect(event: any) {
    this.selectedCountryId = event.value;
    this._salesService.getTaxByCountry(this.selectedCountryId).subscribe((res) => {
      if (res.success) this.Taxes = res.data;
    });
    this._salesService.getCountryCurrency(this.selectedCountryId).subscribe((res) => {
      if (res.success) this.countryCurrency = res.data;
    });

  }

  // onProductSelect(event: any) {
  //   const selectedProductId = event.value;
  //   this._salesService.getProductById(selectedProductId).subscribe((res) => {
  //     if (res.success) this.selectedProduct = res.data;
  //   });
  // }
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

        // Subscribe karna
        this.items.at(index).get('rate')?.valueChanges.subscribe(() => {
          this.amountCalculate();
        });

        this.amountCalculate();
      }
    });
  }



  // calculateAmount(index: number) {
  //   const item = this.items[index];

  //   let discountAmount = 0;
  //   if (item.discountType === 'rupee') {
  //     discountAmount = item.discount;
  //   } else if (item.discountType === '%') {
  //     discountAmount = (item.rate * item.discount) / 100;
  //   }

  //   const subTotal = (item.quantity * item.rate) - discountAmount;
  //   item.subTotal = parseFloat(subTotal.toFixed(3)); // Keeping precision to 3 decimal places
  // }
  currentRowIndex: number = -1; // Initialize with -1 (no row selected)

  // amountCalculate() {
  //   if (this.currentRowIndex === -1) {
  //     console.warn('No row selected for calculation.');
  //     return;
  //   }

  //   const currentItem = this.items.at(this.currentRowIndex);
  //   console.log('Current Item:', currentItem.value);

  //   const payload = {
  //     productId: this.selectedProductId,
  //     quantity: currentItem.get('quantity')?.value,
  //     salesPrice: currentItem.get('rate')?.value,
  //     isFixedDiscount: currentItem.get('isFixedDiscount')?.value,
  //     discount: currentItem.get('discount')?.value
  //   };

  //   console.log('Payload:', payload);

  //   this._salesService.calculateItemsAmount(payload).subscribe({
  //     next: (response: any) => {
  //       if (response.success) {
  //         console.log('Calculation successful', response);
  //         currentItem.patchValue({
  //           subTotal: response.data  // Assuming response.data contains the correct value
  //         });
  //       }
  //     },
  //     error: (err) => {
  //       this.handleError(err);
  //       console.error('Error Status:', err.status);
  //       console.error('Error Message:', err.error);
  //     },
  //   });
  // }
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
  
    console.log('Current Item:', currentItem.value);
  
    const payload = {
      productId: this.selectedProductId || 0,
      quantity: currentItem.get('quantity')?.value || 0,
      salesPrice: currentItem.get('rate')?.value || 0,
      isFixedDiscount: currentItem.get('isFixedDiscount')?.value || 0,
      discount: currentItem.get('discount')?.value || 0
    };
    
  
    console.log('Payload:', payload);
  
    this._salesService.calculateItemsAmount(payload).subscribe({
      next: (response: any) => {
        if (response.success) {
          console.log('Calculation successful', response);
          currentItem.patchValue({
            subTotal: response.data
          });
        }
      },
      error: (err) => {
        this.handleError(err);
        console.error('Error Status:', err.status);
        console.error('Error Message:', err.error);
      },
    });
  }
  


  setCurrentRowIndex(index: number) {
    this.currentRowIndex = index;
  }
  onDiscountTypeChange(event: any, index: number) {
    const selectedType = event.target.value;
    const isFixedDiscount = selectedType === 'rupee';

    // Update the corresponding form control
    this.items.at(index).patchValue({ isFixedDiscount });
  }
  selectedTaxId: number = 0;
  subTotal:number=0;
  calculationDetails:any={};
  onTaxChange(event?: any, index?: number) {
    this.selectedTaxId = event?.value;
    // if(index){
    //   this.currentRowIndex = index;
    // }
    // if (this.currentRowIndex === -1) {
    //   console.warn('No row selected for calculation.');
    //   return;
    // }
  
    const productTaxes = this.items.controls.map((item, idx) => {
      const productId = item.get('productId')?.value;
      const subTotal = item.get('subTotal')?.value;
      const countryId = this.selectedCountryId;  
      const taxId = item.get('taxId')?.value;
  
      if (productId && taxId) {  
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
  
    console.log('Payload:', payload);
  
    this._salesService.calculateFinalAmount(payload).subscribe({
      next: (response: any) => {
        if (response.success) {
          console.log('Final Calculation Successful', response);
  
          // Saving amounts separately
          this.calculationDetails = {
            subTotal: response.data.subTotal,
            shippingCharge: response.data.shippingCharge,
            adjustment: response.data.adjustment,
            total: response.data.total,
            taxes: response.data.taxes
          };
        }
      },
      error: (err) => {
        this.handleError(err);
        console.error('Error Status:', err.status);
        console.error('Error Message:', err.error);
      },
    });
  }

  onShippingChargesChange(event: any) {
    const value = parseFloat(event.target.value) || 0;
    this.productForm.patchValue({
      shippingCharges: value
    });
    this.onTaxChange(event, -1); // Recalculate totals
  }
  
  onAdjustmentChange(event: any) {
    const value = parseFloat(event.target.value) || 0;
    this.productForm.patchValue({
      adjustment: value
    });
    this.onTaxChange(event, -1); // Recalculate totals
  }
  ngOnDestroy(): void {
    this.resetForm();
    this._unsubscribeAll$.next(
      this._salesService.getProductByProductId(this.Id),
    );
    this._unsubscribeAll$.complete();
  }
}
