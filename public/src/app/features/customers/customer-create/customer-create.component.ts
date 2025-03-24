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
import { MatIconModule } from "@angular/material/icon";

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
    MatIconModule
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
      Id:[0],
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
     
      
      Logo: [""],
      LogoFile: [""],
      Country: ["", [Validators.pattern("^[a-zA-Z]*$")]],
      Taxid: ["", [Validators.pattern("^[0-9]*$")]],
      billingaddressId:[0],
      BusinessType: ["", Validators.required],
      billingAttention: ['', [Validators.required, Validators.minLength(3)]],
     

      billingCity: ['', Validators.required],
      billingState: ['', Validators.required],
      billingPin: ['', [Validators.required, Validators.pattern(/^\d{5,6}$/)]],
      
      shippingaddressId:[0],
      shippingAttention: ['', [Validators.required, Validators.minLength(3)]],
    
     
      shippingCity: ['', Validators.required],
      shippingState: ['', Validators.required],
      shippingPin: ['', [Validators.required, Validators.pattern(/^\d{5,6}$/)]],
     
    });
    this.clearForm();
  }
  copyBillingToShipping(event: any) {
    if (event.target.checked) {
      this.customerForm.patchValue({
        shippingAttention: this.customerForm.value.billingAttention,
        shippingCountry: this.customerForm.value.billingCountry,
       
        shippingCity: this.customerForm.value.billingCity,
        shippingState: this.customerForm.value.billingState,
        shippingPin: this.customerForm.value.billingPin,
      
      });
    }
  }
  ngOnChanges(): void {
    
  }
  closePopup() {
    this.formClose.emit();
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
        .subscribe((response: any) => {
          console.log(response,':response')
         
            this.customerForm.patchValue({
              Id: this.Id,
              CustomerId: response.data.customer.id,
              CustomerName: response.data.customer.customerName,
              PhoneNumber: response.data.customer.phoneNumber,
              PrimaryContact: response.data.customer.primaryContact,
              Email: response.data.customer.email,
              Logo: response.data.customer.logo,
             
              Taxid: response.data.customer.taxid,
              BusinessType: response.data.customer.businessType,
            });
            if(response.data.addresses[0].isBillingAddress)
            {
              this.customerForm.patchValue({
                billingaddressId: response.data.addresses[0].id,
                billingAttention: response.data.addresses[0].address,
                
                billingPin: response.data.addresses[0].postalCode,
                billingState: response.data.addresses[0].state,
                billingCity: response.data.addresses[0].city,
               
                shippingaddressId: response.data.addresses[1].id,
                shippingAttention: response.data.addresses[1].address,
                shippingCity: response.data.addresses[1].city,
              
                shippingPin: response.data.addresses[1].postalCode,
                shippingState: response.data.addresses[1].state,
              
               
               
                
              }
            );
            }
            else{
              this.customerForm.patchValue({
                billingaddressId: response.data.addresses[1].id,
                billingAttention: response.data.addresses[1].address,
                
                billingPin: response.data.addresses[1].postalCode,
                billingState: response.data.addresses[1].state,
                billingCity: response.data.addresses[1].city,
               
                shippingaddressId: response.data.addresses[0].id,
                shippingAttention: response.data.addresses[0].address,
                shippingCity: response.data.addresses[0].city,
              
                shippingPin: response.data.addresses[0].postalCode,
                shippingState: response.data.addresses[0].state,
              
               
               
                
              }
            );
            }
            for (let key in this.customerForm.value) {
              if (key == "Logo") {
                this.customerLogoUrl = this.customerForm.value[key];
                
              } else if (key == "CustomerName") {
                this.customerName = this.customerForm.value[key];
              } else if (key == "CustomerId") {
                this.customerId = this.customerForm.value[key];
              } else if (key == "Email") {
                this.customerEmail = this.customerForm.value[key];
              }
            }
            this._changeDetetction.detectChanges();
        });
    }
  }

  // Create Edit Customer
  createUpdate() {
    this.submitted = true;
    const formData = new FormData();
    // if (!this.customerForm.valid) {
    //   this.customerForm.markAllAsTouched();
    //   return;
    // }
    
      if (this.Id < 1) {
        var customer={
      
          id: 0,
          customerName: this.customerForm.get("CustomerName")?.value,
          phoneNumber: this.customerForm.get("PhoneNumber")?.value,
          primaryContact: this.customerForm.get("PrimaryContact")?.value,
          email: this.customerForm.get("Email")?.value,
          logo: this.customerForm.get("Logo")?.value,
          logoFile: this.logoFile,
          status: true,
          country: this.customerForm.get("Country")?.value,
          taxid: this.customerForm.get("Taxid")?.value,
          businessType: this.customerForm.get("BusinessType")?.value
        }
        var address=[
          {
            id: 0,
            customerId: 0,
            postalCode: this.customerForm.get("billingPin")?.value,
            state: this.customerForm.get("billingState")?.value,
            city: this.customerForm.get("billingCity")?.value,
            address: this.customerForm.get("billingAttention")?.value,
            isBillingAddress: true
          },
          {
            id: 0,
            customerId: 0,
            postalCode: this.customerForm.get("shippingPin")?.value,
            state: this.customerForm.get("shippingState")?.value,
            city: this.customerForm.get("shippingCity")?.value,
            address: this.customerForm.get("billingAttention")?.value,
            isBillingAddress: false
          }

        ]
        var request={
          customer:customer,
          addresses:address
        }
       
        
      
        
        this._customerService.createCustomer(request).subscribe({
          next: (response: any) => {
            if (response.success) {
              console.log("Success:", response);
              this.showSuccessMessage(response.message);
              //this.resetForm();
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

        var customers={
      
          id: this.Id.toString(),
          customerName: this.customerForm.get("CustomerName")?.value,
          phoneNumber: this.customerForm.get("PhoneNumber")?.value,
          primaryContact: this.customerForm.get("PrimaryContact")?.value,
          email: this.customerForm.get("Email")?.value,
          logo: this.customerForm.get("Logo")?.value,
          logoFile: this.logoFile,
          status: true,
          country: this.customerForm.get("Country")?.value,
          taxid: this.customerForm.get("Taxid")?.value,
          businessType: this.customerForm.get("BusinessType")?.value
        }
        var addressss=[
          {
            id:  this.customerForm.get("billingaddressId")?.value,
            customerId: this.Id.toString(),
            postalCode: this.customerForm.get("billingPin")?.value,
            state: this.customerForm.get("billingState")?.value,
            city: this.customerForm.get("billingCity")?.value,
            address: this.customerForm.get("billingAttention")?.value,
            isBillingAddress: true
          },
          {
            id: this.customerForm.get("shippingaddressId")?.value,
            customerId: this.Id.toString(),
            postalCode: this.customerForm.get("shippingPin")?.value,
            state: this.customerForm.get("shippingState")?.value,
            city: this.customerForm.get("shippingCity")?.value,
            address: this.customerForm.get("billingAttention")?.value,
            isBillingAddress: false
          }

        ]
        var requestupdate={
          customer:customers,
          addresses:addressss
        }
       

      
        this._customerService.updateCustomer(this.Id, requestupdate).subscribe({
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
