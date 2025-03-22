import { AfterContentChecked, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from "@angular/core";
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatNativeDateModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router, ActivatedRoute, RouterLink } from "@angular/router";
import { AuthenticationService } from "src/app/core/auth/authentication.service";
import { SuccessModalComponent } from "src/app/shared/components/UI/success-modal/success-modal.component";

@Component({
  selector: "app-sign-in",
  imports: [MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    FormsModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatCheckboxModule, MatIconModule],
  templateUrl: "./sign-in.component.html",
  styleUrl: "./sign-in.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInComponent implements OnInit, AfterContentChecked {
  hide = true;
  returnUrl: string;
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required)
  })

  constructor(private router: Router, private route: ActivatedRoute, private authenticationService: AuthenticationService,
    private _successMessage: MatSnackBar, private _changeDetectorRef:ChangeDetectorRef
  ) {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/shop'
  }

  ngOnInit(): void {
  }
  ngAfterContentChecked(): void {
    this._changeDetectorRef.detectChanges();
  }

  onForgotpassword() {
    this.router.navigate(['forgot-password'], { relativeTo: this.route.parent });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.authenticationService.login(this.loginForm.value)
        .subscribe(
            {
          complete: () => { },
          error: (error) => {
            if(error.status=='401' || error.error.success){
              this.handleError(error.error.message)
            }
          },
          next: (response) => {
            if(response.success){
              this.router.navigateByUrl('/admin/employee')
            }else{
              this.handleError(response.message)
            } 
          },
          }
        );
    }
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
  
}
