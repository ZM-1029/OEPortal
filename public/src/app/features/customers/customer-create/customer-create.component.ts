import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
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
import { CustomersService } from "../customers.service";
import { NgClass, NgIf } from "@angular/common";
import { SuccessModalComponent } from "../../../shared/components/UI/success-modal/success-modal.component";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: "app-customer-create",
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    NgIf,
    NgClass,
  ],
  templateUrl: "./customer-create.component.html",
  styleUrl: "./customer-create.component.scss",
})
export class CustomerCreateComponent implements OnInit, OnChanges, OnDestroy {
  public customerForm!: FormGroup;
  public submitted = false;
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
    private _customerService: CustomersService,
    private _changeDetetction: ChangeDetectorRef,
    private _successMessage: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.customerForm = this._formBuilder.group({
      CustomerId: [""],
      CustomerName: [
        "",
        [Validators.required, Validators.pattern("^[a-z A-Z]*$")],
      ],
      PhoneNumber: [
        "",
        [Validators.pattern("^[0-9]*$"), Validators.maxLength(10)],
      ],
      PrimaryContact: ["", [, Validators.pattern("^[a-z A-Z]*$")]],
      Email: ["", [Validators.required, Validators.email]],
      Address: [""],
      PostalCode: [
        "",
        [Validators.maxLength(10), Validators.pattern("^[0-9]*$")],
      ],
      Logo: [""],
      LogoFile: [""],
      Country: ["", [Validators.pattern("^[a-zA-Z]*$")]],
      Taxid: ["", [Validators.pattern("^[0-9]*$")]],
      BusinessType: ["", Validators.required],
    });
    this.clearForm();
  }

  ngOnChanges(): void {
    
  }

  // clear Form
  clearForm() {
    if (this.isSideDrawerOpen) {
      if (this.Id < 1) {
        this.formHeading = "Create";
        this.customerForm.reset();
        this.deleteImage();
      } else {
        this.formHeading = "Update";
        this.getCustomerDetails(this.Id);
        this.customerForm.controls['CustomerId'].disable()
        this._changeDetetction.detectChanges();
      }
    }
  }

  // get Customer Details
  getCustomerDetails(id: number) {
    if (id !== 0) {
      this.Id = id;
      this._customerService
        .getCustomerByCustomerId(id)
        .pipe(takeUntil(this._unsubscribeAll$))
        .subscribe((response: customerDetailsI) => {
          if (response.success) {
            this.customerForm.patchValue({
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
            for (let key in this.customerForm.value) {
              if (key == "Logo") {
                this.customerLogoUrl = this.customerForm.value[key];
                this._changeDetetction.detectChanges();
              } else if (key == "CustomerName") {
                this.customerName = this.customerForm.value[key];
              } else if (key == "CustomerId") {
                this.customerId = this.customerForm.value[key];
              } else if (key == "Email") {
                this.customerEmail = this.customerForm.value[key];
              }
            }
          }
        });
    }
  }

  // Create Edit Customer
  createUpdate() {
    this.submitted = true;
    const formData = new FormData();
    if (!this.customerForm.valid) {
      this.customerForm.markAllAsTouched();
      return;
    }
    if (this.customerForm.valid) {
      for (let key in this.customerForm.value) {
        if (this.customerForm.value.hasOwnProperty(key)) {
          if (Array.isArray(this.customerForm.value[key])) {
            this.customerForm.value[key].forEach((item, index) => {
              formData.append(`${key}[${index}]`, item);
            });
          } else {
            if (key == "LogoFile") {
              this.customerForm.value[key] = this.logoFile;
            } else if (this.customerForm.value[key] == undefined || null) {
              this.customerForm.value[key] = "";
            }
            formData.append(key, this.customerForm.value[key]);
          }
        }
      }
      if (this.Id < 1) {
        formData.append("Id", "0");
        formData.append("Status", "true");
        this._customerService.createCustomer(formData).subscribe({
          next: (response: any) => {
            if (response.success) {
              console.log("Success:", response);
              this.showSuccessMessage(response.message);
              this.resetForm();
              console.log(1);
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
        formData.append("Id", this.Id.toString());
        formData.append("Status", "true");
        this._customerService.updateCustomer(this.Id, formData).subscribe({
          next: (response: any) => {
            if (response.success) {
              console.log("Success:", response);
              this.showSuccessMessage(response.message);
              this.resetForm();
              console.log(1);
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
  }

  // reset form
  // resetForm() {
  //   this.submitted = false;
  //   this.customerForm.reset();
  //   this.deleteImage();
  // }
  resetForm() {
    this.submitted = false;
    this.customerForm.reset();
    this.customerForm.markAsPristine();
    this.customerForm.markAsUntouched();
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

  ngOnDestroy(): void {
    this.resetForm();
    this._unsubscribeAll$.next(
      this._customerService.getCustomerByCustomerId(this.Id),
    );
    this._unsubscribeAll$.complete();
  }
}
