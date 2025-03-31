
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
import { BranchService } from '../../branch.service';
import { OnlyNumbersDirective } from 'src/app/shared/directive/only-numbers.directive';



@Component({
  selector: 'app-add-branch',
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    OnlyNumbersDirective
  ],
  templateUrl: './add-branch.component.html',
  styleUrl: './add-branch.component.scss'
})
export class AddBranchComponent {
companyForm!: FormGroup;
  heading:string="Add"
  countries: { value: string, label: string }[] = []; // Mock data
  @Input() Id: number = 0;
  @Input() isSideDrawerOpen: boolean = false; 
 
 @Output() formClose: EventEmitter<boolean> = new EventEmitter<boolean>();
  constructor(private fb: FormBuilder,private companyservice:BranchService,private apiservice:BussinessService,private activate:ActivatedRoute,private _successMessage:MatSnackBar,private cdr:ChangeDetectorRef) {
    this.companyservice.getAllCompany().subscribe({next:(data:any)=>{
      this.countries = [{ value: '0', label: 'Select a Company' }];  // Add the default option
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
      this.companyForm.get('companyId')?.setValue('0');
    }
 async ngOnInit() {
  
   
    this.companyForm = this.fb.group({
     
      companyId: ['0', Validators.required],
      State: ['', [Validators.required]],
      City: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required]],
      name: ['', [Validators.required]],
      Address: ['', [Validators.required]],
      gstno: ['', [Validators.required]],
      pincode: ['', [Validators.required]],
      IsActive:[""]
      
   
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
    this.companyservice.getCompanyBranchId(this.Id).subscribe({next:(data:any)=>{
      this.companyForm.patchValue({
        companyId:data.data.companyId,
        name:data.data.name,
        State:data.data.state,
        City:data.data.city,
        phoneNumber:data.data.phoneNumber,
        Address:data.data.address,
        gstno:data.data.gstno,
        pincode:data.data.pincode,
        IsActive:data.data.isActive
      })
      this.companyForm.get('companyId')?.setValue(data.data.companyId.toString());
    }})
  }
  closePopup() {
    this.formClose.emit();
  }
  iscountryfail:boolean=false;
  checkCountry(event:any)
  {
    if(Number(this.companyForm.value.companyId)>0)
    {
      this.iscountryfail=false

    }
    else{
      this.iscountryfail=true
    }
  }
  submitForm() {
    debugger
    if(Number(this.companyForm.value.companyId)>0)
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
              companyId: this.companyForm.value.companyId,
              name: this.companyForm.get("name")?.value,
              phoneNumber: this.companyForm.get("phoneNumber")?.value,
              state: this.companyForm.get("State")?.value,
              city: this.companyForm.get("City")?.value,
              address: this.companyForm.get("Address")?.value ,
              gstno: this.companyForm.get("gstno")?.value,
              pincode: this.companyForm.get("pincode")?.value,
              IsActive:this.companyForm.value.IsActive=="0"?false:true             
           }
           this.companyservice.addCompanyBranch(request).subscribe({next:(data:any)=>{
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
            companyId: this.companyForm.value.companyId,
            name: this.companyForm.get("name")?.value,
            phoneNumber: this.companyForm.get("phoneNumber")?.value,
            state: this.companyForm.get("State")?.value,
            city: this.companyForm.get("City")?.value,
            address: this.companyForm.get("Address")?.value,
            gstno: this.companyForm.get("gstno")?.value,
            pincode: this.companyForm.get("pincode")?.value ,
            IsActive:this.companyForm.value.IsActive=="0"?false:true   
          
         }
         this.companyservice.updateCompanyBranch(request).subscribe({next:(data:any)=>{
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
