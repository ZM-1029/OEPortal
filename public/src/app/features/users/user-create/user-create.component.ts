import { AsyncPipe, CommonModule, NgFor } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, Observable, startWith, map } from 'rxjs';
import { SuccessModalComponent } from 'src/app/shared/components/UI/success-modal/success-modal.component';
import { RoleService } from '../../roles/role.service';
import { UserService } from '../user.service';

interface Role {
  id: number;
  name: string;
}

@Component({
  selector: 'app-user-create',
  imports: [ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    FormsModule,
    MatAutocompleteModule,
    MatIconModule,MatButtonModule],
  templateUrl: './user-create.component.html',
  styleUrl: './user-create.component.scss',
   encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserCreateComponent implements OnInit, OnDestroy  {
  public userForm!: FormGroup;
  public submitted = false;
  public formHeading: string = "Create";
  private _unsubscribeAll$: Subject<any> = new Subject<any>();
  @ViewChild('fileInput') fileInput!: ElementRef<any>;
  @Input() Id: number = 0;
  @Output() formClose: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() isSideDrawerOpen!: boolean;
  public hide = true;
  @ViewChild("input") input!: ElementRef<any>;
@ViewChild('autoTrigger') autoTrigger!: MatAutocompleteTrigger;

  // Searchable Dropdown - Start
    rolesList: Role[] = [];
    filteredRoles: Role[]=[];
    // Searchable Dropdown - End
  constructor(
    private _formBuilder: FormBuilder,
    private _userService: UserService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _successMessage: MatSnackBar,
    private roleService:RoleService
  ) { }

  ngOnInit(): void {
    this.userForm = this._formBuilder.group({
      id: ["0"],
      name: ["", [Validators.required, Validators.pattern("^[a-z A-Z]*$")]],
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
      roleId: [""],
      roleName: [""],
    });
    this.getRoles();
    if(this.Id!==0){
      this.getUserDetails(this.Id)
    }
  }


  getRoles() {
    this.roleService.getActiveRoles().subscribe((response: any) => {
      if (response.success) {
        this.rolesList = response.data;
        console.log(this.rolesList, "Role List");
        this.filteredRoles=[...response.data]
        this._changeDetectorRef.detectChanges();
      }
    });
  }


  clearForm() {
    if (this.isSideDrawerOpen) {
      if (this.Id < 1) {
        this.formHeading = "Create";
        this.userForm.reset();
      } else {
        this.formHeading = "Update";
        this.getUserDetails(this.Id);
        this._changeDetectorRef.detectChanges();
      }
    }
  }

  getUserDetails(id: number) {
    if (id !== 0) {
      this.Id = id;
      this._userService
        .getUserById(id)
        .subscribe((response: any) => {
          if (response.success) {
            this.userForm.patchValue(response.data);
            this.userForm.patchValue({roleId:response.data.roleId});
            this._changeDetectorRef.detectChanges();
          }
        });
    }
  }

  createUpdate() {
    this.submitted = true;
    const userData = {
      id: this.userForm.get('id')?.value,
      name: this.userForm.get('name')?.value,
      email: this.userForm.get('email')?.value,
      password: this.userForm.get('password')?.value,
      roleId: this.userForm.get('roleId')?.value
    };
    
    if (!this.userForm.valid) {
      this.userForm.markAllAsTouched();
      return;
    }
    if (this.Id < 1) {
      this._userService.createUser(userData).subscribe({
        next: (response: any) => {
          this.showSuccessMessage(response.message);
          this.resetForm();
          this.formClose.emit(true);
        },
        error: (err) => this.handleError(err),
      });
    } else {
      this._userService.updateUser(userData).subscribe({
        next: (response: any) => {
          this.showSuccessMessage(response.message);
          this.resetForm();
          this.formClose.emit(true);
        },
        error: (err) => this.handleError(err),
      });
    }
  }

  resetForm() {
    this.submitted = false;
    this.userForm.reset();
    this.userForm.markAsPristine();
    this.userForm.markAsUntouched();
  }

  onRoleSelected(event: MatAutocompleteSelectedEvent) {
    const selectedrole = this.rolesList.find(
      (role) => role.name === event.option.viewValue
    );
    if (selectedrole) {
      console.log(event,"onRoleSelected","selectedrole",selectedrole.id);
      this.userForm.patchValue({roleId:selectedrole.id})
    }
    
  }

filter(): void {
    const filterValue = this.input.nativeElement.value.toLowerCase();
    this.filteredRoles = this.rolesList.filter((role) =>
      role.name.toLowerCase().includes(filterValue)
    );
  }

  @HostListener('document:click', ['$event'])
    onClickOutside(event: Event) {
  if (this.input && this.input.nativeElement !== event.target && !this.input.nativeElement.contains(event.target)) {
    if (this.autoTrigger && this.autoTrigger.panelOpen) { 
      this.autoTrigger.closePanel();
      this._changeDetectorRef.detectChanges(); // Ensure UI updates
    }
  }
}


  onSelectCustomer(event: MatAutocompleteSelectedEvent): void {
    const selectedCustomer = this.rolesList.find(
      (customer) => customer.name === event.option.viewValue
    );
    if (selectedCustomer) {
      this.userForm.patchValue({ roleId: selectedCustomer.id })
    }
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

  ngOnDestroy(): void {
    this.resetForm();
    this._unsubscribeAll$.next(null);
    this._unsubscribeAll$.complete();
  }
}
