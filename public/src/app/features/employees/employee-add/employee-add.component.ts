import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoaderComponent } from 'src/app/shared/components/UI/loader/loader.component';
import { EmployeesService } from '../employees.service';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatIcon } from '@angular/material/icon';
import { SuccessModalComponent } from 'src/app/shared/components/UI/success-modal/success-modal.component';

@Component({
  selector: 'app-employee-add',
  imports: [ReactiveFormsModule,
    FormsModule,

    // Add Material modules
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatRadioModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIcon,
    NgIf,
    NgFor,
    MatCardModule],
  templateUrl: './employee-add.component.html',
  styleUrl: './employee-add.component.scss',
  providers: [provideNativeDateAdapter(), DatePipe],
})
export class EmployeeAddComponent implements OnInit {
  employeeForm: FormGroup;
  isLoading = false;
  isEditMode = false;
  employeeId: string | any;
  departmentList: string[] = [];
  designationList: string[] = [];
  deliveryCentersList: string[] = [];
  employeeStatusesList: string[] = [];
  billableTypesList: string[] = [];
  employeeTypeList: string[] = [];
  locationList: string[] = [];
  status: string[] = ['Active', 'Inactive'];
  title: string = 'Add Employee';
  selectedImage: string | ArrayBuffer | null = null;
  selectedImageFile: File | null = null;
  hover = false;
  defaultImage = '/assets/images/demo.jpg';
  public customerForm!: FormGroup;
  public submitted = false;
  public logoFile!: File | any;
  logoUrl: any;
  public employeeImgUrl!: string | null;
  public formHeading: string = "Create";
  public customerId: string = '';
  public editedformData = new FormData();
  @ViewChild('fileInput') fileInput!: ElementRef<any>;

  constructor(
    private _fb: FormBuilder,
    private _route: ActivatedRoute,
    private _router: Router,
    private _http: HttpClient,
    private _changeDetetction: ChangeDetectorRef,
    private _successMessage: MatSnackBar,
    private employeesService: EmployeesService,
    private _datePipe: DatePipe

  ) {
    this.employeeForm = this._fb.group({});
  }

  ngOnInit(): void {
    this.initializeForm();
    this.checkEditMode();
    this.getAllDropdown();
  }

  initializeForm(): void {
    this.employeeForm = this._fb.group({
      FirstName: ['', [Validators.required, Validators.maxLength(50), Validators.pattern("^[a-z A-Z]*$")]],
      LastName: ['', [Validators.maxLength(50)]],
      EmailID: ['', [Validators.required, Validators.email]],
      DateOfBirth: ['', Validators.required],
      EmployeeID: ['', [Validators.required]],
      Gender: ['Male'],
      Department: ['', Validators.required],
      Employeestatus: ['Active', [Validators.required]],
      Role: ['', Validators.required],
      Experience: ['', [Validators.min(0), Validators.max(50)]],
      EmployeeType: ['', Validators.required],
      Dateofexit: [''],
      OtherEmail: ['', [Validators.email]],
      LocationName: ['', Validators.required],
      Age: ['', [Validators.min(18), Validators.max(70)]],
      Designation: ['', Validators.required],
      Dateofjoining: ['', Validators.required],
      Mobile: ['', [Validators.required, Validators.pattern(/^(\+91\-?|91\-?)?\d{10}$/)]],
      WorkPhone: [''],
      Delivery_centre: [''],
      Billable_Type: [''],
      Terminal_ID: [''],
      Project_Name: [''],
      Customer_Name: [''],
      Project_ID: ['']
    });
  }

  checkEditMode(): void {
    this._route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.title = 'Update Employee';
        this.employeeId = params['id'];
        this.loadEmployeeData(this.employeeId);
        const control = this.employeeForm.get('EmployeeID');
        if (control) {
          control.disable();
        }
      }
    });
  }

  getAllDropdown() {
    this.employeesService.getLocation().subscribe(
      {
        next: ((res) => {
          this.locationList = res;
        }),
        error: ((err) => {
          this.handleError("location List not Found")
        })
      }
    );
    this.employeesService.getDepartments().subscribe(
      {
        next: ((res) => {
          this.departmentList = res;
        }),
        error: ((err) => {
          this.handleError("department List not Found")
        })
      }
    );
    this.employeesService.getDesignations().subscribe(
      {
        next: ((res) => {
          this.designationList = res;
        }),
        error: ((err) => {
          this.handleError("designation List not Found")
        })
      }
    );
    this.employeesService.getEmployeeTypes().subscribe(
      {
        next: ((res) => {
          this.employeeTypeList = res;
        }),
        error: ((err) => {
          this.handleError("designation List not Found")
        })
      }
    );
    this.employeesService.getDeliveryCenters().subscribe(
      {
        next: ((res) => {
          this.deliveryCentersList = res;
        }),
        error: ((err) => {
          this.handleError("deliveryCenters List not Found")
        })
      }
    );
    this.employeesService.getEmployeeStatuses().subscribe(
      {
        next: ((res) => {
          this.employeeStatusesList = res;
        }),
        error: ((err) => {
          this.handleError("employeeStatuses List not Found")
        })
      }
    );
    this.employeesService.getBillableTypes().subscribe(
      {
        next: ((res) => {
          this.billableTypesList = res;
        }),
        error: ((err) => {
          this.handleError("employeeStatuses List not Found")
        })
      }
    );
  }


  loadEmployeeData(id: string): void {
    this.isLoading = true;
    this.employeesService.employeeGetById(id).subscribe({
      next: (response) => {
        const employee = response.data;

        // Map API response keys to form control names
        const formData = {
          FirstName: employee.firstName,
          LastName: employee.lastName,
          EmailID: employee.emailID,
          DateOfBirth: employee.dateOfBirth ? new Date(employee.dateOfBirth) : '',
          EmployeeID: employee.employeeID,
          Gender: employee.gender || 'Male',
          Department: employee.department,
          Employeestatus: employee.employeestatus || 'Active',
          Role: employee.role,
          Experience: employee.experience,
          EmployeeType: employee.employeeType,
          Dateofexit: employee.dateofexit ? new Date(employee.dateofexit) : '',
          OtherEmail: employee.otherEmail,
          LocationName: employee.locationName,
          Age: employee.age,
          Designation: employee.designation,
          Dateofjoining: employee.dateofjoining ? new Date(employee.dateofjoining) : '',
          Mobile: employee.mobile,
          WorkPhone: employee.workPhone,
          Delivery_centre: employee.delivery_centre,
          Billable_Type: employee.billable_Type,
          Terminal_ID: employee.terminal_ID,
          Project_Name: employee.project_Name,
          Customer_Name: employee.customer_Name,
          Project_ID: employee.project_ID
        };

        // Patch form values
        this.employeeForm.patchValue(formData);

        // Set photo URL if available
        if (employee.ismanual) {
          this.employeeImgUrl = employee.photo;
        }

        if (!employee.ismanual) {
          this.employeesService
            .getImgById(this.employeeId)
            .subscribe((img: { imageUrl: string }) => {
              this.employeeImgUrl = img.imageUrl;
              this._changeDetetction.detectChanges();
            });
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.handleError('Failed to load employee data');
        this.isLoading = false;
      }
    });
  }

  formatDateForInput(dateString: string): string | null {
    if (!dateString) return null;
    return this._datePipe.transform(dateString, 'yyyy-MM-dd');
  }

  // createUpdateEmployee(): void {
  //   if (this.employeeForm.invalid) {
  //     this.handleError("Please fill all required fields correctly")
  //     this.employeeForm.markAllAsTouched();
  //     return;
  //   }
  //   // this.isLoading = true;
  //   const formData = this.prepareFormData();

  //   this.employeesService.createEmployee(formData).subscribe(
  //     {
  //       next: ((response) => {

  //       }),
  //       error: ((err) => {

  //       })
  //     }
  //   )

  // }

  // prepareFormData(): FormData {
  //   const formData = new FormData();
  //   const formValue = this.employeeForm.value;

  //   // Append all form fields
  //   Object.keys(formValue).forEach(key => {
  //     if (key === 'DateOfBirth' || key === 'Dateofjoining' || key === 'Dateofexit') {
  //       // Format dates as strings
  //       const dateValue = this._datePipe.transform(formValue[key], 'yyyy-MM-dd');
  //       formData.append(key, dateValue || '');
  //     } else {
  //       formData.append(key, formValue[key] || '');
  //     }
  //   });

  //   // Append image file if selected
  //   if (this.selectedImageFile) {
  //     formData.append('PhotoUrl', this.logoUrl);
  //   }

  //   return formData;
  // }


  // // Handles image upload
  // uploadEmployeeimg(event: any) {
  //   this.logoFile = event.target.files[0];
  //   const reader = new FileReader();
  //   reader.onload = (e: any) => {
  //     this.employeeImgUrl = e.target.result;
  //     this._changeDetetction.detectChanges();
  //   };
  //   reader.readAsDataURL(this.logoFile);
  // }

  // // Deletes the current image
  // deleteImage() {
  //   this.employeeImgUrl = null;
  //   this.logoFile = null;
  // }

  createUpdateEmployee(): void {
    if (this.employeeForm.invalid) {
      this.handleError("Please fill all required fields correctly");
      this.employeeForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formData = this.prepareFormData();
    // let formValue: any
    // if (this.employeeId) {
    //   formValue = this.employeeForm.getRawValue();
    // } else {
    //   formValue = this.employeeForm.value;
    // }
    // Debug: Log final FormData before sending
    formData.forEach((value, key) => {
      console.log(`Sending ${key}:`, value);
    });

    const apiCall$ = this.isEditMode
      ? this.employeesService.editEmployee(formData, this.employeeId)
      : this.employeesService.createEmployee(formData);

    apiCall$.subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.showSuccessMessage(
            response.message
            // this.isEditMode ? 'Employee updated successfully' : 'Employee created successfully'
          );
          this._router.navigate(['admin/employee']);
        } else {
          this.handleError(
            response.message 
          );
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.handleError(
          err.error.message ||
          `Failed to ${this.isEditMode ? 'update' : 'create'} employee. ` +
          'Please check all fields and try again.'
        );
        console.error('API Error Details:', err);
      }
    });
  }

  navigateBack() {
    this._router.navigate(['admin/employee']);
  }
  prepareFormData(): FormData {
    const formData = new FormData();
    let formValue: any;
    if (this.isEditMode) {
      formValue = this.employeeForm.getRawValue()
    } else {
      formValue = this.employeeForm.value;
    }

    // Append all form fields
    Object.keys(formValue).forEach(key => {
      if (formValue[key] !== null && formValue[key] !== undefined) {
        if (key === 'DateOfBirth' || key === 'Dateofjoining' || key === 'Dateofexit') {
          const dateValue = this._datePipe.transform(formValue[key], 'yyyy-MM-dd');
          if (dateValue) {
            formData.append(key, dateValue);
          }
        } else {
          formData.append(key, formValue[key].toString());
        }
      }
    });

    // Append image file if selected
    if (this.logoFile) {
      formData.append('PhotoUrl', this.logoFile, this.logoFile.name);
    } else if (this.employeeImgUrl && typeof this.employeeImgUrl === 'string') {
      // For existing images (in edit mode) that are URLs
      formData.append('PhotoUrl', this.employeeImgUrl);
    }

    return formData;
  }

  // Handles image upload
  uploadEmployeeimg(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.logoFile = file;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.employeeImgUrl = e.target.result;
      this._changeDetetction.detectChanges();
    };
    reader.readAsDataURL(file);
  }
  // Deletes the current image
  deleteImage() {
    this.employeeImgUrl = null;
    this.logoFile = null;
    // If you want to clear the file input as well
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  // 
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
    this._successMessage.open(err, "Close", {
      duration: 4000,
      panelClass: ["error-toast"],
      verticalPosition: "top",
      horizontalPosition: "right",
    });
  }
  // 
}