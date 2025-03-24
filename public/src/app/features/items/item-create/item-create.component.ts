import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  inject,
  Injector,
  afterNextRender
} from "@angular/core";
import {
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from "@angular/forms";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatRadioModule } from "@angular/material/radio";
import { MatSelectModule } from "@angular/material/select";
import { Subject, takeUntil } from "rxjs";
import { SuccessModalComponent } from "../../../shared/components/UI/success-modal/success-modal.component";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ItemsService } from "../items.service";
import { productDetailsI, Service,Unit } from "src/app/shared/types/items.type";
import { CdkTextareaAutosize } from "@angular/cdk/text-field";
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-item-create',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    MatSlideToggleModule
  ],
  templateUrl: './item-create.component.html',
  styleUrl: './item-create.component.scss'
})
export class ItemCreateComponent {
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
  Units: Unit[] = [];
  Services: Service[] = [];
  public logoFile!: File | any;
  public customerLogoUrl!: string | null;
  public customerName: string='';
  public customerEmail: string='';
  public formHeading: string = "Create";
  public customerId: string='';
  public editedformData = new FormData();
  private _unsubscribeAll$: Subject<any> = new Subject<any>();
  @ViewChild('fileInput') fileInput!: ElementRef<any>;
  @Input() Id: number = 0;
  @Output() formClose: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() isSideDrawerOpen!: boolean;
  constructor(
    private _formBuilder: FormBuilder,
    private _itemService: ItemsService,
    private _changeDetetction: ChangeDetectorRef,
    private _successMessage: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.productForm = this._formBuilder.group({
      isService: [true, Validators.required],  // Default value is 'true' (Good)
      name: ["", [Validators.required, Validators.pattern("^[a-z A-Z]*$")]],
      sku: ["", ],
      unitId: [""],
      hsnCode: [""],
      description: [""],
      serviceId: [""],
      isActive: [false], 
      costPrice: [
        "",
        [Validators.required, Validators.pattern("^[0-9]+(\\.[0-9]{1,2})?$")],
      ],
      salesPrice: [
        "",
        [Validators.required, Validators.pattern("^[0-9]+(\\.[0-9]{1,2})?$")],
      ],
    });
  
    // After initializing the form, load data and patch the form
    this.clearForm();
  }
  

  ngOnChanges(): void {
    this.loadDropdownData();
  }

  // clear Form
  clearForm() {
    if (this.isSideDrawerOpen) {
      if (this.Id < 1) {
        // Create mode
        this.formHeading = "Create";
      } else {
        // Edit mode: Patch the form with existing data
        this.formHeading = "Update";
        this.getProductDetails(this.Id);
        // this.productForm.controls['productId'].disable();
        this._changeDetetction.detectChanges();
      }
    }
  }



  getProductDetails(id: number) {
    if (id !== 0) {
      this.Id = id;
      this._itemService
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
                isActive:product.isActive
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
      this._itemService.addProduct(payload).subscribe({
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
      this._itemService.updateProduct(payload).subscribe({
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
  
  uploadCustomerLogo(event: any) {
    this.logoFile = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.customerLogoUrl = e.target.result;
      this._changeDetetction.detectChanges();
    };
    reader.readAsDataURL(this.logoFile);
  }



triggerCustomerFileInput() {
  this.fileInput.nativeElement.click(); 
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

    private loadDropdownData(): void {
    this._itemService.UnitList().subscribe((response) => {
      if (response.success) this.Units = response.data;
    });
    this._itemService.getServices().subscribe((res) => {
      if (res.success) this.Services = res.data;
    });
  }

  ngOnDestroy(): void {
    this.resetForm();
    this._unsubscribeAll$.next(
      this._itemService.getProductByProductId(this.Id),
    );
    this._unsubscribeAll$.complete();
  }
}

