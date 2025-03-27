import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, Output, ViewChild, inject, Injector, afterNextRender } from "@angular/core";
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, } from "@angular/forms";
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
import { Branch, Company, Country, Customer, PaymentTerm, PaymentTermsI } from "src/app/shared/types/sales.type";

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core'; // For native date adapter
import { MatIconModule } from '@angular/material/icon'; // For calendar icon


@Component({
  selector: 'app-sale-create',
  imports: [   ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule],
  
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
  public customerEmail: string = '';
  public formHeading: string = "Create";
  public customerId: string = '';
  private _unsubscribeAll$: Subject<any> = new Subject<any>();
  @ViewChild('fileInput') fileInput!: ElementRef<any>;
  @Input() Id: number = 0;
  @Output() formClose: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() isSideDrawerOpen!: boolean;
  constructor(
    private _formBuilder: FormBuilder,
    private _salesService: SalesService,
    private _changeDetetction: ChangeDetectorRef,
    private _successMessage: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.productForm = this._formBuilder.group({
      name: ["", [Validators.required, Validators.pattern("^[a-z A-Z]*$")]],
      quotationNumber: ["",],
      customerId: [""],
      salesOrderDate: [new Date()],
      expectedShipmentDate:[''],
      paymentTermId: [""],
      deliveryMethod: [""],
      salesPerson: [''],
      countryId: [""],
      
    });
    this.clearForm();
  }
  ngOnChanges(): void {
    this.loadDropdownData();
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
  }
  onCompanySelect(event: any) {
    const selectedCompanyId = event.value;
    this._salesService.getBranchDetailByCompanyId(selectedCompanyId).subscribe((res) => {
      if (res.success) this.Branches = res.data;
    });
  }
  ngOnDestroy(): void {
    this.resetForm();
    this._unsubscribeAll$.next(
      this._salesService.getProductByProductId(this.Id),
    );
    this._unsubscribeAll$.complete();
  }
}
