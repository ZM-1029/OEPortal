import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-user-create',
  imports: [ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatFormFieldModule,
    CommonModule,FormsModule,
    MatAutocompleteModule],
  templateUrl: './user-create.component.html',
  styleUrl: './user-create.component.scss',
   encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserCreateComponent implements OnInit,AfterViewInit  {
  userForm!: FormGroup;
  formHeading: string = "Create";
  
  roles = [
    { id: 1, name: "Admin" },
    { id: 2, name: "Editor" },
    { id: 3, name: "Viewer" }
  ];

  constructor(private fb: FormBuilder,private _changeDetectorRef:ChangeDetectorRef) {}

  ngOnInit(): void {
    this.initializeForm();
    this._changeDetectorRef.detectChanges();
  }
  ngAfterViewInit(): void {
    this._changeDetectorRef.detectChanges();
  }

  private initializeForm(): void {
    this.userForm = this.fb.group({
      id: [0],
      name: ["", [Validators.required]],
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required]],
      isActive: [true], // Default to active
      roleId: ["", [Validators.required]]
    });
  }

  createUpdate() {
    if (this.userForm.valid) {
      const userData = this.userForm.value;
      console.log("User Data Submitted:", userData);
      // Send to API here
    } else {
      console.log("Form Invalid");
      this.userForm.markAllAsTouched();
    }
  }

  resetForm() {
    this.userForm.reset({
      id: 0,
      name: "",
      email: "",
      password: "",
      isActive: true,
      roleId: ""
    });
  }
}
