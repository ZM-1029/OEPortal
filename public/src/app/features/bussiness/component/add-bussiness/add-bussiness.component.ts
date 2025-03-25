import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { BussinessService } from '../../bussiness.service';
import { ActivatedRoute } from '@angular/router';
import { SuccessModalComponent } from 'src/app/shared/components/UI/success-modal/success-modal.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-bussiness',
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule
  ],
  templateUrl: './add-bussiness.component.html',
  styleUrl: './add-bussiness.component.scss'
})
export class AddBussinessComponent {
  businessForm!: FormGroup;
 
  countries: { value: string, label: string }[] = []; // Mock data
  @Input() Id: number = 0;
  @Input() isSideDrawerOpen: boolean = false; 
  serviceid:number=0
 @Output() formClose: EventEmitter<boolean> = new EventEmitter<boolean>();
  constructor(private fb: FormBuilder,private apiservice:BussinessService,private activate:ActivatedRoute,private _successMessage:MatSnackBar) {
    this.apiservice.getAllCountry().subscribe({next:(data:any)=>{
      this.countries = [{ value: '0', label: 'Select a country' }];  // Add the default option
      data.data.forEach((country:any) => {
        this.countries.push({
          value: country.id.toString(),  // Make sure the id is a string to bind with value
          label: country.name
        });
      });
    }})
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
  ngOnInit(): void {
    this.activate.paramMap.subscribe(params => {
      this.serviceid = Number(params.get('id'));
      
      
    });
    this.businessForm = this.fb.group({
     
      Country: ['0', Validators.required],
      Terms: ['', [Validators.required, Validators.minLength(10)]],
   
    });

    this.patchValue()
  }
  patchValue()
  {
    debugger
    this.apiservice.GetCountryTermsConditionById(this.Id).subscribe({next:(data:any)=>{
      this.businessForm.patchValue({
        Country:data.countryId,
        Terms:data.data.termsAndConditions
      })
    }})
  }

  submitForm() {
    if (this.businessForm.valid) {
      console.log('Form Data:', this.businessForm.value);
      if(this.Id<=0)
        {
          debugger
           var request={
            
              id: 0,
              serviceId: this.serviceid,
              countryId: this.businessForm.value.Country,
              termsAndConditions: this.businessForm.get("Terms")?.value
            
           }
           this.apiservice.AddCountryTermandCondition(request).subscribe({next:(data:any)=>{
               if(data.success)
               {
                this.showSuccessMessage(data.message)
                this.formClose.emit(true)
                
               }
           }})
        }
        else{
          debugger;
          var request={
            
            id: this.Id,
            serviceId: this.serviceid,
            countryId: this.businessForm.value.Country,
            termsAndConditions: this.businessForm.get("Terms")?.value
          
         }
         this.apiservice.UpdateCountryTermsCondition(request).subscribe({next:(data:any)=>{
             if(data.success)
             {
              this.showSuccessMessage(data.message)
              this.formClose.emit(true)
              
             }
         }})
        }
       
    } else {
      this.businessForm.markAllAsTouched();
     
       
    }
  }
}
