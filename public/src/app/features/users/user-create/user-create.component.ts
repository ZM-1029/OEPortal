import { AsyncPipe, CommonModule, NgFor } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
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
    AsyncPipe,
    MatIconModule,MatButtonModule,NgFor],
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
  // private _unsubscribeAll$!: Subject<any> = new Subject<any>();

  // Searchable Dropdown - Start
    roleControl = new FormControl<string | Role>('');
    rolesList: Role[] = [];
    filteredRoles!: Observable<Role[]>;
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
      roleId: [""]
    });
    this.getRoles();
    if(this.Id!==0){
      this.getUserDetails(this.Id)
    }
  }
  displayFn(user: any): string {
    return user && user.name ? user.name : '';
  }

  getRoles() {
    this.roleService.getActiveRoles().subscribe((response: any) => {
      if (response.success) {
        this.rolesList = response.data;
        console.log(this.rolesList, "Role List");
        this.initializeFilter();
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
        // this.userForm.controls['UserId'].disable()
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
            this.roleControl.patchValue(response.data.roleName)
            this._changeDetectorRef.detectChanges();
          }
        });
    }
  }

  createUpdate() {
    this.submitted = true;
    console.log(this.userForm.value);
    
    if (!this.userForm.valid) {
      this.userForm.markAllAsTouched();
      return;
    }
    if (this.Id < 1) {
      this._userService.createUser(this.userForm.value).subscribe({
        next: (response: any) => {
          this.showSuccessMessage(response.message);
          this.resetForm();
          this.formClose.emit(true);
        },
        error: (err) => this.handleError(err),
      });
    } else {
      // this._userService.updateUser(this.Id, this.userForm.value).subscribe({
      //   next: (response: any) => {
      //     this.showSuccessMessage(response.message);
      //     this.resetForm();
      //     this.formClose.emit(true);
      //   },
      //   error: (err) => this.handleError(err),
      // });
    }
  }

  resetForm() {
    this.submitted = false;
    this.userForm.reset();
    this.userForm.markAsPristine();
    this.userForm.markAsUntouched();
  }

  initializeFilter() {
    this.filteredRoles = this.roleControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.name;
        return name ? this._filterRoles(name) : this.rolesList.slice();
      })
    );
  }

 private _filterRoles(name: string): Role[] {
    const filterValue = name.toLowerCase();
    return this.rolesList.filter(role => role.name.toLowerCase().includes(filterValue));
  }

  displayRoleFn(role: Role): string {
    return role ? role.name : '';
  }

  onRoleSelected(event: MatAutocompleteSelectedEvent) {
    const selectedRole = event.option.value;
    this.userForm.patchValue({roleId:selectedRole.id})
    // this.selectedRole = selectedRole.id
    // console.log('Selected Role ID:', this.selectedRole);
    // this.fetchRolePermissions(selectedRole.id);
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
