import { Component, Inject, Optional } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MarketingService } from '../../marketing.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SuccessModalComponent } from 'src/app/shared/components/UI/success-modal/success-modal.component';
import { finalize } from 'rxjs/operators';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoaderComponent } from 'src/app/shared/components/UI/loader/loader.component';

@Component({
  selector: 'app-add-pdf',
  imports: [MatButtonModule, MatIconModule, CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,MatProgressSpinnerModule,LoaderComponent],
  templateUrl: './add-pdf.component.html',
  styleUrl: './add-pdf.component.scss',
})
export class AddPdfComponent {
  cardForm!: FormGroup;
  headingPdf:string='Add'
  previewImage: string | ArrayBuffer | null = null;
  previewPdf: string | ArrayBuffer | null = null;
  showForm = true;
  logoFile: File | null = null;
  pdfFile: File | null = null;
  id: number = 0;
  isSubmitting: boolean = false;
  isSaveBtnAble:boolean=false;
  constructor(
    private fb: FormBuilder,
    private marketingService: MarketingService,
    public dialogRef: MatDialogRef<AddPdfComponent>,
    private _successMessage: MatSnackBar,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: number
  ) { }

  ngOnInit(): void {
    this.id = this.data;
    this.cardForm = this.fb.group({
      title: ['', Validators.required],
      subtitle: ['', Validators.required],
      showButton: [false],
      image: [null ],
      pdf: [null ],
    });

    if (this.id) {
      this.headingPdf='Edit'
      this.marketingService.getMarketingById(this.id).subscribe({
        next: (res: any) => {
          const marketing = res.data;
          this.cardForm.patchValue({
            title: marketing.heading,
            subtitle: marketing.description,
          });

          this.previewImage = marketing.logoUrl;
          this.pdfFile = marketing.pdf;
        },
        error: () => {
          alert('Failed to load marketing data.');
        },
      });
    }
  }


  onImageChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.logoFile = file;
      this.cardForm.patchValue({ image: file });

      const reader = new FileReader();
      reader.onload = () => (this.previewImage = reader.result);
      reader.readAsDataURL(file);
    }
  }

  onPdfChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.pdfFile = file;
      this.cardForm.patchValue({ pdf: file });
    }
  }

 

  onSubmit() {
    if (this.cardForm.valid) {
      this.isSubmitting = true; 
      const formData = new FormData();
      formData.append('Heading', this.cardForm.value.title);
      formData.append('Description', this.cardForm.value.subtitle);
  
      if (this.logoFile) {
        formData.append('Logo', this.logoFile);
      }else{
        formData.append('Logo', 'null');
      }
  
      if (this.pdfFile instanceof File) {
        formData.append('Pdf', this.pdfFile);
      }else{
        formData.append('Pdf', 'null');
      }
  
      if (this.id > 0) {
        formData.append('id', this.id.toString());
        this.updateMarketing(this.id, formData);
      } else {
        this.createMarketing(formData);
      }
    }
  }
  

  createMarketing(formdata: FormData) {
    this.marketingService.createMarketing(formdata).pipe(
      finalize(() => this.isSubmitting = false)
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.showSuccessMessage(response.message);
          this.dialogRef.close(true);
        } else {
          this.handleError(response.message);
          this.dialogRef.close(false);
        }
      },
      error: (err) => {
        if(err.error.errors.Pdf &&  err.error.errors.Logo){
          this.handleError('The files is required');
        }else if(err.error.errors.Pdf){
          this.handleError(err.error.errors.Pdf[0]);
        }else if(err.error.errors.Logo[0]){
          this.handleError(err.error.errors.Pdf[0]);
        }else{
          this.handleError(err.error.message);
        }
        
        this.dialogRef.close(false);
      }
    });
    
  }

  updateMarketing(id: number, formData: FormData) {
    this.marketingService.updateMarketingById(id, formData).pipe(
      finalize(() => this.isSubmitting = false)
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.showSuccessMessage(response.message);
          this.dialogRef.close(true);
        } else {
          this.handleError(response.message);
          this.dialogRef.close(false);
        }
      },
      error: (err) => {
        if(err.error.errors.Pdf &&  err.error.errors.Logo){
          this.handleError('The files is required');
        }else if(err.error.errors.Pdf){
          this.handleError(err.error.errors.Pdf[0]);
        }else if(err.error.errors.Logo[0]){
          this.handleError(err.error.errors.Pdf[0]);
        }else{
          this.handleError(err.error.message);
        }
        this.dialogRef.close(false);
      }
    });
    
  }


  cancel(): void {
    this.dialogRef.close(false);
  }

  clearForm(): void {
    this.cardForm.reset();
    this.previewImage = null;
    this.logoFile = null;
    this.pdfFile = null;
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
