import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { BussinessService } from 'src/app/features/bussiness/bussiness.service';
import { SuccessModalComponent } from 'src/app/shared/components/UI/success-modal/success-modal.component';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { CompanyService } from '../../company.service';


@Component({
  selector: 'app-add-company',
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    QuillModule
  ],
  templateUrl: './add-company.component.html',
  styleUrl: './add-company.component.scss'
})
export class AddCompanyComponent {
 companyForm!: FormGroup;
  heading:string="Add"
  countries: { value: string, label: string }[] = []; // Mock data
  @Input() Id: number = 0;
  @Input() isSideDrawerOpen: boolean = false; 
 
 @Output() formClose: EventEmitter<boolean> = new EventEmitter<boolean>();
  constructor(private fb: FormBuilder,private companyservice:CompanyService,private apiservice:BussinessService,private activate:ActivatedRoute,private _successMessage:MatSnackBar,private cdr:ChangeDetectorRef) {
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
    reset(){
      debugger
      this.companyForm.reset()
      this.companyForm.get('Country')?.setValue('0');
    }
 async ngOnInit() {
  
   
    this.companyForm = this.fb.group({
     
      Country: ['0', Validators.required],
      headquater: ['', [Validators.required]],
      name: ['', [Validators.required]],
      IsActive:['']
   
    });
if(this.Id>0)
{
  this.heading="Update"
  this.patchValue()
}
    
  }
 
  patchValue()
  {
    debugger
    this.companyservice.getCompanyProfileById(this.Id).subscribe({next:(data:any)=>{
      this.companyForm.patchValue({
        headquater:data.data.headquater,
        name:data.data.name,
        Terms:data.data.termsAndConditions,
        IsActive:data.data.isActive
      })
      this.companyForm.get('Country')?.setValue(data.data.countryId.toString());
    }})
  }
  closePopup() {
    this.formClose.emit();
  }
  iscountryfail:boolean=false;
  checkCountry(event:any)
  {
    if(Number(this.companyForm.value.Country)>0)
    {
      this.iscountryfail=false

    }
    else{
      this.iscountryfail=true
    }
  }
  submitForm() {
    debugger
    if(Number(this.companyForm.value.Country)>0)
      {
        this.iscountryfail=false
  
      }
      else{
        this.iscountryfail=true
        this.cdr.detectChanges()
        return
      }
    if (this.companyForm.valid) {
      console.log('Form Data:', this.companyForm.value);
      if(this.Id<=0)
        {
          debugger
           var request={
              id: 0,
              countryId: this.companyForm.value.Country,
              name: this.companyForm.get("name")?.value,
              headquater: this.companyForm.get("headquater")?.value,
              IsActive: this.companyForm.get("IsActive")?.value
            
           }
           this.companyservice.addCompanyProfile(request).subscribe({next:(data:any)=>{
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
              countryId: this.companyForm.value.Country,
              name: this.companyForm.get("name")?.value,
              headquater: this.companyForm.get("headquater")?.value,
              IsActive: this.companyForm.get("IsActive")?.value
          
         }
         this.companyservice.updateCompanyProfile(request).subscribe({next:(data:any)=>{
             if(data.success)
             {
              this.showSuccessMessage(data.message)
              this.formClose.emit(true)        
             }
         }})
        }
       
    } else {
      this.companyForm.markAllAsTouched();      
    }
  }
}
