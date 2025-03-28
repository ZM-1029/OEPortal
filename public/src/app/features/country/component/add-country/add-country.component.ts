
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, EventEmitter, Inject, inject, Input, Output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonService } from 'src/app/shared/services/common.service';
import { CountryService } from '../../country.service';
import { ActivatedRoute } from '@angular/router';
import { SuccessModalComponent } from 'src/app/shared/components/UI/success-modal/success-modal.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-country',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './add-country.component.html',
  styleUrl: './add-country.component.scss'
})
export class AddCountryComponent {
  countryForm!: FormGroup;
  formHeading = "Create";
  currencies = ['USD', 'INR', 'EUR', 'GBP', 'AUD', 'CAD']; // Example currencies
  countryId:number=0;
constructor(private fb: FormBuilder,private apiservice:CountryService,private route: ActivatedRoute,private _successMessage: MatSnackBar,) {}

  
  ngOnInit() {
    this.initializeForm();
    this.route.paramMap.subscribe(params => {
      this.countryId = Number(params.get('id'));
       if(this.Id>0)
       {
        this.formHeading='Update'
       }
      
    });
  }
  @Input() isSideDrawerOpen: boolean = false; // Accept the input
  @Input() Id: number = 0; // Accept country ID for edit mode
  @Output() formClose: EventEmitter<boolean> = new EventEmitter<boolean>();

  
  
  initializeForm() {
    this.countryForm = this.fb.group({
     
      IsActive: [true],
      Taxes: this.fb.array([this.createTaxField()]) // Default one tax field
    });

    if(this.Id>0)
    {
      this.patchvalue(this.Id)
    }
  }
patchvalue(id:number)
{
  debugger
  this.apiservice.GetTaxesBytaxId(id).subscribe({next:(data:any)=>{
   
      
    this.taxes.at(0).patchValue({
      TaxName: data.data.name,  // Ensure data.data.name is the correct path to the value
      TaxRate: data.data.value  // Ensure data.data.value is the correct path to the value
    });
    
    this.countryForm.patchValue({
      isFixed: data.data.isFixed  // Ensure data.data.isFixed is the correct path to the value
    });
      
    
  }})
}

  // Getter for taxes array
  get taxes() {
    return this.countryForm.get('Taxes') as FormArray;
  }

  // Create a new tax field
  createTaxField(): FormGroup {
    return this.fb.group({
      TaxName: ['', [Validators.required, Validators.pattern('[a-zA-Z ]*')]], // Only letters and spaces
      TaxRate: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
    });
  }

  // Add a new tax field
  addTax() {
    this.taxes.push(this.createTaxField());
  }

  // Remove a tax field
  removeTax(index: number) {
    this.taxes.removeAt(index);
  }

  // Reset the form
  resetForm() {
    this.countryForm.reset();
    this.initializeForm();
  }

  // Submit the form
  createUpdate() {
    if (this.countryForm.valid) {
      console.log(this.countryForm.value)
      var count=0;
      var count1=0;
      debugger
      this.countryForm.get("Taxes")?.value.forEach((element:any,index:any) => {
        var para=
        {
          countryId: this.countryId,
          isFixed: this.countryForm.get("IsActive")?.value,
          name: element.TaxName,
          value: element.TaxRate,
          
        }
        count1++
        if(index==0&&this.Id>0)
        {
          Object.assign(para, { id: this.Id });
          this.apiservice.UpdateCountryTaxes(para).subscribe(data=>{
            count++
            if(count==count1)
              {
                this.showSuccessMessage("Tax Added/Updated successfully");
             this.formClose.emit(true)
              }
            
          })
        }
        else{
          this.apiservice.AddCountryTaxes(para).subscribe(data=>{
            
              count++
              if(count==count1)
                {
                  this.showSuccessMessage("Tax Added/Updated successfully");
               this.formClose.emit(true)
                }
          })
        }
      
        
      });
  
    } else {
      this.countryForm.markAllAsTouched(); // Highlight errors
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
  closePopup() {
    this.formClose.emit();
  }
}
