import { ChangeDetectionStrategy, Component, Inject, OnInit, Optional, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { DeleteModalComponent } from 'src/app/shared/components/UI/delete-modal/delete-modal.component';
import { RoleService } from '../role.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgIf } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SuccessModalComponent } from 'src/app/shared/components/UI/success-modal/success-modal.component';

@Component({
  selector: 'app-role-create',
  imports: [MatButtonModule, MatIconModule, ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule, NgIf],
  templateUrl: './role-create.component.html',
  styleUrl: './role-create.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleCreateComponent implements OnInit {
  constructor(private roleService: RoleService, private _successMessage: MatSnackBar,
    public dialogRef: MatDialogRef<RoleCreateComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: string,
  ) { }
  roleForm!: FormGroup;
  isSubmitted = false;
  ngOnInit(): void {
    this.roleForm = new FormGroup({
      roleName: new FormControl('', [ Validators.minLength(3)])
    });
    this.dialogRef.backdropClick().subscribe(() => {
      this.cancel(false); // Close without validating
    });
  }

  createRole(): void {
    this.isSubmitted = true;
    if (this.roleForm.valid) {
      const roleName = { name: this.roleForm.value.roleName };
      this.roleService.createRole(roleName).subscribe(
        {
          next: ((response: any) => {
            if (response.success) {
              this.showSuccessMessage(response.message)
              this.dialogRef.close(true);
            } else {
              this.handleError(response.message)
            }
          }), error: ((err) => {
            this.handleError(err.error.message)
          })
        }
      );
    } else {
      this.roleForm.markAllAsTouched();
    }
  }

  //   cancel(): void {
  //   this.isSubmitted = false;
  //   this.roleForm.reset(); // ✅ Reset form to untouched + empty
  //   this.dialogRef.close(false);
  // }
  cancel(result: boolean = false): void {
    this.isSubmitted = false;
    this.roleForm.reset(); // Reset form values
    this.roleForm.markAsUntouched(); // Explicitly mark as untouched
    this.roleForm.markAsPristine(); // Mark as pristine
    this.dialogRef.close(false);
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

  private handleError(err: any) {
    console.error("Error Status:", err.status);
    console.error("Error Message:", err.error);
    this._successMessage.open(err, "Close", {
      duration: 4000,
      panelClass: ["error-toast"],
      verticalPosition: "top",
      horizontalPosition: "right",
    });
  }
}
