import { ChangeDetectorRef, Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import {  FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { QuillModule } from 'ngx-quill';

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
    ReactiveFormsModule,
    QuillModule
  ],
  templateUrl: './add-bussiness.component.html',
  styleUrl: './add-bussiness.component.scss'
})
export class AddBussinessComponent {
  businessForm!: FormGroup;
  heading:string="Add"
  countries: { value: string, label: string }[] = []; // Mock data
  @Input() Id: number = 0;
  @Input() isSideDrawerOpen: boolean = false; 
  serviceid:number=0
 @Output() formClose: EventEmitter<boolean> = new EventEmitter<boolean>();
  constructor(private fb: FormBuilder,private apiservice:BussinessService,private activate:ActivatedRoute,private _successMessage:MatSnackBar,private cdr:ChangeDetectorRef) {
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
      this.businessForm.reset()
      this.businessForm.get('Country')?.setValue('0');
    }
 async ngOnInit() {
  
    this.activate.paramMap.subscribe(params => {
      this.serviceid = Number(params.get('id'));
      
      
    });
    this.businessForm = this.fb.group({
     
      Country: ['0', Validators.required],
      Terms: ['', [Validators.required, Validators.minLength(10)]],
   
    });
if(this.Id>0)
{
  this.heading="Update"
  this.patchValue()
}
    
  }
  editorModules = {
    toolbar: [
      [{ font: [] }, { size: [] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }], // 🎨 Add Text & Background Colors
      [{ script: "sub" }, { script: "super" }],
      [{ header: 1 }, { header: 2 }, "blockquote", "code-block"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      ["link", "image", "video"]
    ]
  };
  patchValue()
  {
    debugger
    this.apiservice.GetCountryTermsConditionById(this.Id).subscribe({next:(data:any)=>{
      this.businessForm.patchValue({
        
        Terms:data.data.termsAndConditions
      })
      this.businessForm.get('Country')?.setValue(data.data.countryId.toString());
    }})
  }
  closePopup() {
    this.formClose.emit();
  }
  iscountryfail:boolean=false;
  checkCountry(event:any)
  {
    if(Number(this.businessForm.value.Country)>0)
    {
      this.iscountryfail=false

    }
    else{
      this.iscountryfail=true
    }
  }
  submitForm() {
    debugger
    if(Number(this.businessForm.value.Country)>0)
      {
        this.iscountryfail=false
  
      }
      else{
        this.iscountryfail=true
        this.cdr.detectChanges()
        return
      }
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
