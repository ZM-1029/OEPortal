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
    
  ],
  templateUrl: './approve-quatation.component.html',
  styleUrl: './approve-quatation.component.scss'
})
export class ApproveQuatationComponent {

  approveForm!: FormGroup;
  selectedFile: File | null = null;
  errorMessage: string = '';
  showFileUpload: boolean = false;

  @Input() isApprovePopupOpen: boolean = false;
  @Input() Id: number = 0;
  @Output() formClose = new EventEmitter<boolean>();

  constructor(private fb: FormBuilder, private _salesService: SalesService, private _successMessage: MatSnackBar, private cdr: ChangeDetectorRef) {
    this.createForm();
  }
  ngOnInit(): void {
    this.getQuotationDetails(this.Id);
  }
  getQuotationDetails(quotationId: number) {
    this._salesService.getQuotationStatusDetails(quotationId).subscribe({
      next: (response: any) => {
        if (response && response.success) {
          const isSelfApproved = response.data.isSelfApproved || false;
          const isApprovedByAccountant = response.data.isApprovedByAccountant || false;

          this.approveForm.patchValue({
            selfApprove: isSelfApproved,
            approveByAccountant: isApprovedByAccountant,
            invoice: response.data.invoice || null
          });
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
        console.error('Error fetching quotation details:', error);
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
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Quotation_${this.Id}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('PDF download error:', error);
        this._successMessage.open('Failed to download PDF.', 'Close', {
          duration: 3000,
          panelClass: ['error-toast'],
        });
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
      formData.append('Invoice', this.selectedFile ? this.selectedFile : '');

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
          this._successMessage.open('Submission failed.', 'Close', {
            duration: 3000,
          });
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
}
