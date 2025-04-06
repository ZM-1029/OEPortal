import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SalesService } from '../sales.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SafePipe } from "../safe.pipe";

@Component({
  selector: 'app-approve-quatation',
  imports: [CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    SafePipe
  ],
  templateUrl: './approve-quatation.component.html',
  styleUrl: './approve-quatation.component.scss'
})
export class ApproveQuatationComponent {
  isLoading:boolean = false; 
  approveForm!: FormGroup;
  selectedFile: File | null = null;
  errorMessage: string = '';
  showFileUpload: boolean = false;
  quotationStatus: any[] = [];
  pdfUrl: string | null = null;
  pdfSrc: SafeResourceUrl | undefined;
  @Input() isApprovePopupOpen: boolean = false;
  @Input() Id: number = 0;
  @Output() formClose = new EventEmitter<boolean>();
  invoiceUrl: string='';

  constructor( private sanitizer: DomSanitizer ,private fb: FormBuilder, private _salesService: SalesService, private _successMessage: MatSnackBar, private cdr: ChangeDetectorRef) {
    this.createForm();
   
  }
  ngOnInit(): void {
    this.isLoading=true;
    this.getQuotationDetails(this.Id);
    this.getQuotationStatus(this.Id);
    this.downloadPDF()

  }
  private handleError(err: any) {
    this._successMessage.open(err.error.message, "Close", {
      duration: 4000,
      panelClass: ["error-toast"],
      verticalPosition: "top",
      horizontalPosition: "right",
    });
  }
  getQuotationDetails(quotationId: number) {
    this._salesService.getQuotationStatusDetails(quotationId).subscribe({
      next: (response: any) => {
        if (response && response.success) {
          const isSelfApproved = response.data.isSelfApproved || false;
          const isApprovedByAccountant = response.data.isApprovedByAccountant || false;
          const invoice = response.data.invoice || null;
          this.approveForm.patchValue({
            selfApprove: isSelfApproved,
            approveByAccountant: isApprovedByAccountant,
          });
          if (invoice) {
            this.invoiceUrl = invoice;
            console.log(this.invoiceUrl, 'this.invoiceUrl');

          }
          const approveByAccountantControl = this.approveForm.get('approveByAccountant');
          if (isSelfApproved) {
            approveByAccountantControl?.enable();
          } else {
            approveByAccountantControl?.disable();
          }
          this.showFileUpload = isApprovedByAccountant;
        }
      },
      error: (error) => {
        this.handleError(error);
      }
    });
  }

  getQuotationStatus(quotationId: number) {
    this._salesService.getQuotationStatus(quotationId).subscribe({
      next: (response: any) => {
        if (response && response.success) {
          this.quotationStatus = response.data;
          this.cdr.detectChanges();
          console.log(this.quotationStatus, 'this.quotationStatus ')
        }
      },
      error: (error) => {
        this.handleError(error);
      }
    });
  }
  createForm() {
    this.approveForm = this.fb.group({
      selfApprove: [false],
      approveByAccountant: [false],
      file: [null]
    });
  }
  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (allowedTypes.includes(file.type)) {
        this.selectedFile = file;
        this.approveForm.patchValue({ file: file });
        this.errorMessage = '';
      } else {
        this.selectedFile = null;
        this.errorMessage = 'Only PDF and image files (JPEG, PNG) are allowed.';
        event.target.value = '';
      }
    }
  }
  downloadPDF(): void {
    this._salesService.downloadPDF(this.Id).subscribe({
      next: (response: any) => {
        // Create a Blob from the response
        const blob = new Blob([response], { type: 'application/pdf' });

        // Create an Object URL for the Blob
        const url = window.URL.createObjectURL(blob);

        // Sanitize the Object URL and assign it to pdfSrc
        this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        console.log(this.pdfSrc)

        // Optionally, revoke the URL after some time
  
      this.isLoading=false;
      this.cdr.detectChanges()
      },
      error: (error) => {
        console.error('PDF download error:', error);
        this._successMessage.open('Failed to load PDF.', 'Close', {
          duration: 3000,
          panelClass: ['error-toast'],
        });
        this.isLoading=false;
      },
    });
  }


  reset() {
    this.approveForm.reset();
    this.selectedFile = null;
  }

  submitForm() {
    if (this.approveForm.valid) {
      const formData = new FormData();
      formData.append('QuotationId', this.Id.toString());
      formData.append('IsSelfApproved', this.approveForm.value.selfApprove ? 'true' : 'false');
      formData.append('IsApprovedByAccountant', this.approveForm.value.approveByAccountant ? 'true' : 'false');
      // debugger;
      // formData.append('IsSelfApproved', this.approveForm.value.selfApprove);
      // formData.append('IsApprovedByAccountant', this.approveForm.value.approveByAccountant==undefined?'false':'true');

      // formData.append('Invoice', this.selectedFile ? this.selectedFile : '');
      if (this.selectedFile) {
        formData.append('Invoice', this.selectedFile);
      }
      this._salesService.approveQuotation(formData).subscribe({
        next: (response: any) => {
          if (response && response.success) {
            this._successMessage.open('Approval submitted successfully!', 'Close', {
              duration: 3000,
            });
          }
          this.formClose.emit(true);
        },
        error: (error: HttpErrorResponse) => {
          this.handleError(error);
        }
      });
    } else {
      this.approveForm.markAllAsTouched();
    }
  }

  onToggleChange() {
    const isApproved = this.approveForm.get('approveByAccountant')?.value;
    this.showFileUpload = isApproved;
  }
  closePopup() {
    this.formClose.emit();
  }
 
  downloadInvoice(): void {
    const link = document.createElement('a');
    link.href = this.invoiceUrl;
    link.target = '_blank';
    link.download = this.invoiceUrl.split('/').pop() || 'invoice.jpg';
    link.click();
  }
  
  
  
  

}
