

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

import { OnlyNumbersDirective } from 'src/app/shared/directive/only-numbers.directive';
import { CompanybanklistService } from '../../companybanklist.service';


@Component({
  selector: 'app-addcompanybank',
  standalone:true,
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
  templateUrl: './addcompanybank.component.html',
  styleUrl: './addcompanybank.component.scss'
})
export class AddcompanybankComponent {
companyForm!: FormGroup;
  heading:string="Add"
  countries: { value: string, label: string }[] = []; // Mock data
  @Input() Id: number = 0;
  @Input() isSideDrawerOpen: boolean = false; 
 
 @Output() formClose: EventEmitter<boolean> = new EventEmitter<boolean>();
  constructor(private fb: FormBuilder,private companyservice:CompanybanklistService,private apiservice:BussinessService,private activate:ActivatedRoute,private _successMessage:MatSnackBar,private cdr:ChangeDetectorRef) {
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
      accountType: ['', [Validators.required]],
      ifscCode: ['', [Validators.required]],
      sortCode: ['', [Validators.required]],
      bankName: ['', [Validators.required]],
      accountNumber: ['', [Validators.required]],
    
      swissCode: ['', [Validators.required]],
      isPrimary:['1']
      
   
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
    this.companyservice.getCompanyBankId(this.Id).subscribe({next:(data:any)=>{
      this.companyForm.patchValue({
        companyId:data.data.companyId,
        accountType:data.data.accountType,
        ifscCode:data.data.ifscCode,
        sortCode:data.data.sortCode,
        bankName:data.data.bankName,
        accountNumber:data.data.accountNumber,
        swissCode:data.data.swissCode, 
        isPrimary:data.data.isPrimary
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
      const formData = {
        id: this.Id > 0 ? this.Id : 0,
        companyId: this.companyForm.value.companyId,
        accountType: this.companyForm.get("accountType")?.value,
        ifscCode: this.companyForm.get("ifscCode")?.value,
        sortCode: this.companyForm.get("sortCode")?.value,
        bankName: this.companyForm.get("bankName")?.value,
        accountNumber: this.companyForm.get("accountNumber")?.value,
        swissCode: this.companyForm.get("swissCode")?.value,
        isPrimary: this.companyForm.value.isPrimary=="0"?false:true
      };

      const serviceCall = this.Id > 0 
        ? this.companyservice.updateCompanyBank(formData)
        : this.companyservice.addCompanyBank(formData);

      serviceCall.subscribe({
        next: (data: any) => {
          if (data.success) {
            this.showSuccessMessage(data.message);
            this.formClose.emit(true);
          }
        }
      });
    } else {
      this.companyForm.markAllAsTouched();      
    }
  }
}
