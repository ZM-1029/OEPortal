import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, Output, ViewChild, inject, Injector, afterNextRender } from "@angular/core";
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators,FormArray } from "@angular/forms";
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
  imports: [   ReactiveFormsModule,
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
  PaymentTerms:PaymentTerm[]=[];
  Countries:Country[]=[];
  Companies:Company[]=[];
  Branches:Branch[]=[];
  Products:Product[]=[];
  Taxes:Tax[]=[];
  selectedProduct:selectedProduct[]=[];
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
      name: ['', [Validators.required, Validators.pattern("^[a-z A-Z]*$")]],
      quotationNumber: ['', Validators.required],
      customerId: ['', Validators.required],
      salesOrderDate: [new Date()],
      expectedShipmentDate: [''],
      paymentTermId: ['', Validators.required],
      deliveryMethod: [''],
      salesPerson: [''],
      countryId: ['', Validators.required],
      items: this.fb.array([this.createItem()])
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
  
  
  deleteRow(index: number) {
    this.items.removeAt(index);
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
  createUpdate() {
    this.submitted = true;
    if (!this.productForm.valid) {
      this.productForm.markAllAsTouched();
      return;
    }
    const costPrice = parseFloat(this.productForm.get('costPrice')?.value);
    const salesPrice = parseFloat(this.productForm.get('salesPrice')?.value);
    const payload = {
      ...this.productForm.value,
      costPrice: isNaN(costPrice) ? 0 : costPrice,
      salesPrice: isNaN(salesPrice) ? 0 : salesPrice,
      Id: this.Id || 0,
    };
    if (this.Id < 1) {
      this._salesService.addProduct(payload).subscribe({
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
  onCompanySelect(event: any) {
    const selectedCompanyId = event.value;
    this._salesService.getBranchDetailByCompanyId(selectedCompanyId).subscribe((res) => {
      if (res.success) this.Branches = res.data;
    });
  }

  onCountrySelect(event: any) {
    const selectedCompanyId = event.value;
    this._salesService.getTaxByCountry(selectedCompanyId).subscribe((res) => {
      if (res.success) this.Taxes = res.data;
    });
  }

  // onProductSelect(event: any) {
  //   const selectedProductId = event.value;
  //   this._salesService.getProductById(selectedProductId).subscribe((res) => {
  //     if (res.success) this.selectedProduct = res.data;
  //   });
  // }
  selectedProductId:number=0;
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

  amountCalculate() {
    if (this.currentRowIndex === -1) {
      console.warn('No row selected for calculation.');
      return;
    }
  
    const currentItem = this.items.at(this.currentRowIndex);
    console.log('Current Item:', currentItem.value);
  
    const payload = {
      productId: this.selectedProductId,
      quantity: currentItem.get('quantity')?.value,
      salesPrice: currentItem.get('rate')?.value,
      isFixedDiscount: currentItem.get('isFixedDiscount')?.value,
      discount: currentItem.get('discount')?.value
    };
  
    console.log('Payload:', payload);
  
    this._salesService.calculateItemsAmount(payload).subscribe({
      next: (response: any) => {
        if (response.success) {
          console.log('Calculation successful', response);
          currentItem.patchValue({
            subTotal: response.data  // Assuming response.data contains the correct value
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
  ngOnDestroy(): void {
    this.resetForm();
    this._unsubscribeAll$.next(
      this._salesService.getProductByProductId(this.Id),
    );
    this._unsubscribeAll$.complete();
  }
}
