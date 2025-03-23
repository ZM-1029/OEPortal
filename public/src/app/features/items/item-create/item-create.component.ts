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
import { customerDetailsI } from "../../../shared/types/customer.type";
import { SuccessModalComponent } from "../../../shared/components/UI/success-modal/success-modal.component";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ItemsService } from "../items.service";
import { Service,Unit } from "src/app/shared/types/items.type";
import { CdkTextareaAutosize } from "@angular/cdk/text-field";

@Component({
  selector: 'app-item-create',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
  
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
      sku: ["", [Validators.pattern("^[a-z A-Z]*$")]],
      unitId: [""],
      hsnCode: ["", [Validators.pattern("^[0-9]+(\\.[0-9]{1,2})?$")]],
      description: [""],
      serviceId: [""],
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
    // this.clearForm();
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
        this.productForm.reset();
        this.deleteImage();
      } else {
        // Edit mode: Patch the form with existing data
        this.formHeading = "Update";
        this.getCustomerDetails(this.Id);
        this.productForm.controls['CustomerId'].disable();
        this._changeDetetction.detectChanges();
      }
    }
  }

  // get Customer Details
  getCustomerDetails(id: number) {
    if (id !== 0) {
      this.Id = id;
      this._itemService
        .getCustomerByCustomerId(id)
        .pipe(takeUntil(this._unsubscribeAll$))
        .subscribe((response: customerDetailsI) => {
          if (response.success) {
            // Patch the form with the received data
            this.productForm.patchValue({
              Id: response.customer.id,
              CustomerId: response.customer.customerId,
              CustomerName: response.customer.customerName,
              PhoneNumber: response.customer.phoneNumber,
              PrimaryContact: response.customer.primaryContact,
              Email: response.customer.email,
              Logo: response.customer.logo,
              Address: response.customer.address,
              PostalCode: response.customer.postalCode,
              Country: response.customer.country,
              Taxid: response.customer.taxid,
              BusinessType: response.customer.businessType,
            });
            
            // Specifically patch the `isService` control with the correct value (Good or Service)
            this.productForm.patchValue({
              // Patch the form data including 'isService' value from the response
              // isService: response.customer.isService !== undefined ? response.customer.isService : true, // Default to 'true' if undefined
            });
            
            this._changeDetetction.detectChanges();
          }
        });
    }
  }

  // Create Edit Customer
  // createUpdate() {
  //   this.submitted = true;
  //   const formData = new FormData();
  //   if (!this.productForm.valid) {
  //     this.productForm.markAllAsTouched();
  //     return;
  //   }
  //   if (this.productForm.valid) {
  //     for (let key in this.productForm.value) {
  //       if (this.productForm.value.hasOwnProperty(key)) {
  //         if (Array.isArray(this.productForm.value[key])) {
  //           this.productForm.value[key].forEach((item, index) => {
  //             formData.append(`${key}[${index}]`, item);
  //           });
  //         } else {
  //           if (key == "LogoFile") {
  //             this.productForm.value[key] = this.logoFile;
  //           } else if (this.productForm.value[key] == undefined || null) {
  //             this.productForm.value[key] = "";
  //           }
  //           formData.append(key, this.productForm.value[key]);
  //         }
  //       }
  //     }
  //     if (this.Id < 1) {
  //       formData.append("Id", "0");
  //       formData.append("isService", "true");
  //       this._itemService.addProduct(formData).subscribe({
  //         next: (response: any) => {
  //           if (response.success) {
  //             console.log("Success:", response);
  //             this.showSuccessMessage(response.message);
  //             this.resetForm();
  //             console.log(1);
  //             this.formClose.emit(true);
  //           } else {
  //             this.showSuccessMessage(response.message);
  //           }
  //         },
  //         error: (err) => {
  //           this.handleError(err);
  //           console.error("Error Status:", err.status);
  //           console.error("Error Message:", err.error);
  //         },
  //       });
  //     } else {
  //       formData.append("Id", this.Id.toString());
  //       formData.append("Status", "true");
  //       this._itemService.updateCustomer(this.Id, formData).subscribe({
  //         next: (response: any) => {
  //           if (response.success) {
  //             console.log("Success:", response);
  //             this.showSuccessMessage(response.message);
  //             this.resetForm();
  //             console.log(1);
  //             this.formClose.emit(true);
  //           } else {
  //             this.showSuccessMessage(response.message);
  //           }
  //         },
  //         error: (err) => {
  //           this.handleError(err);
  //           console.error("Error Status:", err.status);
  //           console.error("Error Message:", err.error);
  //         },
  //       });
  //     }
  //   }
  // }
  createUpdate() {
    this.submitted = true;
  
    // Ensure the form is valid before proceeding
    if (!this.productForm.valid) {
      this.productForm.markAllAsTouched();
      return;
    }
  
    // Convert costPrice and salesPrice to numbers
    const costPrice = parseFloat(this.productForm.get('costPrice')?.value);
    const salesPrice = parseFloat(this.productForm.get('salesPrice')?.value);
  
    // Prepare the payload as a simple JSON object, including the converted values
    const payload = {
      ...this.productForm.value,  // Spread all the form values
      costPrice: isNaN(costPrice) ? 0 : costPrice, // Ensure it's a number
      salesPrice: isNaN(salesPrice) ? 0 : salesPrice, // Ensure it's a number
      Id: this.Id || 0, // Include the Id, default to 0 if it's a new record
    };
  
    // Send the payload in the request
    if (this.Id < 1) {
      // For adding a new product
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
      // For updating an existing product
      this._itemService.updateCustomer(this.Id, payload).subscribe({
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
    this.deleteImage();
  }
  

  // Handles image upload
  uploadCustomerLogo(event: any) {
    this.logoFile = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.customerLogoUrl = e.target.result;
      this._changeDetetction.detectChanges();
    };
    reader.readAsDataURL(this.logoFile);
  }

  // Deletes the current image
  deleteImage() {
    this.customerLogoUrl = null;
    this.logoFile = null;
  }

  // 
triggerCustomerFileInput() {
  this.fileInput.nativeElement.click(); 
}
  // 

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
      console.log(this.Units)
    });
    this._itemService.getServices().subscribe((res) => {
      if (res.success) this.Services = res.data;
    });
  }

  ngOnDestroy(): void {
    this.resetForm();
    this._unsubscribeAll$.next(
      this._itemService.getCustomerByCustomerId(this.Id),
    );
    this._unsubscribeAll$.complete();
  }
}

